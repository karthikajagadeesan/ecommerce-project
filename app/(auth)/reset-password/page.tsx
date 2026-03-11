import { Suspense } from 'react'
import { LoadingState } from '@/components/loading-state'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'


export default async function ResetPasswordPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Suspense fallback={<LoadingState />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
