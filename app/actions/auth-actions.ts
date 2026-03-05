'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as z from 'zod'
import type { AuthActionResult, SignupFormValues } from '@/types/general-type'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function signIn(
  formData: z.infer<typeof loginSchema>
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const validation = loginSchema.safeParse(formData)
  if (!validation.success) {
    return { error: 'Invalid input' }
  }

  const { error } = await supabase.auth.signInWithPassword(validation.data)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(
  formData: SignupFormValues
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const validation = signupSchema.safeParse(formData)
  if (!validation.success) {
    return { error: 'Invalid input' }
  }

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
