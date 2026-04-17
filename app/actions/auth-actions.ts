'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as z from 'zod'
import { SignupFormValues, AuthActionResult } from '@/types/general-type'
import { Tables } from '@/types/database-type'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(7, 'Enter a valid phone number'),
})

export async function signIn(
  formData: z.infer<typeof loginSchema>
): Promise<AuthActionResult & { redirectTo?: string }> {
  try {
    const supabase = await createClient()

    const validation = loginSchema.safeParse(formData)
    if (!validation.success) {
      return { error: 'Invalid input' }
    }

    const { data, error } = await supabase.auth.signInWithPassword(validation.data)
    const user = data?.user

    if (error || !user) {
      return { error: error?.message || 'Login failed' }
    }

    // Check membership status from user_membership table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single() as any;

    const { data: membership } = profile ? await supabase
      .from('user_membership')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle() as any : { data: null };

    revalidatePath('/', 'layout')
    
    if (membership) {
      return { success: true, redirectTo: '/dashboard' }
    } else {
      return { success: true, redirectTo: '/membership' }
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function signUp(
  formData: SignupFormValues
): Promise<AuthActionResult & { redirectTo?: string }> {
  try {
    const supabase = await createClient()

    const validation = signupSchema.safeParse(formData)
    if (!validation.success) {
      return { error: 'Invalid input' }
    }

    const fullName = `${validation.data.firstName} ${validation.data.lastName}`.trim()

    const { data, error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: fullName,
          phone_number: validation.data.phoneNumber,
        },
      },
    })
    
    const user = data?.user
    const session = data?.session

    if (error || !user) {
      return { error: error?.message || 'Registration failed' }
    }

    // Ensure profile is created with Service Role to bypass Postgres RLS Insert restrictions
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminAuth = createAdminClient();
      const { error: profileError } = await (adminAuth.from('profiles') as any).upsert({
        auth_user_id: user.id,
        user_id: user.id, // Populating new user_id column
        name: fullName,
        email: validation.data.email,
        phone_number: validation.data.phoneNumber,
        status: 'active'
      }, { onConflict: 'auth_user_id' });
      if (profileError) {
        console.error("Failed to insert profile record:", profileError);
      }
    } catch (e: any) {
      console.warn("Service Role Auth Not Configured for profile creation:", e.message);
    }

    if (!session) {
      // Supabase email confirmation is enabled and the user needs to check their inbox!
      return { error: 'Please check your email to verify your account.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, redirectTo: '/membership' }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

export async function resetPassword(email: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}
