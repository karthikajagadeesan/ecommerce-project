'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Simulated Email Service (As per ecommerce.md Section 8)
async function sendConfirmationEmail(userEmail: string, userName: string, plan: string, amountPaid: number) {
  // In a production environment, this would use Resend, SendGrid, or AWS SES.
  // We simulate the network delay of sending an email.
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const emailContent = `
    ===================================================
    EMAIL SENT TO: ${userEmail}
    SUBJECT: Payment Successful - Welcome to Solution22 Premium!
    
    Hi ${userName || 'Valued Customer'},
    
    Thank you for your purchase! Here is your receipt:
    - Plan: ${plan.toUpperCase()} Membership
    - Amount Paid: $${amountPaid}
    - Date: ${new Date().toLocaleDateString()}
    
    ACTION REQUIRED:
    1. Download your WordPress Plugin ZIP file here: https://yourdomain.com/downloads/s22-plugin-latest.zip
    2. Upload it to your WordPress site under Plugins > Add New.
    3. Activate the plugin and enter the license key you copied from our website.
    
    NOTE: For security reasons, your license key is NOT included in this email.
    If you lose your key, you must generate a new one from your dashboard.
    
    Welcome aboard!
    ===================================================
  `;
  
  console.log(emailContent);
  return true;
}

export async function processPaymentSuccess(domainUrl: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { redirectTo: '/login' }
    }

    // 1. Find numerical profile ID using auth_user_id (UUID)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('auth_user_id', user.id)
      .single() as any;

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminAuth = createAdminClient();

    // 1. Fetch the latest "pending" Payment record to know what plan was selected
    const { data: latestPending } = await adminAuth
      .from('payments')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as any;

    if (!latestPending) {
      throw new Error("No pending payment found. Please select a plan again.");
    }

    const plan = latestPending.plan_name;
    const amountPaid = latestPending.price;
    const validity = latestPending.validity_days || 365;
    const userName = profile?.name || user.user_metadata?.full_name || '';

    // 2. Update the Payment record to 'completed'
    await (adminAuth.from('payments') as any)
      .update({
        domain_url: domainUrl,
        amount: amountPaid,
        payment_status: 'completed',
        name: userName
      })
      .eq('id', latestPending.id);

    // 3. Update Membership Statuses
    // 3a. Set current active memberships to 'completed'
    await (adminAuth.from('user_membership') as any)
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('user_id', profile?.id)
      .eq('status', 'active');

    // Also update all active website_access records to the new plan name
    await (adminAuth.from('website_access') as any)
      .update({ 
        plan_name: plan,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', profile?.id)
      .eq('status', 'active');

    // 3b. Insert the NEW membership as 'active'
    const { data: masterPlan } = await adminAuth
      .from('membership')
      .select('*')
      .eq('plan_name', plan)
      .maybeSingle() as any;

    await (adminAuth.from('user_membership') as any).insert({
      user_id: profile?.id,
      membership_id: masterPlan?.id,
      plan_name: plan,
      price: amountPaid,
      validity_days: validity,
      plan_limit: masterPlan?.plan_limit || 1,
      membership_json: masterPlan,
      status: 'active',
      name: userName,
      start_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 4. Check if user already has an active license for this domain
    const { data: existingLicense } = await adminAuth
      .from('licenses')
      .select('license_key')
      .eq('user_id', profile?.id)
      .eq('domain_url', domainUrl)
      .eq('status', 'active')
      .maybeSingle() as any;

    let licenseKey = existingLicense?.license_key;
    let redirectTo = '/dashboard';

    // 5. Generate unique license key ONLY if none exists (Initial purchase)
    if (!licenseKey) {
      const prefix = "S22"
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      const generatePart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
      licenseKey = `${prefix}-${generatePart()}-${generatePart()}-${generatePart()}-${generatePart()}`
      redirectTo = '/license';

      // Create the Domain-Locked License
      try {
        await (adminAuth.from('licenses') as any).insert({
          license_key: licenseKey,
          user_id: profile?.id,
          plan: plan,
          payment_status: 'completed',
          status: 'active',
          validity_period: validity,
          domain_url: domainUrl,
          name: userName
        });
      } catch (e: any) {
        console.warn("License Insert Error:", e.message);
      }
    } else {
      // If updating/renewing, we might want to update the license record's plan/validity
      await (adminAuth.from('licenses') as any)
        .update({
          plan: plan,
          validity_period: validity,
          payment_status: 'completed'
        })
        .eq('license_key', licenseKey);
    }

    const cookieStore = await cookies();
    cookieStore.set({ name: 's22_mock_license', value: licenseKey, path: '/', maxAge: 60 * 5 });
    cookieStore.set({ name: 's22_mock_plan', value: plan, path: '/', maxAge: 60 * 5 });
    cookieStore.set({ name: 's22_mock_domain', value: domainUrl, path: '/', maxAge: 60 * 5 });
    cookieStore.set({ name: 's22_dashboard_approved', value: 'true', path: '/', maxAge: 60 * 60 * 24 });

    // 6. Trigger Confirmation Email
    await sendConfirmationEmail(user.email || profile?.email || 'user@example.com', userName, plan, amountPaid);

    revalidatePath('/license')
    revalidatePath('/upgrade-membership')
    revalidatePath('/dashboard')
    revalidatePath('/site-access')

    // 7. Update or Add the payment domain to website_access
    try {
      const { data: existingSite } = await adminAuth
        .from('website_access')
        .select('id')
        .eq('user_id', profile?.id)
        .eq('domain_url', domainUrl)
        .maybeSingle() as any;

      if (existingSite) {
        // If it exists, just update the plan and ensure it remains active
        await (adminAuth.from('website_access') as any)
          .update({
            plan_name: plan,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSite.id);
      } else {
        // If it's a new domain, we can follow the history logic for a clean transition
        await (adminAuth.from('website_access') as any).insert({
          user_id: profile?.id,
          plan_name: plan,
          domain_url: domainUrl,
          site_name: 'Primary Site',
          status: 'active',
          name: userName
        });
      }
    } catch (siteError: any) {
      console.warn("Auto-site update/registration failed:", siteError.message);
    }
    
    return { success: true, redirectTo: redirectTo }
  } catch (err: any) {
    console.error('Payment processing error:', err);
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function getUserLicenses() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await (supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any)

    if (!profile) return { error: 'Profile not found' }

    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as any[] }
  } catch (err: any) {
    console.error('Error fetching user licenses:', err)
    return { error: err.message || 'Failed to fetch licenses' }
  }
}
