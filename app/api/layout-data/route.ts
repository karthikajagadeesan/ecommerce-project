import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database, Tables } from '@/types/database-type';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { license_key, domain, layout_id } = await req.json();

    if (!license_key || !domain || !layout_id) {
       return NextResponse.json({ 
         success: false, 
         reason: 'Missing parameters: License key, domain, and layout ID are required' 
       }, { 
         status: 400,
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
    }

    // 1. Fetch and Validate license strictly (Using Admin Client to bypass RLS for external API call)
    const admin = createAdminClient();
    const { data: licenseData, error: licenseError } = await admin
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .maybeSingle();

    if (licenseError) {
       return NextResponse.json({ 
         success: false, 
         reason: 'Error verifying license key.',
         detail: licenseError.message
       }, { 
         status: 500,
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
    }

    if (!licenseData) {
       return NextResponse.json({ success: false, reason: 'invalid license key or domain', detail: 'No matching license key found in database.' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const license = licenseData as Tables<'licenses'>;
    const normalizedRequestDomain = domain.replace(/\/$/, '').toLowerCase();
    const normalizedDBDomain = (license.domain_url || '').replace(/\/$/, '').toLowerCase();

    // 2. Validate Domain and Status
    if (license.status !== 'active' || license.payment_status !== 'completed') {
       return NextResponse.json({ 
         success: false, 
         reason: 'License is not active or payment is incomplete',
         detail: `License status is ${license.status} and payment status is ${license.payment_status}`
       }, { 
         status: 403, 
         headers: { 'Access-Control-Allow-Origin': '*' } 
       });
    }

    if (normalizedDBDomain !== normalizedRequestDomain) {
      console.error(`[LAYOUT-RESTRICTION] Domain mismatch. DB: "${license.domain_url}", Request: "${domain}"`);
      return NextResponse.json({ success: false, reason: 'invalid license key or domain' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 3. Plan Level Access Check (Dynamic from layouts table)
    const { data: layoutInfo, error: layoutError } = await admin
      .from('layouts')
      .select('layout_type')
      .eq('layout_name', layout_id)
      .single();

    if (layoutError || !layoutInfo) {
       return NextResponse.json({ 
         success: false, 
         reason: `Layout ${layout_id} not found in master registry.` 
       }, { 
         status: 404,
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
    }

    const requiredPlanRaw = (layoutInfo as any).layout_type;
    const requiredPlan = requiredPlanRaw.toLowerCase();
    const userPlanRaw = license.plan || 'basic';
    const userPlan = userPlanRaw.toLowerCase();

    // Hierarchy check: Premium includes Basic
    const isAllowed = (userPlan === requiredPlan) || (userPlan === 'premium' && requiredPlan === 'basic');

    if (!isAllowed) {
       return NextResponse.json({ 
         success: false, 
         reason: `Your ${userPlanRaw} plan does not have access to ${layout_id} (requires ${requiredPlanRaw}).` 
       }, { 
         status: 403,
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
    }

    // 4. Usage Count Check (Fetch dynamic limits from user_membership)
    if (!license.user_id) {
       return NextResponse.json({ success: false, reason: 'unauthorized: profile missing' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { data: userMembership } = await admin
      .from('user_membership')
      .select('plan_limit')
      .eq('profile_id', license.user_id as number)
      .single();

    const maxAllowed = (userMembership as any)?.plan_limit || (userPlan === 'premium' ? 2 : 1);

    // We check how many unique layouts the user has already requested
    const { data: usageData } = await admin
      .from('api_usage')
      .select('endpoint')
      .eq('user_id', license.user_id as number)
      .like('endpoint', '/api/layout-data/%');

    const usageEntries = (usageData || []) as any[];
    const uniqueRequestedLayouts = Array.from(new Set(usageEntries.map(u => u.endpoint.split('/').pop())));
    
    // If this layout is new, check limits
    if (!uniqueRequestedLayouts.includes(layout_id)) {
        const currentCount = uniqueRequestedLayouts.length;

        if (currentCount >= maxAllowed) {
            return NextResponse.json({ 
                success: false, 
                reason: `License limit reached. Your ${userPlanRaw} plan allows choosing only ${maxAllowed} unique layout(s). Currently used: ${currentCount}.` 
            }, { 
                status: 403,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // 5. Log Layout Fetch
    if (license.user_id) {
      await (admin.from('api_usage') as any).insert({
        user_id: license.user_id,
        endpoint: `/api/layout-data/${layout_id}`
      });
    }

    // 5. Fetch most recent submission for this license and layout to provide real data in the script
    const layoutContentData = (layoutInfo as any).layout_data;
    const { data: submissionData } = await admin
      .from('layout_submissions')
      .select('image_metadata, appearance, videos, id')
      .eq('license_key', license_key)
      .eq('layout_id', layout_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const submission = submissionData as any;
    const requestHeaders = Object.fromEntries(req.headers.entries());
    const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/layout/${layout_id}${submission ? `?submission_id=${submission.id}` : ''}`;

    // Map the real data to ensure titles and image URLs are correct if a submission is found
    const responseData = submission && Array.isArray(submission.image_metadata) 
      ? (() => {
          const videosArray: Array<{ image_id: string; video_url: string }> =
            Array.isArray(submission.videos) ? submission.videos : [];
          return submission.image_metadata.map((item: any, idx: number) => {
            const appearance = submission.appearance || {};
            const details = appearance.image_details?.[idx] || {};
            const matchedVideo = videosArray.find((v) => v.image_id === item.id);
            return {
              ...item,
              image_url: item.image_url || item.url,
              url: item.url || item.image_url,
              video_url: matchedVideo?.video_url ?? item.video_url ?? undefined,
              // Synchronized naming from appearance (new schema) with fallback to image_metadata fields
              name: details.title || item.title || 'Asset ' + (idx + 1),
              profession: details.subtitle || item.subtitle || 'User Uploaded',
              content: details.description || 'Synchronized from WordPress Dashboard',
              // Main layout-level titles
              s_title: appearance.layout_title || 'REAL UPLOADED ASSETS',
              s_cont: appearance.layout_description || 'Displaying your freshly synced content from WordPress.',
            };
          });
        })()
      : layoutContentData;

    return NextResponse.json({
      success: true,
      layout_id: layout_id,
      domain_url: domain,
      headers: requestHeaders,
      embed_url: embedUrl,
      submission_id: submission?.id,
      data: responseData
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      reason: 'Internal server error' 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    reason: 'Method Not Allowed. Please use POST with JSON body containing license_key, domain, and layout_id.' 
  }, { 
    status: 405,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}
