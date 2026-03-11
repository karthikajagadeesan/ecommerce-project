import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database-type'
import { redirect } from 'next/navigation'
import { createClient } from './server'
import DomainFinder from '@/helper/domin-finder'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password','/reset-password']

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

    const pathname = request.nextUrl.pathname;
    const hostname = request.headers.get("host") || request.nextUrl.hostname;
    const subdomain = DomainFinder(hostname)

    // Handle Auth Callback (Code Exchange)
    if (pathname === '/auth/callback') {
        const code = request.nextUrl.searchParams.get('code')
        if (code) {
            await supabase.auth.exchangeCodeForSession(code)
            const next = request.nextUrl.searchParams.get('next') || '/'
            const response = NextResponse.redirect(new URL(next, request.url))
            // If redirecting to reset-password, set a temporary cookie to allow access once
            if (next.startsWith('/reset-password')) {
                response.cookies.set('reset_allowed', 'true', { maxAge: 300, path: '/' })
            }
            // Copy cookies from supabaseResponse to the redirect response
            supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c.name, c.value, c))
            return response
        }
    }

    const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path))

    if (subdomain === "superadmin" || subdomain === "user") {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (isAuthPath && user) {
            // Special exception for reset-password: only allow if they have the temporary cookie
            if (pathname === '/reset-password') {
                if (request.cookies.get('reset_allowed')) {
                    // Allow access and consume the cookie
                    supabaseResponse.cookies.delete('reset_allowed')
                    return supabaseResponse
                }
            }
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Explicitly block guests from /reset-password even though it's an AUTH_PATH
        if (pathname === '/reset-password' && !user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        
        if (pathname === '/') {
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url))
            }
            return supabaseResponse
        }
        
        if (!user && !isAuthPath) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return supabaseResponse;
}
export async function requireAuth(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
}

export async function redirectIfAuthenticated(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/");
}
