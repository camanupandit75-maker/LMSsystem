import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VideoPlayer } from '@/components/VideoPlayer'
import { ArrowLeft } from 'lucide-react'

export default async function WatchCoursePage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { v?: string }
}) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get course by slug or id
  let { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name, slug, icon)
    `)
    .eq('slug', params.slug)
    .maybeSingle()

  if (courseError) {
    console.error('Error fetching course by slug:', courseError)
  }

  // Fallback to ID if slug not found
  if (!course) {
    const { data: courseById, error: courseByIdError } = await supabase
      .from('courses')
      .select(`
        *,
        category:course_categories(id, name, slug, icon)
      `)
      .eq('id', params.slug)
      .maybeSingle()
    
    if (courseByIdError) {
      console.error('Error fetching course by ID:', courseByIdError)
    }
    
    course = courseById
  }

  if (!course) redirect('/courses')

  // Check enrollment
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', session.user.id)
    .eq('course_id', course.id)
    .eq('is_active', true)
    .maybeSingle()

  if (enrollmentError) {
    console.error('Error checking enrollment:', enrollmentError)
  }

  if (!enrollment) redirect(`/courses/${params.slug}`)

  // Get all videos
  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  // Get current video from query param, last watched, or first video
  const videoId = searchParams.v || enrollment.last_watched_video_id || videos?.[0]?.id
  const currentVideo = videos?.find(v => v.id === videoId) || videos?.[0]

  if (!currentVideo || !videos || videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📹</div>
              <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
              <p className="text-gray-600 mb-6">This course doesn't have any videos yet. Check back soon!</p>
              <Link href="/student/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <Link href="/student/dashboard">
            <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-white text-xl font-semibold text-center flex-1">{course.title}</h1>
          <div className="w-32"></div> {/* Spacer for center alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Video Player */}
          <div className="lg:col-span-2 bg-black p-6 lg:p-8">
            <VideoPlayer 
              videoUrl={currentVideo.google_drive_url}
              videoSource={(currentVideo as any).video_source || 'google_drive'}
              title={currentVideo.title}
            />
            
            <div className="mt-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
              {currentVideo.description && (
                <p className="text-gray-300 mb-4">{currentVideo.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-400">
                {currentVideo.section_name && (
                  <span className="px-3 py-1 rounded-full bg-gray-800">📂 {currentVideo.section_name}</span>
                )}
                {currentVideo.duration_minutes && (
                  <span className="px-3 py-1 rounded-full bg-gray-800">⏱️ {currentVideo.duration_minutes} minutes</span>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="lg:col-span-1 bg-gray-900 h-[calc(100vh-73px)] overflow-y-auto border-l border-gray-800">
            <div className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Course Content</h3>
              
              {/* Progress */}
              <div className="mb-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span className="font-medium">Your Progress</span>
                  <span className="font-bold text-blue-400">{enrollment.progress_percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${enrollment.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Video List */}
              <div className="space-y-2">
                {videos.map((video, index) => {
                  const isActive = video.id === currentVideo.id
                  
                  return (
                    <Link 
                      key={video.id}
                      href={`/courses/${params.slug}/watch?v=${video.id}`}
                      className={`block rounded-xl p-4 transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className={`font-mono text-sm ${isActive ? 'opacity-90' : 'opacity-70'}`}>
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm mb-1 ${isActive ? 'text-white' : 'text-gray-200'}`}>
                            {video.title}
                          </h4>
                          <div className="flex gap-2 text-xs opacity-80 flex-wrap">
                            <span className="text-base">
                              {(video as any).video_source === 'youtube' ? '▶️' : '📁'}
                            </span>
                            {video.duration_minutes && (
                              <span>⏱️ {video.duration_minutes}m</span>
                            )}
                            {isActive && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                Playing
                              </span>
                            )}
                            {video.is_preview && (
                              <span>👁️ Preview</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

