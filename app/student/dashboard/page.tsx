import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'
import { BookOpen, CheckCircle, TrendingUp, Star, GraduationCap, Rocket } from 'lucide-react'

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
        instructor:user_profiles!courses_instructor_id_fkey(full_name, avatar_url),
        category:course_categories(id, name, slug, icon)
      )
    `)
    .eq('student_id', session.user.id)
    .eq('is_active', true)
    .order('enrolled_at', { ascending: false })

  const completedCount = enrollments?.filter(e => e.completed_at).length || 0
  const inProgressCount = enrollments?.filter(e => !e.completed_at).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Welcome back, {profile?.full_name}!
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium ml-14">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="group relative overflow-hidden border-2 border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Enrolled Courses</CardTitle>
                <div className="p-2 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {enrollments?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-green-100/50 bg-gradient-to-br from-white to-green-50/30 hover:border-green-300 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Completed</CardTitle>
                <div className="p-2 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {completedCount}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-purple-100/50 bg-gradient-to-br from-white to-purple-50/30 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">In Progress</CardTitle>
                <div className="p-2 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {inProgressCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="border-2 border-gray-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">My Learning</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Continue where you left off</p>
            </div>
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                <BookOpen className="w-4 h-4 mr-2" />
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
                      className="group relative border-2 border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2"
                    >
                      {course?.thumbnail_url && (
                        <div className="relative overflow-hidden h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-purple-600 transition-colors">
                          {course?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 font-medium">
                          By {instructor?.full_name || 'Instructor'}
                        </p>
                        
                        {/* Category */}
                        {course?.category && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <span>{course.category.icon || '📂'}</span>
                              <span>{course.category.name}</span>
                            </span>
                          </div>
                        )}
                        
                        {/* Rating */}
                        {course?.average_rating && course.average_rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">{course.average_rating.toFixed(1)}</span>
                            {course.total_reviews > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.total_reviews})
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              Progress
                            </span>
                            <span className="text-purple-600">{enrollment.progress_percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-3 rounded-full transition-all duration-700 shadow-lg shadow-purple-500/50 relative overflow-hidden"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>

                        <Link href={`/courses/${course?.slug || course?.id}/watch`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                            {enrollment.progress_percentage === 0 ? (
                              <>
                                <Rocket className="w-4 h-4 mr-2" />
                                Start Learning
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Continue Learning
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                  <GraduationCap className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No courses enrolled yet</p>
                <p className="text-sm mt-2 mb-6 text-gray-600">Explore our catalog and start learning today!</p>
                <Link href="/courses">
                  <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                    <BookOpen className="w-4 h-4 mr-2" />
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
