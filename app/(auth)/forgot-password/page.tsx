import { Suspense } from 'react'
import { LoadingState } from '@/components/loading-state'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { redirectIfAuthenticated } from '@/lib/supabase/proxy'

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated()
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Link href="/login" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Suspense fallback={<LoadingState />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
