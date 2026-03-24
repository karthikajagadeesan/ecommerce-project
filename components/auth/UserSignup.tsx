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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from 'next/link'

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
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
    onError: (err: any) => {
      toast.error(err.message || 'An unexpected error occurred')
    }
  })

  async function onSubmit(data: SignupFormValues) {
    signupMutation.mutate(data)
  }

  return (
    <Card className="w-full border-2 border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-md font-black text-center tracking-tighter"> Create your account to unlock premium layouts.</CardTitle>
        {/* <CardDescription className="text-center font-medium">
          Create your account to unlock premium layouts.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} className="h-12 bg-background/50 border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="h-12 bg-background/50 border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="h-12 bg-background/50 border-2 pr-12"
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
            <Button type="submit" className="w-full h-12 text-md font-black uppercase tracking-[0.1em] rounded-full shadow-lg transition-all active:scale-95" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? (
                <>
                  Creating account
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
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
