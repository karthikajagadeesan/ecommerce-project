'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { Tables, TablesInsert } from '@/types/database-type'

export async function getWebsiteAccess() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any;

    if (!profile) return { error: 'Profile not found' }

    const { data, error } = await supabase
      .from('website_access')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as Tables<'website_access'>[] }
  } catch (err: any) {
    console.error('Error fetching website access:', err)
    return { error: err.message || 'Failed to fetch website access' }
  }
}

export async function addWebsiteAccess(planName: string, domainUrl: string, siteName: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single() as any;

    if (!profile) return { error: 'Profile not found' }

    // Check limit and get current membership status
    const { data: userMembership } = await supabase
      .from('user_membership')
      .select('status, plan_limit, validity_days')
      .eq('user_id', profile.id)
      .eq('plan_name', planName)
      .eq('status', 'active')
      .maybeSingle() as any;

    const { data: membershipPlan } = await supabase
      .from('membership')
      .select('site_access')
      .eq('plan_name', planName)
      .single() as any;

    if (!membershipPlan) throw new Error('Plan not found')

    const { count } = await supabase
      .from('website_access')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('plan_name', planName) as any;

    if (count >= membershipPlan.site_access) {
      throw new Error(`Limit reached for ${planName} plan.`)
    }

    const adminAuth = createAdminClient()
    
    // Generate unique license key (Logic from license-actions.ts)
    const prefix = "S22"
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const generatePart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
    const licenseKey = `${prefix}-${generatePart()}-${generatePart()}-${generatePart()}-${generatePart()}`

    // 1. Create the License record
    const { error: licenseError } = await (adminAuth.from('licenses') as any).insert({
      license_key: licenseKey,
      user_id: profile.id,
      plan: planName,
      payment_status: 'completed',
      status: 'active',
      validity_period: userMembership?.validity_days || 365,
      domain_url: domainUrl,
      name: profile.name
    });

    if (licenseError) throw licenseError;

    // 2. Create the Website Access record
    const { error: siteError } = await (adminAuth.from('website_access') as any)
      .insert({
        user_id: profile.id,
        plan_name: planName,
        domain_url: domainUrl,
        site_name: siteName,
        name: profile.name,
        status: userMembership?.status || 'active' // Store current membership status
      })

    if (siteError) throw siteError

    revalidatePath('/site-access')
    revalidatePath('/license')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding website access:', err)
    return { error: err.message || 'Failed to add website access' }
  }
}

export async function getPlanLayoutCounts() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('layouts')
      .select('layout_type')
    
    if (error) throw error

    // Count layouts per type (plan)
    const counts = (data || []).reduce((acc: Record<string, number>, curr: any) => {
      const type = curr.layout_type || 'Basic'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return { data: counts }
  } catch (err: any) {
    console.error('Error fetching layout counts:', err)
    return { error: err.message || 'Failed to fetch layout counts' }
  }
}
