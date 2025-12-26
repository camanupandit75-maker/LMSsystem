import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'
import { BookOpen, CheckCircle, TrendingUp, Star } from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Get enrollments with course details
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(
        *,
        instructor:user_profiles!courses_instructor_id_fkey(full_name, avatar_url)
      )
    `)
    .eq('student_id', session.user.id)
    .eq('is_active', true)
    .order('enrolled_at', { ascending: false })

  const completedCount = enrollments?.filter(e => e.completed_at).length || 0
  const inProgressCount = enrollments?.filter(e => !e.completed_at).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name}! 📚
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Learning</CardTitle>
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Browse Courses
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {enrollments && enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course as any
                  const instructor = course?.instructor
                  
                  return (
                    <div 
                      key={enrollment.id} 
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105"
                    >
                      {course?.thumbnail_url && (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{course?.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          By {instructor?.full_name || 'Instructor'}
                        </p>
                        
                        {/* Rating */}
                        {course?.rating && course.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                            {course.review_count > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.review_count})
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress_percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        <Link href={`/courses/${course?.slug || course?.id}/watch`}>
                          <Button className="w-full">
                            {enrollment.progress_percentage === 0 ? '🚀 Start Learning' : '▶️ Continue Learning'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-lg font-medium">No courses enrolled yet</p>
                <p className="text-sm mt-2 mb-4">Explore our catalog and start learning today!</p>
                <Link href="/courses">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
