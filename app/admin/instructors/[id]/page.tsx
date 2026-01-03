import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GrantCoursesForm } from '@/components/admin/GrantCoursesForm'

// Disable caching to ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ManageInstructorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  // Check admin role
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (adminProfile?.role !== 'admin') redirect('/')

  // Get instructor details
  const { data: instructor } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'instructor')
    .single()

  if (!instructor) redirect('/admin/dashboard')

  // Debug: Log instructor ID
  console.log('🔍 Fetching subscription for instructor ID:', params.id)

  // Get subscription - use maybeSingle() to avoid errors if not found
  let { data: subscription, error: subscriptionError } = await supabase
    .from('instructor_subscriptions')
    .select('courses_allowed, bonus_courses, plan_type, is_active, id, created_at, bonus_granted_at')
    .eq('instructor_id', params.id)
    .eq('is_active', true)
    .maybeSingle()

  // Debug: Log subscription data
  console.log('📊 Subscription data (active):', subscription)
  console.log('❌ Subscription error:', subscriptionError)
  
  // If no active subscription found, try to get any subscription (fallback)
  if (!subscription && !subscriptionError) {
    console.log('⚠️ No active subscription found, trying to get any subscription...')
    const { data: anySubscription, error: anyError } = await supabase
      .from('instructor_subscriptions')
      .select('courses_allowed, bonus_courses, plan_type, is_active, id, created_at, bonus_granted_at')
      .eq('instructor_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (anySubscription) {
      console.log('📊 Found subscription (not active):', anySubscription)
      subscription = anySubscription
    } else {
      console.log('❌ No subscription found at all:', anyError)
    }
  }
  
  if (subscriptionError) {
    console.error('❌ Error fetching subscription:', subscriptionError)
  }

  // Count actual courses created by this instructor
  const { count: actualCoursesCount, error: coursesError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', params.id)

  console.log('📚 Actual courses count:', actualCoursesCount)
  console.log('❌ Courses count error:', coursesError)

  // Get courses for display
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('instructor_id', params.id)
    .order('created_at', { ascending: false })

  // Calculate values correctly using courses_allowed (correct column name)
  const baseCourses = subscription?.courses_allowed || 0
  const bonusCourses = subscription?.bonus_courses || 0
  const totalAllowed = baseCourses + bonusCourses
  const coursesUsed = actualCoursesCount || 0
  const coursesRemaining = totalAllowed - coursesUsed
  
  // Debug: Log calculated totals
  console.log('📈 Subscription details:', {
    plan_type: subscription?.plan_type,
    courses_allowed: subscription?.courses_allowed,
    base_courses_calculated: baseCourses,
    bonus_courses: bonusCourses,
    total_allowed: totalAllowed,
    courses_used: coursesUsed,
    courses_remaining: coursesRemaining
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Instructor Info */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">👤 Instructor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600 font-medium">Name</label>
                <p className="font-semibold text-lg mt-1">{instructor.full_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">PAN Number</label>
                <p className="font-mono mt-1">{instructor.pan_number || 'Not provided'}</p>
              </div>
              {instructor.gstn && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">GSTN</label>
                  <p className="font-mono mt-1">{instructor.gstn}</p>
                </div>
              )}
              {instructor.business_name && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Business Name</label>
                  <p className="mt-1">{instructor.business_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">📊 Subscription & Course Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {!subscription ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold">⚠️ No subscription found for this instructor</p>
                <p className="text-sm text-yellow-700 mt-1">Instructor ID: {params.id}</p>
              </div>
            ) : null}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-600 mb-1 font-medium">Plan Tier</div>
                <div className="text-2xl font-bold capitalize">{subscription?.plan_type || 'None'}</div>
                {subscription && (
                  <div className="text-xs text-purple-500 mt-1">ID: {subscription.id?.substring(0, 8)}...</div>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1 font-medium">Base Courses</div>
                <div className="text-2xl font-bold">{baseCourses}</div>
                {subscription && (
                  <div className="text-xs text-blue-500 mt-1">Active: {subscription.is_active ? 'Yes' : 'No'}</div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1 font-medium">Bonus Courses</div>
                <div className="text-2xl font-bold">{bonusCourses}</div>
                {subscription && subscription.bonus_courses > 0 && (
                  <div className="text-xs text-green-500 mt-1">Granted: {subscription.bonus_granted_at ? new Date(subscription.bonus_granted_at).toLocaleDateString() : 'N/A'}</div>
                )}
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm text-orange-600 mb-1 font-medium">Used / Total</div>
                <div className="text-2xl font-bold">
                  {coursesUsed} / {totalAllowed}
                </div>
                <div className="text-xs text-orange-500 mt-1">Remaining: {coursesRemaining}</div>
              </div>
            </div>

            {/* Grant Bonus Courses Form */}
            <GrantCoursesForm 
              instructorId={params.id} 
              currentBonus={subscription?.bonus_courses || 0}
            />
          </CardContent>
        </Card>

        {/* Courses List */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">📚 Instructor&apos;s Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="border-2 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>📹 {course.total_videos} videos</span>
                          <span>👥 {course.enrollment_count} students</span>
                          <span>💰 ${course.total_revenue?.toFixed(2) || '0.00'} revenue</span>
                        </div>
                      </div>
                      <Link href={`/admin/courses/${course.id}/videos`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Moderate Videos
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-medium">No courses yet</p>
                <p className="text-sm mt-2">This instructor hasn&apos;t created any courses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

