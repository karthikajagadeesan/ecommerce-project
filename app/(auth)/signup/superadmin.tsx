import { SignupForm } from '@/components/auth/UserSignup'
import Link from 'next/link'

export default function SuperAdminSignup() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center items-center">
        <img src="/solution22-logo.png" alt="Solution22 Logo" className="h-20 w-auto" />
      </div>
      <SignupForm />
    </div>
  )
}
