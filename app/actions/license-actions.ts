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

    const cookieStore = await cookies();
    const fallbackPlan = cookieStore.get('s22_plan')?.value;
    const plan = (profile?.plan || user.user_metadata?.plan || fallbackPlan) as 'basic' | 'pro' | 'enterprise';

    if (!plan) {
      return { redirectTo: '/membership' }
    }

    const planPrices: Record<string, number> = { basic: 29, pro: 79, enterprise: 199 };
    const amountPaid = planPrices[plan] || 0;

    // 2. Generate unique license key (S22-XXXX-XXXX-XXXX-XXXX format)
    const prefix = "S22"
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const generatePart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
    const licenseKey = `${prefix}-${generatePart()}-${generatePart()}-${generatePart()}-${generatePart()}`

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminAuth = createAdminClient();

    // 3. Record the Payment in the payments table
    await (adminAuth.from('payments') as any).insert({
      user_id: profile?.id,
      domain_url: domainUrl,
      amount: amountPaid,
      payment_status: 'completed'
    });

    // 4. Create the Domain-Locked License
    try {
      const { error: insertError } = await (adminAuth.from('licenses') as any).insert({
        license_key: licenseKey,
        user_id: profile?.id,
        plan: plan,
        payment_status: 'completed',
        status: 'active',
        validity_period: 365,
        domain_url: domainUrl, // Locked to the domain
      });
      if (insertError) {
         console.warn("Service Role DB Insert Error:", insertError);
      }
    } catch (e: any) {
      console.warn("Admin Client Fallback triggered.", e.message);
    }

    cookieStore.set('s22_mock_license', licenseKey, { path: '/', maxAge: 60 * 5 }); // Valid for 5 mins
    cookieStore.set('s22_mock_plan', plan, { path: '/', maxAge: 60 * 5 });
    cookieStore.set('s22_mock_domain', domainUrl, { path: '/', maxAge: 60 * 5 });
    
    // Also approve Dashboard access
    cookieStore.set('s22_dashboard_approved', 'true', { path: '/', maxAge: 60 * 60 * 24 });

    // 5. Trigger Confirmation Email (Section 8 of ecommerce.md)
    const userName = profile?.name || user.user_metadata?.full_name || '';
    await sendConfirmationEmail(user.email || profile?.email || 'user@example.com', userName, plan, amountPaid);

    revalidatePath('/license')
    return { success: true, redirectTo: '/license' }
  } catch (err: any) {
    console.error('Payment processing error:', err);
    return { error: err.message || 'An unexpected error occurred' }
  }
}
