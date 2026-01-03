import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ArrowLeft, Edit, Eye, Star } from 'lucide-react'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'

export default async function InstructorCoursesPage() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'instructor') redirect('/')

  // Get all courses for this instructor
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name, slug, icon)
    `)
    .eq('instructor_id', session.user.id)
    .order('created_at', { ascending: false })

  // Get subscription to check course limits
  const { data: subscription } = await supabase
    .from('instructor_subscriptions')
    .select('courses_allowed, bonus_courses, plan_type, is_active, id')
    .eq('instructor_id', session.user.id)
    .eq('is_active', true)
    .maybeSingle()

  // Use correct column names: courses_allowed and bonus_courses
  const baseCourses = subscription?.courses_allowed || 0
  const bonusCourses = subscription?.bonus_courses || 0
  const totalCoursesAllowed = baseCourses + bonusCourses
  const publishedCount = courses?.filter(c => c.status === 'published').length || 0
  const draftCount = courses?.filter(c => c.status === 'draft').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DashboardSwitcher />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">
                My Courses <span className="text-gradient">📚</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Manage all your courses in one place
              </p>
            </div>
            <Link href="/instructor/courses/new">
              <Button className="gradient-primary text-white font-semibold rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Total Courses</h3>
            <p className="text-3xl font-extrabold text-gradient">
              {courses?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {courses?.length ?? 0} / {totalCoursesAllowed} allowed
            </p>
            {subscription?.bonus_courses > 0 && (
              <p className="text-xs text-green-600 mt-0.5 font-medium">
                +{subscription.bonus_courses} bonus course{subscription.bonus_courses !== 1 ? 's' : ''}
              </p>
            )}
          </Card>

          <Card className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Published</h3>
            <p className="text-3xl font-extrabold text-green-600">
              {publishedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">Live courses</p>
          </Card>

          <Card className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Drafts</h3>
            <p className="text-3xl font-extrabold text-yellow-600">
              {draftCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </Card>

          <Card className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-extrabold text-gradient">
              {courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all courses</p>
          </Card>
        </div>

        {/* Courses List */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-purple-300 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-xl">{course.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : course.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        {/* Rating */}
                        {course.average_rating && course.average_rating > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm text-gray-900">{course.average_rating.toFixed(1)}</span>
                            {course.total_reviews > 0 && (
                              <span className="text-xs text-gray-500">
                                ({course.total_reviews} {course.total_reviews === 1 ? 'review' : 'reviews'})
                              </span>
                            )}
                          </div>
                        )}
                        {course.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {course.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <span>{course.category.icon || '📂'}</span>
                              <span>{course.category.name}</span>
                            </span>
                          )}
                          <span className="px-2 py-1 rounded bg-gray-100">📹 {course.total_videos || 0} videos</span>
                          {course.total_duration_minutes > 0 && (
                            <span className="px-2 py-1 rounded bg-gray-100">⏱️ {Math.floor(course.total_duration_minutes / 60)}h {course.total_duration_minutes % 60}m</span>
                          )}
                          <span className="px-2 py-1 rounded bg-gray-100">👥 {course.enrollment_count || 0} students</span>
                          <span className="px-2 py-1 rounded bg-gray-100">💰 ${course.price}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/instructor/courses/${course.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            <Edit className="mr-2 h-3 w-3" />
                            Manage
                          </Button>
                        </Link>
                        {course.status === 'published' && (
                          <Link href={`/courses/${course.slug || course.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl">
                              <Eye className="mr-2 h-3 w-3" />
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-medium mb-2">No courses yet</p>
                <p className="text-sm mb-6">Create your first course to get started!</p>
                <Link href="/instructor/courses/new">
                  <Button className="gradient-primary text-white font-semibold rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
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

