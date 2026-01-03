import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'
import { BookOpen, Users, DollarSign, TrendingUp, Star, GraduationCap, CheckCircle2, Plus } from 'lucide-react'

export default async function InstructorDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Get subscription
  const { data: subscription } = await supabase
    .from('instructor_subscriptions')
    .select('courses_allowed, bonus_courses, plan_type, is_active, id')
    .eq('instructor_id', session.user.id)
    .eq('is_active', true)
    .maybeSingle()

  console.log('📊 Subscription data:', subscription)

  // Count actual courses created by this instructor
  const { count: coursesCount, error: coursesError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', session.user.id)

  console.log('📚 Actual courses count:', coursesCount)
  console.log('❌ Courses count error:', coursesError)

  // Get courses for display
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name, slug, icon)
    `)
    .eq('instructor_id', session.user.id)
    .order('created_at', { ascending: false })

  // Get recent reviews across all instructor's courses
  // First get course IDs for this instructor
  const courseIds = courses?.map(c => c.id) || []
  
  let recentReviews = null
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from('course_reviews')
      .select(`
        *,
        course:courses(id, title, thumbnail_url),
        student:user_profiles!course_reviews_student_id_fkey(full_name)
      `)
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(5)
    recentReviews = data
  }

  // Calculate overall rating stats
  const { data: coursesWithRatings } = await supabase
    .from('courses')
    .select('average_rating, total_reviews')
    .eq('instructor_id', session.user.id)

  const totalReviews = coursesWithRatings?.reduce((sum, c) => sum + (c.total_reviews || 0), 0) || 0
  const coursesWithValidRatings = coursesWithRatings?.filter(c => c.average_rating !== null && c.average_rating > 0) || []
  const avgRating = coursesWithValidRatings.length > 0
    ? coursesWithValidRatings.reduce((sum, c) => sum + (c.average_rating || 0), 0) / coursesWithValidRatings.length
    : 0

  // Calculate values correctly using courses_allowed (correct column name)
  const baseCourses = subscription?.courses_allowed || 0
  const bonusCourses = subscription?.bonus_courses || 0
  const totalAllowed = baseCourses + bonusCourses
  const coursesUsed = coursesCount || 0
  const remainingCourses = totalAllowed - coursesUsed

  console.log('📈 Subscription calculations:', {
    courses_allowed: subscription?.courses_allowed,
    base_courses_calculated: baseCourses,
    bonus_courses: bonusCourses,
    total_allowed: totalAllowed,
    courses_used: coursesUsed,
    courses_remaining: remainingCourses
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Welcome back, {profile?.full_name}!
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium ml-14">Here&apos;s an overview of your teaching journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
          <Card className="group relative overflow-hidden border-2 border-purple-100/50 bg-gradient-to-br from-white to-purple-50/30 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Courses</CardTitle>
                <div className="p-2 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {courses?.length || 0}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {coursesUsed} / {totalAllowed} used
              </p>
              {bonusCourses > 0 && (
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  +{bonusCourses} bonus
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-green-100/50 bg-gradient-to-br from-white to-green-50/30 hover:border-green-300 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Published</CardTitle>
                <div className="p-2 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {courses?.filter(c => c.status === 'published').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Students</CardTitle>
                <div className="p-2 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-emerald-100/50 bg-gradient-to-br from-white to-emerald-50/30 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Revenue</CardTitle>
                <div className="p-2 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                ${courses?.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          {/* Average Rating Card */}
          <Card className="group relative overflow-hidden border-2 border-yellow-100/50 bg-gradient-to-br from-white to-yellow-50/30 hover:border-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Average Rating</CardTitle>
                <div className="p-2 rounded-xl bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </p>
                {avgRating > 0 && (
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {totalReviews} total review{totalReviews !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Card */}
        <Card className="mb-10 border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
          <CardHeader className="border-b border-purple-100/50 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Subscription Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-3xl font-extrabold capitalize bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {subscription?.plan_type || 'Free'} Plan
                </div>
                <p className="text-gray-700 font-medium mt-1">
                  {totalAllowed} course{totalAllowed !== 1 ? 's' : ''} allowed
                  {bonusCourses > 0 && (
                    <span className="text-green-600 font-semibold ml-1">
                      ({baseCourses} base + {bonusCourses} bonus)
                    </span>
                  )}
                </p>
                {remainingCourses > 0 && (
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {remainingCourses} course{remainingCourses !== 1 ? 's' : ''} remaining
                  </p>
                )}
                {remainingCourses <= 0 && totalAllowed > 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Course limit reached
                  </p>
                )}
              </div>
              <Link href="/instructor/subscription">
                <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews Section */}
        <Card className="mb-10 border-2 border-gray-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Recent Reviews</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Latest feedback from your students</p>
            </div>
          </CardHeader>
          <CardContent>
            {recentReviews && recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-white border border-indigo-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Course Title as Header */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <h3 className="font-bold text-indigo-900">
                            {review.course?.title}
                          </h3>
                        </div>

                        {/* Student Info & Rating */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="font-semibold text-sm text-gray-700">
                            {review.student?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            •
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Review Text */}
                        {review.review_text && (
                          <p className="text-sm text-gray-700 mt-2">
                            {review.review_text}
                          </p>
                        )}
                      </div>

                      {/* Course Thumbnail */}
                      {review.course?.thumbnail_url && (
                        <Image
                          src={review.course.thumbnail_url}
                          alt={review.course.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Reviews from your students will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="border-2 border-gray-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Your Courses</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Manage and track your course performance</p>
            </div>
            <Link href="/instructor/courses/new">
              <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="group border-2 border-gray-200 rounded-2xl p-5 bg-white hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{course.description}</p>
                        {/* Rating */}
                        {course.average_rating && course.average_rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">{course.average_rating.toFixed(1)}</span>
                            {course.total_reviews > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.total_reviews})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3 text-sm">
                          {course.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <span>{course.category.icon || '📂'}</span>
                              <span>{course.category.name}</span>
                            </span>
                          )}
                          <span className="text-gray-500">📹 {course.total_videos} videos</span>
                          <span className="text-gray-500">⏱️ {course.total_duration_minutes} mins</span>
                          <span className="text-gray-500">👥 {course.enrollment_count} students</span>
                          <span className="text-gray-500">💰 ${course.price}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : course.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {course.status}
                        </span>
                        <Link href={`/instructor/courses/${course.id}`}>
                          <Button variant="outline" size="sm" className="border-2 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 font-semibold transition-all duration-300">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-6">
                  <BookOpen className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No courses yet</p>
                <p className="text-sm mt-2 mb-6 text-gray-600">Create your first course to start teaching!</p>
                <Link href="/instructor/courses/new">
                  <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
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
