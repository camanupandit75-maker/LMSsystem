import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Check admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/') // Not admin, redirect
  }

  // Get all users
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get all courses
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:user_profiles!courses_instructor_id_fkey(full_name),
      category:course_categories(id, name, slug, icon)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get video counts for each course
  const courseIds = courses?.map(c => c.id) || []
  let videoCountsByCourse: Record<string, number> = {}
  
  if (courseIds.length > 0) {
    const { data: videoCounts } = await supabase
      .from('course_videos')
      .select('course_id')
      .in('course_id', courseIds)

    // Group by course_id to count videos per course
    videoCountsByCourse = videoCounts?.reduce((acc: any, video) => {
      acc[video.course_id] = (acc[video.course_id] || 0) + 1
      return acc
    }, {}) || {}
  }

  // Merge video counts with courses
  const coursesWithCounts = courses?.map(course => ({
    ...course,
    actual_video_count: videoCountsByCourse[course.id] || 0
  }))

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      student:user_profiles!transactions_student_id_fkey(full_name),
      instructor:user_profiles!transactions_instructor_id_fkey(full_name),
      course:courses(title)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Count by role
  const instructorCount = users?.filter(u => u.role === 'instructor').length || 0
  const studentCount = users?.filter(u => u.role === 'student').length || 0

  // Calculate totals
  const totalRevenue = transactions?.reduce((sum, t) => 
    t.status === 'completed' ? sum + t.amount : sum, 0
  ) || 0

  const totalCourses = courses?.length || 0
  const publishedCourses = courses?.filter(c => c.status === 'published').length || 0

  // Get category statistics
  const { data: categoryStats } = await supabase
    .from('courses')
    .select('category_id, category:course_categories(name, icon)')
    .eq('status', 'published')

  // Count courses per category
  const categoryCounts: Record<string, { name: string; icon?: string; count: number }> = {}
  categoryStats?.forEach((item: any) => {
    if (item.category_id && item.category) {
      const key = item.category_id
      if (!categoryCounts[key]) {
        categoryCounts[key] = {
          name: item.category.name,
          icon: item.category.icon,
          count: 0
        }
      }
      categoryCounts[key].count++
    }
  })
  
  const sortedCategories = Object.values(categoryCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard 👑
          </h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {instructorCount} instructors, {studentCount} students
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCourses}</div>
              <p className="text-xs text-gray-500 mt-1">
                {publishedCourses} published
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transactions?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Enrolled Courses</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{user.full_name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-700'
                              : user.role === 'instructor'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">{user.enrolled_courses_count}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {user.role === 'instructor' ? (
                            <Link href={`/admin/instructors/${user.id}`}>
                              <Button variant="outline" size="sm" className="rounded-xl">Manage</Button>
                            </Link>
                          ) : (
                            <Button variant="outline" size="sm" className="rounded-xl">View</Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Management */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Instructor Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users?.filter(u => u.role === 'instructor').length > 0 ? (
                users.filter(u => u.role === 'instructor').map((instructor) => (
                  <div key={instructor.id} className="border-2 rounded-xl p-4 hover:bg-gray-50 transition-colors hover:border-purple-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{instructor.full_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Enrolled Courses: {instructor.enrolled_courses_count}
                        </p>
                      </div>
                      <Link href={`/admin/instructors/${instructor.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          Manage Instructor
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🎓</div>
                  <p>No instructors yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Statistics */}
        {sortedCategories.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCategories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="border-2 rounded-xl p-4 hover:bg-gray-50 transition-all hover:border-purple-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{cat.icon || '📂'}</span>
                      <div>
                        <h4 className="font-semibold">{cat.name}</h4>
                        <p className="text-sm text-gray-600">{cat.count} course{cat.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Courses */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {coursesWithCounts && coursesWithCounts.length > 0 ? (
              <div className="space-y-3">
                {coursesWithCounts.map((course: any) => (
                  <div key={course.id} className="border-2 rounded-xl p-4 hover:bg-gray-50 transition-all hover:border-purple-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          By {course.instructor?.full_name || 'Unknown'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm">
                          {course.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <span>{course.category.icon || '📂'}</span>
                              <span>{course.category.name}</span>
                            </span>
                          )}
                          <span className="text-gray-500">💰 ${course.price.toFixed(2)}</span>
                          <span className="text-gray-500">👥 {course.enrollment_count} students</span>
                          <span className="text-gray-500">📹 {course.actual_video_count} videos</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📚</div>
                <p>No courses yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((txn: any) => (
                      <tr key={txn.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium capitalize">{txn.type}</span>
                        </td>
                        <td className="py-3 px-4">{txn.student?.full_name || '-'}</td>
                        <td className="py-3 px-4">{txn.course?.title || '-'}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ${txn.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            txn.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

