import React from 'react'
import type { UserRole } from '@/types/general-type'

interface RoleGatewayProps {
  superadmin?: React.ReactNode
  user?: React.ReactNode
  fallback?: React.ReactNode
}

export async function RoleGateway({ superadmin, user, fallback }: RoleGatewayProps) {
  // TODO: Replace with real role lookup from Supabase profiles table.
  const currentRole: UserRole = 'user'

  if ((currentRole as any) === 'superadmin') return <>{superadmin}</>
  if ((currentRole as any) === 'user') return <>{user}</>

  return <>{fallback ?? <div>Access Denied</div>}</>
}
