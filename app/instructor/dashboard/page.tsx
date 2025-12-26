import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'
import { BookOpen, Users, DollarSign, TrendingUp, Star } from 'lucide-react'

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
    .select('*')
    .eq('instructor_id', session.user.id)
    .eq('is_active', true)
    .single()

  // Get courses
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name, slug, icon)
    `)
    .eq('instructor_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's an overview of your teaching journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {subscription?.used_courses || 0} / {subscription?.max_courses || 1} used
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {courses?.filter(c => c.status === 'published').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${courses?.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Card */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎓</span> Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold capitalize">{subscription?.tier || 'Free'} Plan</div>
                <p className="text-gray-600 mt-1">
                  {subscription?.max_courses || 1} course{subscription?.max_courses !== 1 ? 's' : ''} allowed
                </p>
              </div>
              <Link href="/instructor/subscription">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Courses</CardTitle>
            <Link href="/instructor/courses/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                + Create Course
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{course.description}</p>
                        {/* Rating */}
                        {course.rating && course.rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                            {course.review_count > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.review_count})
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
                          <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-medium">No courses yet</p>
                <p className="text-sm mt-2 mb-4">Create your first course to start teaching!</p>
                <Link href="/instructor/courses/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
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
