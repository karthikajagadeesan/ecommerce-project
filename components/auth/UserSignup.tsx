'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SignupFormValues } from '@/types/general-type'
import { signUp } from "@/app/actions/auth-actions"
import { useMutation } from '@tanstack/react-query'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import Link from 'next/link'

const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phoneNumber: z.string().min(7, { message: 'Enter a valid phone number' }),
})

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: (data: SignupFormValues) => signUp(data),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Registration successful!')
      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'An unexpected error occurred')
    }
  })

  async function onSubmit(data: SignupFormValues) {
    signupMutation.mutate(data)
  }

  return (
    <Card className="w-full  border border-ui-border-shade shadow-xl  bg-primary/5 -translate-y-2 ">
      <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold text-center tracking-tighter uppercase">Create account</CardTitle>
       <CardDescription className="text-md font-medium text-center">
         Create your account to unlock premium layouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="h-10 bg-background/50 focus-visible:ring-ui-border-shade focus-visible:border-ui-border-shade" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="h-10 bg-background/50  focus-visible:ring-ui-border-shade focus-visible:border-ui-border-shade" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="h-10 bg-background/50 focus-visible:ring-ui-border-shade " />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 1245678900" type="tel" {...field} className="h-10 bg-background/50 focus-visible:ring-ui-border-shade " />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="h-10 bg-background/50 focus-visible:ring-ui-border-shade pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center pt-2">
              <Button 
                type="submit" 
                className="w-45 h-10 text-md font-medium  rounded-xl shadow-lg transition-all flex items-center justify-center"
                disabled={signupMutation.isPending}
              >
                <span className="relative">
                  {signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
                  {signupMutation.isPending && (
                    <Loader2 className="absolute -right-7 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-2 border-t pt-6">
        <div className="text-sm font-medium text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold underline-offset-4 transition-colors hover:underline"
          >
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
