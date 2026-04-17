import { SignupForm } from "@/components/auth/UserSignup"
import Link from "next/link"

export default function UserSignup() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] px-4">
      <div className="flex flex-col space-y-2 text-center items-center">
        <img src="/solution22-logo.png" alt="Solution22 Logo" className="h-16 md:h-20 w-auto" />
      </div>
      {/* <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div> */}

     <SignupForm />

      {/* <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="hover:text-brand underline underline-offset-4"
        >
          Already have an account? Login
        </Link>
      </p> */}
    </div>
  )
}