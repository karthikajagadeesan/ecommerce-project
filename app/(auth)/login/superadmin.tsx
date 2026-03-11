import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function SuperAdminLogin() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Super Admin Login</h1>
        <p className="text-sm text-muted-foreground">
          Secure portal for administration
        </p>
      </div>
      <LoginForm />
      <div className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <Link
          href="/signup"
          className="hover:text-brand underline underline-offset-4"
        >
          Don&apos;t have an account? Sign Up
        </Link>
        <Link
          href="/forgot-password"
          className="hover:text-brand underline underline-offset-4"
        >
          Forgot Password?
        </Link>
      </div>
    </div>
  )
}
