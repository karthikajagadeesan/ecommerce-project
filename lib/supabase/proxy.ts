import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database, Tables } from '@/types/database-type'
import { redirect } from 'next/navigation'
import { createClient } from './server'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']
const PROTECTED_PATHS = ['/dashboard', '/membership', '/payment', '/license']

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path))
    const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

    // Handle Auth Callback (Code Exchange)
    if (pathname === '/auth/callback') {
        const code = request.nextUrl.searchParams.get('code')
        if (code) {
            await supabase.auth.exchangeCodeForSession(code)
            const next = request.nextUrl.searchParams.get('next') || '/'
            const response = NextResponse.redirect(new URL(next, request.url))
            supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c.name, c.value, c))
            return response
        }
    }

    // 1. Landing Page (/) is ALWAYS accessible
    if (pathname === '/') {
        return supabaseResponse
    }

    // 2. Auth Flow Redirections
    if (user) {
        // Safe Read: The cookie acts as a persistent fallback if DB/auth calls fail logic gating
        const hasMembershipCookie = request.cookies.get('s22_membership')?.value === 'true';
        const hasMembership = user.user_metadata?.membership_selected === true || hasMembershipCookie;

        // If logged in and trying to go to login/signup, redirect to dashboard/check progress
        if (isAuthPath) {
            if (hasMembership) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/membership', request.url))
            }
        }

        // 3. Progress Gating
        if (isProtectedPath) {
            // Block /payment if no plan selected
            if (pathname === '/payment' && !hasMembership) {
                return NextResponse.redirect(new URL('/membership', request.url))
            }

            // Block /dashboard and /license if no active plan
            if ((pathname === '/dashboard' || pathname === '/license') && !hasMembership) {
                return NextResponse.redirect(new URL('/membership', request.url))
            }
        }
    } else {
        // 4. Guest Redirections
        if (isProtectedPath) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return supabaseResponse
}

export async function requireAuth(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
}

export async function redirectIfAuthenticated(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
}
