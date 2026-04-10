'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { Database, Tables, TablesInsert } from '@/types/database-type'
import { createAdminClient } from '@/lib/supabase/admin'

export async function selectPlan(planId: number) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { redirectTo: '/login' }
    }

    // 1. Fetch current plan data from master membership table
    const { data: membershipPlan, error: planError } = await supabase
      .from('membership')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single() as any;

    if (planError || !membershipPlan) {
      throw new Error(`Plan not found: ${planError?.message || 'Invalid plan'}`);
    }

    // 2. Find profile by auth_user_id (UUID)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any;

    if (profile) {
      const adminAuth = createAdminClient();
      
      // 1. Manually check for existing membership to avoid 'ON CONFLICT' syntax errors
      const { data: existing } = await (adminAuth.from('user_membership') as any)
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      const membershipData = {
        profile_id: profile.id,
        membership_id: membershipPlan.id,
        plan_name: membershipPlan.plan_name,
        price: membershipPlan.price,
        validity_days: membershipPlan.validity_days,
        plan_limit: membershipPlan.plan_limit,
        membership_json: membershipPlan,
        status: 'active',
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let saveError;
      if (existing) {
        // 2. Perform Update
        const { error } = await (adminAuth.from('user_membership') as any)
          .update(membershipData)
          .eq('id', existing.id);
        saveError = error;
      } else {
        // 3. Perform Insert
        const { error } = await (adminAuth.from('user_membership') as any)
          .insert(membershipData);
        saveError = error;
      }

      if (saveError) {
        console.error("User Membership Save Error:", saveError);
        throw new Error(`Failed to save user membership: ${saveError.message}`);
      }
    } else {
      console.error("Profile not found for user:", user.id);
      throw new Error("User profile not found. Please re-login.");
    }

    // 4. Update Auth metadata
    await supabase.auth.updateUser({
      data: {
        membership_selected: true,
        plan: membershipPlan.plan_name
      }
    })

    // 5. Fallback: Set HTTP-Only cookies
    const cookieStore = await cookies();
    cookieStore.set({ name: 's22_plan', value: membershipPlan.plan_name, path: '/', maxAge: 60 * 60 * 24 });
    cookieStore.set({ name: 's22_membership', value: 'true', path: '/', maxAge: 60 * 60 * 24 });

    revalidatePath('/membership')
    return { success: true, redirectTo: '/payment' }
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: err.message || 'An unexpected error occurred' }
  }
}
