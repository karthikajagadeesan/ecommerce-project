'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LoginFormValues } from '@/types/general-type'
import { signIn } from "@/app/actions/auth-actions"
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => signIn(data),
    onSuccess: (result) => {
      if (result.error) {
        setErrorStatus(result.error)
        toast.error(result.error)
        return
      }

      toast.success('Successfully logged in!')
      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    },
    onError: (err: any) => {
      setErrorStatus(err.message || 'An unexpected error occurred')
      toast.error(err.message || 'Login failed')
    }
  })

  async function onSubmit(data: LoginFormValues) {
    setErrorStatus(null)
    loginMutation.mutate(data)
  }

  return (
    <Card className="w-full  border border-ui-border-shade shadow-xl  bg-primary/5 -translate-y-2 ">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-center tracking-tighter uppercase">Welcome Back</CardTitle>
        <CardDescription className="text-md font-medium text-center">
          Enter your details below to log in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium ">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="h-10 mt-1 bg-background/50 focus-visible:ring-ui-border-shade " />
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-primary hover:underline underline-offset-4"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                         className="h-10 bg-background/50 focus-visible:ring-ui-border-shade  pr-12"
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
                disabled={loginMutation.isPending}
              >
                <span className="relative">
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  {loginMutation.isPending && (
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
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-bold underline-offset-4 transition-colors hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
