import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Play, Globe, EyeOff } from 'lucide-react'
import { PublishButton } from './publish-button'

export default async function ManageCoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .eq('instructor_id', session.user.id)
    .single()

  if (!course) redirect('/instructor/dashboard')

  // Get videos
  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .eq('course_id', params.id)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/instructor/dashboard">
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6 border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {course.title}
                </CardTitle>
                <p className="text-gray-600 text-lg">{course.description}</p>
              </div>
              <div className="flex gap-2">
                <PublishButton courseId={params.id} currentStatus={course.status} />
                <Link href={`/instructor/courses/${params.id}/edit`}>
                  <Button variant="outline" className="rounded-xl">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full font-semibold ${
                course.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : course.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Status: {course.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                💰 ${course.price}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                📹 {course.total_videos} videos
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                👥 {course.enrollment_count} students
              </span>
              {course.category && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  📂 {course.category}
                </span>
              )}
              {course.level && (
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold capitalize">
                  🎯 {course.level}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Course Videos</CardTitle>
            <Link href={`/instructor/courses/${params.id}/videos/new`}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {videos && videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div 
                    key={video.id} 
                    className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-300 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{video.title}</h4>
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {(video as any).video_source === 'youtube' ? (
                              <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">
                                ▶️ YouTube
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-medium flex items-center gap-1">
                                📁 Google Drive
                              </span>
                            )}
                            {video.section_name && (
                              <span className="px-2 py-1 rounded bg-gray-100">📂 {video.section_name}</span>
                            )}
                            {video.duration_minutes && (
                              <span className="px-2 py-1 rounded bg-gray-100">⏱️ {video.duration_minutes} mins</span>
                            )}
                            {video.is_preview && (
                              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">👁️ Preview</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/instructor/courses/${params.id}/videos/${video.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-lg font-medium mb-2">No videos yet</p>
                <p className="text-sm mb-6">Add your first video to get started!</p>
                <Link href={`/instructor/courses/${params.id}/videos/new`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Video
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
