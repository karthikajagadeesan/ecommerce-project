import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { license_key, layout_id } = await req.json();

    if (!license_key || !layout_id) {
       return NextResponse.json({ success: false, reason: 'Missing parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch and Validate license
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .single();

    if (error || !license || license.payment_status !== 'completed' || license.status !== 'active') {
       return NextResponse.json({ success: false, reason: 'Invalid or inactive license' }, { status: 403 });
    }

    // 2. Check Plan Level Access
    const planAccess = {
      basic: ['layout_1'],
      pro: ['layout_1', 'layout_2', 'layout_3'],
      enterprise: ['layout_1', 'layout_2', 'layout_3', 'layout_4']
    };

    const allowedLayouts = planAccess[license.plan as keyof typeof planAccess] || [];
    if (!allowedLayouts.includes(layout_id)) {
       return NextResponse.json({ success: false, reason: 'Upgrade plan for this layout' }, { status: 403 });
    }

    // 3. Log Layout Fetch
    if (license.user_id) {
      await supabase.from('api_usage').insert({
        user_id: license.user_id,
        endpoint: '/api/layout-data'
      });
    }

    // 4. Deliver Mock Content (Converted from PHP to Next.js data)
    // In real app, this might come from a DB or specific JSON files
    const layoutContent = {
       layout_1: {
         name: "Grid Rotation",
         structure: "nextjs_compatible",
         components: [
           { type: "grid", columns: 3, gap: "20px" },
           { type: "animation", preset: "rotation_glass" }
         ],
         theme: "S22 Premium"
       },
       layout_2: {
         name: "Accordion Slider",
         structure: "nextjs_compatible",
         components: [
           { type: "flex", wrap: false },
           { type: "animation", preset: "horizontal_accordion" }
         ],
         theme: "S22 Coffee"
       },
       layout_3: {
         name: "Pattern Grid",
         structure: "nextjs_compatible",
         components: [
           { type: "masonry", sequence: "1-2-1" },
           { type: "animation", preset: "fade_translate" }
         ],
         theme: "S22 Modern"
       },
       layout_4: {
         name: "Info Cards",
         structure: "nextjs_compatible",
         components: [
           { type: "list", variant: "badge_info" }
         ],
         theme: "S22 Industrial"
       }
    };

    return NextResponse.json({
      success: true,
      layout_id: layout_id,
      data: layoutContent[layout_id as keyof typeof layoutContent]
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, reason: 'Internal server error' }, { status: 500 });
  }
}
