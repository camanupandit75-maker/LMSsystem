import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EnrollButton } from '@/components/EnrollButton'
import PaymentButton from '@/components/payments/PaymentButton'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewsList } from '@/components/reviews/ReviewsList'

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  // Get course by slug or id (fallback for courses without slug)
  let { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:user_profiles!courses_instructor_id_fkey(
        id,
        full_name,
        avatar_url,
        bio
      ),
      category:course_categories(id, name, slug, icon)
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  // If not found by slug, try by id (for backward compatibility)
  if (!course) {
    const { data: courseById } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:user_profiles!courses_instructor_id_fkey(
          id,
          full_name,
          avatar_url,
          bio
        ),
        category:course_categories(id, name, slug, icon)
      `)
      .eq('id', params.slug)
      .eq('status', 'published')
      .single()
    
    course = courseById
  }

  if (!course) {
    redirect('/courses')
  }

  // Get course videos (only preview or if enrolled)
  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  // Check if already enrolled
  let isEnrolled = false
  if (session) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('course_id', course.id)
      .eq('is_active', true)
      .single()
    
    isEnrolled = !!enrollment
  }

  // Get user profile to check role
  let userRole = null
  if (session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    userRole = profile?.role
  }

  const previewVideos = videos?.filter(v => v.is_preview) || []
  const totalVideos = videos?.length || 0

  // Get user's existing review if enrolled
  let existingReview = null
  if (session && isEnrolled) {
    const { data: review } = await supabase
      .from('course_reviews')
      .select('*')
      .eq('student_id', session.user.id)
      .eq('course_id', course.id)
      .single()
    
    if (review) {
      existingReview = {
        id: review.id,
        rating: review.rating,
        review_text: review.review_text || undefined
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button & Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            {course.category ? (
              <>
                <Link 
                  href={`/courses?category=${course.category.id}`} 
                  className="hover:text-indigo-600 transition-colors"
                >
                  {course.category.icon} {course.category.name}
                </Link>
                <span>/</span>
              </>
            ) : null}
            <span className="text-gray-900 font-medium">{course.title}</span>
          </div>
          <Link href="/courses">
            <Button variant="ghost" className="rounded-xl">
              ← Back to Courses
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="p-8">
                {course.thumbnail_url && (
                  <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                    <Image 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {!course.thumbnail_url && (
                  <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-6 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                
                {/* Rating Display */}
                {course.average_rating && course.average_rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-xl text-gray-900">{course.average_rating.toFixed(1)}</span>
                    {course.total_reviews > 0 && (
                      <span className="text-gray-600">
                        ({course.total_reviews} {course.total_reviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-gray-700 text-lg mb-6">{course.description}</p>

                <div className="flex flex-wrap gap-3">
                  {course.category && (
                    <Link 
                      href={`/courses?category=${course.category.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      <span>{course.category.icon || '📂'}</span>
                      <span>{course.category.name}</span>
                    </Link>
                  )}
                  {course.level && (
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                      🎓 {course.level}
                    </span>
                  )}
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    📹 {totalVideos} videos
                  </span>
                  {course.total_duration_minutes && course.total_duration_minutes > 0 && (
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      ⏱️ {Math.floor(course.total_duration_minutes / 60)}h {course.total_duration_minutes % 60}m
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {course.instructor?.avatar_url ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={course.instructor.avatar_url}
                        alt={course.instructor.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {course.instructor?.full_name?.[0] || 'I'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-xl">{course.instructor?.full_name || 'Instructor'}</h3>
                    {course.instructor?.bio && (
                      <p className="text-gray-600 mt-2">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {totalVideos > 0 ? (
                  <div className="space-y-3">
                    {videos?.map((video, index) => {
                      const canView = isEnrolled || video.is_preview
                      
                      return (
                        <div 
                          key={video.id} 
                          className={`border-2 rounded-xl p-4 transition-all ${
                            canView 
                              ? 'hover:bg-gray-50 hover:border-purple-300 cursor-pointer border-gray-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3 flex-1">
                              <span className="text-gray-500 font-mono text-sm pt-1">#{index + 1}</span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                                )}
                                <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap items-center">
                                  {(video as any).video_source === 'youtube' ? (
                                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">▶️ YouTube</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-medium flex items-center gap-1">📁 Google Drive</span>
                                  )}
                                  {video.section_name && (
                                    <span className="px-2 py-1 rounded bg-gray-100">📂 {video.section_name}</span>
                                  )}
                                  {video.duration_minutes && (
                                    <span className="px-2 py-1 rounded bg-gray-100">⏱️ {video.duration_minutes} min</span>
                                  )}
                                  {video.is_preview && (
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">👁️ Preview</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!canView && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">📹</div>
                    <p>No videos yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Review Form (if enrolled) */}
                {isEnrolled && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {existingReview ? 'Edit Your Review' : 'Write a Review'}
                    </h3>
                    <ReviewForm 
                      courseId={course.id} 
                      existingReview={existingReview}
                    />
                  </div>
                )}

                {/* Reviews List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    All Reviews ({course.total_reviews || 0})
                  </h3>
                  <ReviewsList courseId={course.id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-xl text-center font-medium">
                      ✅ You&apos;re enrolled in this course!
                    </div>
                    <Link href={`/courses/${params.slug}/watch`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-lg py-6">
                        Continue Learning →
                      </Button>
                    </Link>
                  </div>
                ) : userRole === 'instructor' ? (
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 p-4 rounded-xl text-center text-sm">
                    You&apos;re viewing this as an instructor. Switch to a student account to enroll.
                  </div>
                ) : (course.price === 0 || !course.price) ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        Free
                      </div>
                      <p className="text-gray-600 text-sm">Start learning now</p>
                    </div>
                    <EnrollButton 
                      courseId={course.id} 
                      courseSlug={params.slug}
                      price={0}
                      instructorId={course.instructor_id}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        ₹{course.price.toLocaleString('en-IN')}
                      </div>
                      <p className="text-gray-600 text-sm">One-time payment</p>
                    </div>
                    
                    <PaymentButton 
                      courseId={course.id} 
                      price={course.price}
                      courseName={course.title}
                      courseSlug={params.slug}
                    />

                    <p className="text-sm text-gray-600 text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>✅</span>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>✅</span>
                    <span>{totalVideos} video lessons</span>
                  </div>
                  {previewVideos.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>✅</span>
                      <span>{previewVideos.length} free preview{previewVideos.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>✅</span>
                    <span>Learn at your own pace</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



