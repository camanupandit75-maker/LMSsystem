'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSwitcher() {
  const [profile, setProfile] = useState<any>(null)
  const [hasEnrollments, setHasEnrollments] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', session.user.id)
          .eq('is_active', true)
          .limit(1)
        
        setHasEnrollments(enrollments && enrollments.length > 0)
      }
    }

    loadData()
  }, [])

  if (!profile) return null

  const availableDashboards = []

  if (profile.role === 'admin') {
    availableDashboards.push({ label: '👑 Admin', href: '/admin/dashboard' })
  }

  if (profile.role === 'instructor') {
    availableDashboards.push({ label: '🎓 Instructor', href: '/instructor/dashboard' })
  }

  if (profile.role === 'student' || hasEnrollments) {
    availableDashboards.push({ label: '📚 Student', href: '/student/dashboard' })
  }

  // Only show if user has multiple dashboards available
  if (availableDashboards.length <= 1) return null

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Switch view:</span>
      {availableDashboards.map((dashboard) => {
        const isActive = pathname.startsWith(dashboard.href)
        return (
          <Link key={dashboard.href} href={dashboard.href}>
            <Button 
              variant={isActive ? "default" : "outline"} 
              size="sm"
              className={`rounded-xl ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                  : ""
              }`}
            >
              {dashboard.label}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}




