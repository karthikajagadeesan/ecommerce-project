import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function UserLogin() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
      </div>
      <LoginForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="hover:text-brand underline underline-offset-4"
        >
          Forgot Password?
        </Link>
        {/* <Link
          href="/signup"
          className="hover:text-brand underline underline-offset-4"
        >
          Don&apos;t have an account? Sign Up
        </Link> */}
      </p>
    </div>
  )
}
