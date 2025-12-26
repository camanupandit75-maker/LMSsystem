import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VideoModerationActions } from '@/components/admin/VideoModerationActions'

export default async function ModerateVideosPage({ params }: { params: { courseId: string } }) {
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

  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:user_profiles!courses_instructor_id_fkey(id, full_name)
    `)
    .eq('id', params.courseId)
    .single()

  if (!course) redirect('/admin/dashboard')

  // Get all videos
  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .eq('course_id', params.courseId)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href={`/admin/instructors/${course.instructor_id}`}>
            <Button variant="ghost">← Back to Instructor</Button>
          </Link>
        </div>

        {/* Course Info */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">🎥 Video Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-600">
              Instructor: <span className="font-semibold">{course.instructor?.full_name}</span>
            </p>
            <div className="mt-4 flex gap-6 text-sm">
              <span className={`font-medium ${
                course.status === 'published' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                Status: {course.status}
              </span>
              <span className="text-gray-600">Total Videos: {videos?.length || 0}</span>
              <span className="text-gray-600">Students: {course.enrollment_count}</span>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Course Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {videos && videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div 
                    key={video.id}
                    className={`border-2 rounded-lg p-6 transition-all ${
                      video.is_approved === false
                        ? 'border-red-200 bg-red-50' 
                        : video.is_approved === true
                        ? 'border-green-200 bg-green-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                          <h3 className="font-bold text-lg">{video.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            video.is_approved === true
                              ? 'bg-green-600 text-white'
                              : video.is_approved === false
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {video.is_approved === true ? '✅ Approved' : video.is_approved === false ? '❌ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-gray-700 mb-3">{video.description}</p>
                        )}
                            <div className="flex gap-4 text-sm text-gray-600 flex-wrap items-center">
                              {(video as any).video_source === 'youtube' ? (
                                <span className="text-red-600 font-medium flex items-center gap-1">▶️ YouTube</span>
                              ) : (
                                <span className="text-indigo-600 font-medium flex items-center gap-1">📁 Google Drive</span>
                              )}
                              {video.section_name && <span>📂 {video.section_name}</span>}
                              {video.duration_minutes && <span>⏱️ {video.duration_minutes} min</span>}
                              {video.is_preview && <span className="text-blue-600 font-medium">👁️ Preview Video</span>}
                            </div>
                        {video.is_approved === false && video.rejection_reason && (
                          <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-lg p-4">
                            <p className="text-sm font-bold text-red-800 mb-1">
                              🚫 Rejection Reason:
                            </p>
                            <p className="text-sm text-red-700">{video.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <VideoModerationActions videoId={video.id} isApproved={video.is_approved} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎥</div>
                <p className="text-lg font-medium">No videos in this course</p>
                <p className="text-sm mt-2">Instructor hasn't added any videos yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

