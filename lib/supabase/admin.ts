import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database-type'

// The Service Role Client MUST ONLY be used on the server API/Server Actions.
// It completely BYPASSES Row Level Security (RLS) policies.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase configuration. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to enable secure database writes.'
    )
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
