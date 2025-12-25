import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user profile to determine redirect
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        // Redirect based on role
        if (profile?.role === 'instructor') {
          return NextResponse.redirect(new URL('/instructor/dashboard', request.url))
        } else if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/student/dashboard', request.url))
        }
      }
    }
  }

  // Return to home if something went wrong
  return NextResponse.redirect(new URL('/', request.url))
}



