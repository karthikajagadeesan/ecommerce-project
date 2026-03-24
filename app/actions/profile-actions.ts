'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AuthActionResult } from '@/types/general-type'
import { Tables } from '@/types/database-type'

export async function getProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: profile, error } = await (supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single() as any)

    if (error) {
      return { error: error.message }
    }

    return { success: true, profile: profile as Tables<'profiles'> }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateProfile(name: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('profiles')
      .update({ name } as any)
      .eq('auth_user_id', user.id) as any)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}
