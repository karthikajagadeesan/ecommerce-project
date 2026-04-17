import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function UserLogin() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4">
      <div className="flex flex-col space-y-2 text-center items-center">
        <img src="/solution22-logo.png" alt="Solution22 Logo" className="h-16 md:h-20 w-auto" />
      </div>
      <LoginForm />
    </div>
  )
}
