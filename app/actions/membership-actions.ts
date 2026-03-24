'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function selectPlan(plan: 'basic' | 'pro' | 'enterprise') {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { redirectTo: '/login' }
    }

    // 1. Find profile by auth_user_id (UUID)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any;

    if (profile) {
      // 2. Update separate user_membership table using Admin Client as per new requirements
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminAuth = createAdminClient();
      
      const { error: membershipError } = await adminAuth.from('user_membership').upsert({
        profile_id: profile.id,
        basic_template: plan === 'basic',
        premium_template: plan === 'pro' || plan === 'enterprise'
      }, { onConflict: 'profile_id' });

      if (membershipError) {
        console.error("User Membership Save Error:", membershipError);
        throw new Error(`Failed to save user membership: ${membershipError.message}`);
      }
    } else {
      console.error("Profile not found for user:", user.id);
      throw new Error("User profile not found. Please re-login.");
    }

    // 2. Update Auth metadata for additional security
    await supabase.auth.updateUser({
      data: {
        membership_selected: true,
        plan: plan
      }
    })

    // 3. Fallback: Set HTTP-Only cookies
    const cookieStore = await cookies();
    cookieStore.set('s22_plan', plan, { path: '/', maxAge: 60 * 60 * 24 });
    cookieStore.set('s22_membership', 'true', { path: '/', maxAge: 60 * 60 * 24 });

    revalidatePath('/membership')
    return { success: true, redirectTo: '/payment' }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}
