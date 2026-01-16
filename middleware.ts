import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Get user profile if authenticated
  let userRole: string | null = null
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    
    if (profileError) {
      // Log but don't throw - middleware shouldn't crash the app
      console.error('Middleware: Error fetching user profile:', profileError)
    }
    
    userRole = profile?.role || null
  }

  // Protect instructor routes
  if (pathname.startsWith('/instructor')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    if (userRole !== 'instructor' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/student/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Protect student routes
  if (pathname.startsWith('/student')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    if (userRole === 'instructor' && !pathname.startsWith('/student/dashboard')) {
      // Allow instructors to view student dashboard for reference
      // but redirect other student routes
    }
  }

  // Protect admin routes (except check-supabase)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/check-supabase')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = userRole === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Legacy routes - redirect based on role
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/upload')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    // Redirect to role-based dashboard
    if (userRole === 'instructor') {
      const url = request.nextUrl.clone()
      url.pathname = '/instructor/dashboard'
      return NextResponse.redirect(url)
    } else if (userRole === 'student') {
      const url = request.nextUrl.clone()
      url.pathname = '/student/dashboard'
      return NextResponse.redirect(url)
    } else if (userRole === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth')) {
    if (user) {
      const url = request.nextUrl.clone()
      // Redirect to role-based dashboard
      if (userRole === 'instructor') {
        url.pathname = '/instructor/dashboard'
      } else if (userRole === 'student') {
        url.pathname = '/student/dashboard'
      } else if (userRole === 'admin') {
        url.pathname = '/admin/dashboard'
      } else {
        url.pathname = '/student/dashboard'
      }
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
