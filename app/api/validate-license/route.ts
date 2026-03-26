import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { license_key, domain } = await req.json();

    if (!license_key || !domain) {
      return NextResponse.json({ valid: false, reason: 'Missing parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch license
    const { data: license, error } = await (supabase
      .from('licenses')
      .select('*, profiles(name)')
      .eq('license_key', license_key)
      .single() as any);

    if (error || !license) {
      return NextResponse.json({ valid: false, reason: 'Key not found' });
    }

    // 2. Check payment status
    if (license.payment_status !== 'completed') {
      return NextResponse.json({ valid: false, reason: 'Payment incomplete' });
    }

    // 3. Domain Check (domain_url is renamed from domain in migration)
    if (!license.domain_url) {
      await (supabase
        .from('licenses') as any)
        .update({ domain_url: domain })
        .eq('id', license.id);
    } else if (license.domain_url !== domain) {
      return NextResponse.json({ valid: false, reason: 'Domain mismatch' });
    }

    // 4. Log API Usage
    if (license.user_id) {
       await (supabase.from('api_usage') as any).insert({
         user_id: license.user_id,
         endpoint: '/api/validate-license'
       });
    }

    // Calculate days remaining
    const now = new Date();
    const createdAt = new Date(license.created_at);
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + (license.validity_period || 365));
    const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    return NextResponse.json({
      valid: true,
      user_name: (license.profiles as any)?.name || 'Member',
      validity_remaining_days: daysLeft,
      plan: license.plan
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ valid: false, reason: 'Internal server error' }, { status: 500 });
  }
}
