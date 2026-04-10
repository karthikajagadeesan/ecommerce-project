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
    const { license_key, domain } = await req.json();

    if (!license_key || !domain) {
      return NextResponse.json({ 
        success: false,
        valid: false, 
        reason: 'Missing credentials: License key and domain URL are required' 
      }, { status: 400 });
    }

    // Normalize domains for comparison
    const normalizedRequestDomain = domain.replace(/\/$/, '').toLowerCase();

    // 1. Fetch license using Admin Client to bypass RLS (requests are unauthenticated)
    const admin = createAdminClient();
    const { data: licenseData, error: licenseError } = await admin
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .maybeSingle();

    if (licenseError) {
      console.error(`[RESTRICTED] License lookup failed for key: "${license_key}". Error:`, licenseError);
      return NextResponse.json({ 
        success: false,
        valid: false, 
        reason: 'Error verifying license key.',
        detail: licenseError.message
      }, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!licenseData) {
      console.error(`[RESTRICTED] Key not found: "${license_key}"`);
      return NextResponse.json({ 
        success: false,
        valid: false, 
        reason: 'invalid license key or domain',
        detail: 'No matching license key found in database.'
      }, { 
        status: 403,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const license = licenseData as Tables<'licenses'>;
    const normalizedDBDomain = (license?.domain_url || '').replace(/\/$/, '').toLowerCase();

    // 2. Check payment and status
    if (license.payment_status !== 'completed' || license.status !== 'active') {
      console.error(`[RESTRICTED] Key "${license_key}" rejected. Payment: ${license.payment_status}, Status: ${license.status}`);
      return NextResponse.json({ 
        success: false,
        valid: false, 
        reason: 'License is inactive or payment is pending',
        detail: `License status is ${license.status} and payment status is ${license.payment_status}`
      }, { 
        status: 403,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Domain Validation & Auto-registration
    // If the license doesn't have a domain yet, we register it
    if (!license.domain_url) {
      console.log(`[REGISTERED] Key "${license_key}" bound to new domain: "${domain}"`);
      const { error: updateError } = await (admin
        .from('licenses') as any)
        .update({ domain_url: domain })
        .eq('id', license.id);

      if (updateError) {
        return NextResponse.json({ 
          valid: false, 
          reason: 'Failed to bind domain to license' 
        }, { 
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    } else if (normalizedDBDomain !== normalizedRequestDomain) {
      console.error(`[RESTRICTED] Domain mismatch for key "${license_key}"! DB expects "${license.domain_url}", but request sent "${domain}".`);
      return NextResponse.json({ 
        success: false,
        valid: false, 
        reason: 'invalid license key or domain' 
      }, { 
        status: 403,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 4. Log API Usage (Internal tracking)
    if (license.user_id) {
       await admin.from('api_usage').insert({
         user_id: license.user_id,
         endpoint: '/api/validate-license'
       } as any);
    }

    // Fetch name if profile exists (Optional but helpful)
    let userName = 'Member';
    if (license.user_id) {
      const { data: profileData } = await admin
        .from('profiles')
        .select('name')
        .eq('id', license.user_id)
        .single();
      const profile = profileData as Tables<'profiles'> | null;
      if (profile?.name) userName = profile.name;
    }

    // 5. Fetch Allowed Layouts that EXACTLY match the user's plan
    // (As requested, premium users should only see premium layouts, not basic)
    const userPlanRaw = license.plan || 'Basic';
    
    const { data: allowedLayouts } = await admin
      .from('layouts')
      .select('layout_name, layout_type')
      .eq('layout_type', userPlanRaw);

    // 6. Success Response including domain and headers as requested
    const requestHeaders = Object.fromEntries(req.headers.entries());

    return NextResponse.json({
      success: true,
      valid: true,
      domain_url: domain,
      user_name: userName,
      plan: userPlanRaw,
      layouts: allowedLayouts || [],
      headers: requestHeaders,
      message: 'License validated successfully'
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false,
      valid: false, 
      reason: 'An internal server error occurred during validation' 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    reason: 'Method Not Allowed. Please use POST with JSON body containing license_key and domain.' 
  }, { 
    status: 405,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}
