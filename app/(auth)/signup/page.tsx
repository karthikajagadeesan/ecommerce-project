import { Suspense } from 'react'
import { RoleGateway } from '@/helper/role-gateway'
import { LoadingState } from '@/components/loading-state'
import UserSignup from './user'
import SuperAdminSignup from './superadmin'

export default async function SignupPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Suspense fallback={<LoadingState />}>
        <RoleGateway 
          user={<UserSignup />}
          superadmin={<SuperAdminSignup />}
        />
      </Suspense>
    </div>
  )
}
