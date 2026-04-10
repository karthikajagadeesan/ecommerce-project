import { NextRequest, NextResponse } from 'next/server';
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
    const { layout_id, image_metadata, appearance, videos, license_key } = await req.json();

    if (!layout_id || !image_metadata || !license_key) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: layout_id, image_metadata, and license_key are required' 
      }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 1. Validate license key
    const admin = createAdminClient();
    const { data: license, error: licenseError } = await admin
      .from('licenses')
      .select('id, status, payment_status')
      .eq('license_key', license_key)
      .maybeSingle();

    if (licenseError) {
      console.error('License verification error:', licenseError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error verifying license key.',
        detail: licenseError.message
      }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (!license || (license as any).status !== 'active' || (license as any).payment_status !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid or inactive license key',
        detail: !license ? 'No matching license key found in database.' : `License status is ${(license as any).status} and payment status is ${(license as any).payment_status}`
      }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 2. Re-upload images to local Ecommerce Storage for independence
    const ecOwnedImages = [];
    if (Array.isArray(image_metadata)) {
      for (const img of image_metadata) {
        try {
          const wpUrl = img.image_url || img.url;
          if (!wpUrl) continue;

          // Fetch from WordPress storage
          const response = await fetch(wpUrl);
          const blob = await response.blob();
          
          const fileExt = wpUrl.split('.').pop()?.split('?')[0] || 'jpg';
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `processed/${fileName}`;

          // Upload to eCommerce storage ('layouts' bucket)
          const { error: uploadError } = await admin.storage
            .from('layouts')
            .upload(filePath, blob, {
                contentType: response.headers.get('content-type') || 'image/jpeg'
            });

          if (uploadError) {
            console.error('EC Upload Error:', uploadError);
            ecOwnedImages.push(img); // Fallback to original if upload fails
            continue;
          }

          const { data: { publicUrl } } = admin.storage
            .from('layouts')
            .getPublicUrl(filePath);

          ecOwnedImages.push({
            ...img,
            url: publicUrl,
            image_url: publicUrl,
            original_wp_url: wpUrl
          });
        } catch (err) {
          console.error('Image processing failed for', img.id, err);
          ecOwnedImages.push(img);
        }
      }
    }

    // 2.5 Re-upload videos to local Ecommerce Storage for independence
    const ecOwnedVideos = [];
    if (Array.isArray(videos)) {
      for (const vid of videos) {
        try {
          const wpUrl = vid.video_url || vid.url;
          if (!wpUrl) continue;

          const response = await fetch(wpUrl);
          const blob = await response.blob();
          
          const fileExt = wpUrl.split('.').pop()?.split('?')[0] || 'mp4';
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `processed_videos/${fileName}`;

          const { error: uploadError } = await admin.storage
            .from('layouts')
            .upload(filePath, blob, {
                contentType: response.headers.get('content-type') || 'video/mp4'
            });

          if (uploadError) {
            console.error('EC Video Upload Error:', uploadError);
            ecOwnedVideos.push(vid);
            continue;
          }

          const { data: { publicUrl } } = admin.storage
            .from('layouts')
            .getPublicUrl(filePath);

          ecOwnedVideos.push({
            ...vid,
            url: publicUrl,
            video_url: publicUrl,
            original_wp_url: wpUrl
          });
        } catch (err) {
          console.error('Video processing failed for', vid.id, err);
          ecOwnedVideos.push(vid);
        }
      }
    }


    // 3. Store layout submission with EC-owned images and videos
    const { data: submission, error: submissionError } = await (admin.from('layout_submissions') as any)
      .insert({
        layout_id,
        image_metadata: ecOwnedImages as any,
        appearance: appearance as any,
        videos: ecOwnedVideos as any,
        license_key
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission Error:', submissionError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to store layout data' 
      }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 4. Fetch full layout data
    const { data: layoutDetails, error: layoutError } = await admin
      .from('layouts')
      .select('layout_name, layout_data')
      .eq('layout_name', layout_id)
      .single();

    // 5. Return the stored data and the layout details for immediate rendering
    const typedSubmission = submission as any;
    return NextResponse.json({
      success: true,
      message: 'Layout and images synchronized to Ecommerce storage and database.',
      data: {
        submission_id: typedSubmission.id,
        layout_id: typedSubmission.layout_id,
        images: typedSubmission.image_metadata,
        videos: typedSubmission.videos,
        appearance: typedSubmission.appearance,
        submitted_at: typedSubmission.created_at,
        layout_details: layoutDetails ? (layoutDetails as any).layout_data : null,
        embed_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/layout/${typedSubmission.layout_id}?submission_id=${typedSubmission.id}`
      }
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An internal server error occurred' 
    }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
