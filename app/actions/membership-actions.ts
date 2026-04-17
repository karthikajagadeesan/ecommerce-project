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
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single() as any;

    if (profile) {
      // Record a "pending" payment entry to track plan selection
      const adminAuth = createAdminClient();
      const { error: paymentError } = await (adminAuth.from('payments') as any).insert({
        user_id: profile.id,
        plan_name: membershipPlan.plan_name,
        price: membershipPlan.price,
        validity_days: membershipPlan.validity_days,
        payment_status: 'pending',
        name: profile.name
      });

      if (paymentError) {
        console.error("Payment Record Error:", paymentError);
        throw new Error(`Failed to record plan selection: ${paymentError.message}`);
      }
    } else {
      console.error("Profile not found for user:", user.id);
      throw new Error("User profile not found. Please re-login.");
    }

    // 4. Update Auth metadata (Keep this as it helps with UI state)
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

    revalidatePath('/upgrade-membership')
    revalidatePath('/payment')
    return { success: true, redirectTo: '/payment' }
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function getMembershipPlans() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('membership')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error
    return { data: data as Tables<'membership'>[] }
  } catch (err: any) {
    console.error('Error fetching membership plans:', err)
    return { error: err.message || 'Failed to fetch membership plans' }
  }
}

export async function getCurrentUserMembership() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any)

    if (profileError || !profile) return { error: 'Profile not found' }

    const { data: membership, error: membershipError } = await supabase
      .from('user_membership')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (membershipError) throw membershipError

    return { data: membership as Tables<'user_membership'> | null }
  } catch (err: any) {
    console.error('Error fetching current membership:', err)
    return { error: err.message || 'Failed to fetch current membership' }
  }
}

export async function getUserMembershipHistory() {
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
      .from('user_membership')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data as Tables<'user_membership'>[] }
  } catch (err: any) {
    console.error('Error fetching membership history:', err)
    return { error: err.message || 'Failed to fetch membership history' }
  }
}
