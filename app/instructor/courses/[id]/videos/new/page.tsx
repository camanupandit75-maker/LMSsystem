'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { CourseCategory } from '@/lib/types/database.types'
import InstructorAgreementModal from '@/components/legal/InstructorAgreementModal'

export default function AddVideoPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoSource, setVideoSource] = useState<'google_drive' | 'youtube'>('google_drive')
  const [videoUrl, setVideoUrl] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [courseCategory, setCourseCategory] = useState<{ name: string; icon?: string; id: string } | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [checkingAgreement, setCheckingAgreement] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check agreement status and fetch categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Check agreement status
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('instructor_agreement_accepted')
            .eq('id', session.user.id)
            .single()

          if (profile?.instructor_agreement_accepted) {
            setAgreementAccepted(true)
          } else {
            // Show modal if agreement not accepted
            setShowAgreementModal(true)
          }
        }
        setCheckingAgreement(false)

        // Fetch all categories
        const { data: allCategories, error: categoriesError } = await supabase
          .from('course_categories')
          .select('*')
          .order('name')

        if (!categoriesError && allCategories) {
          setCategories(allCategories)
        }

        // Fetch current course category
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('category_id')
          .eq('id', params.id)
          .single()

        if (!courseError && course?.category_id) {
          setSelectedCategoryId(course.category_id)
          
          // Find the category details
          const category = allCategories?.find(c => c.id === course.category_id)
          if (category) {
            setCourseCategory({
              id: category.id,
              name: category.name,
              icon: category.icon
            })
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setCheckingAgreement(false)
      }
    }
    fetchData()
  }, [params.id, supabase])

  // Validate Google Drive URL
  const isValidGoogleDriveUrl = (url: string): boolean => {
    return url.includes('drive.google.com') && 
           (url.includes('/file/d/') || url.includes('id='))
  }

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  // Extract Google Drive file ID
  const extractGoogleDriveId = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([^\/]+)/,
      /id=([^&]+)/,
      /^([a-zA-Z0-9_-]{25,})$/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check agreement before submitting
    if (!agreementAccepted) {
      setShowAgreementModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Validate video URL based on source
      if (videoSource === 'google_drive' && !isValidGoogleDriveUrl(videoUrl)) {
        throw new Error('Please provide a valid Google Drive link')
      }

      if (videoSource === 'youtube' && !isValidYouTubeUrl(videoUrl)) {
        throw new Error('Please provide a valid YouTube link')
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Get next order index
      const { data: videos } = await supabase
        .from('course_videos')
        .select('order_index')
        .eq('course_id', params.id)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrder = videos && videos.length > 0 ? videos[0].order_index + 1 : 0

      // Prepare video data based on source
      const videoData: any = {
        course_id: params.id,
        title,
        description: description || null,
        video_source: videoSource,
        section_name: sectionName || null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        is_preview: isPreview,
        order_index: nextOrder
      }

      // Add source-specific fields
      if (videoSource === 'google_drive') {
        const fileId = extractGoogleDriveId(videoUrl)
        if (!fileId) {
          throw new Error('Invalid Google Drive URL. Could not extract file ID.')
        }
        videoData.google_drive_url = videoUrl
        videoData.google_drive_file_id = fileId
      } else {
        // YouTube
        const videoId = extractYouTubeId(videoUrl)
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Could not extract video ID.')
        }
        videoData.google_drive_url = videoUrl // Store YouTube URL in same field for compatibility
        videoData.google_drive_file_id = videoId // Store YouTube ID in same field
      }

      // Update course category if changed
      if (selectedCategoryId) {
        const { error: categoryUpdateError } = await supabase
          .from('courses')
          .update({ category_id: selectedCategoryId })
          .eq('id', params.id)

        if (categoryUpdateError) {
          console.error('Error updating category:', categoryUpdateError)
          // Don't throw - category update is not critical
        }
      }

      // Insert video
      const { error: videoError } = await supabase
        .from('course_videos')
        .insert(videoData)

      if (videoError) throw videoError

      // Update course video count
      const { data: course } = await supabase
        .from('courses')
        .select('total_videos')
        .eq('id', params.id)
        .single()

      if (course) {
        await supabase
          .from('courses')
          .update({ total_videos: (course.total_videos || 0) + 1 })
          .eq('id', params.id)
      }

      router.push(`/instructor/courses/${params.id}`)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAgreementAccepted = () => {
    setAgreementAccepted(true)
    setShowAgreementModal(false)
  }

  const handleAgreementCancel = () => {
    router.back()
  }

  if (checkingAgreement) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 p-8">
      {showAgreementModal && (
        <InstructorAgreementModal
          onAccept={handleAgreementAccepted}
          onCancel={handleAgreementCancel}
        />
      )}
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href={`/instructor/courses/${params.id}`}>
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-gradient">
                  Add Video 📹
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Choose your video source and add it to your course
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Category Selection */}
              <div>
                <Label htmlFor="category" className="text-base font-semibold">Course Category *</Label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon || '📂'}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1.5">
                  This category will be applied to your course and helps students find your content
                </p>
              </div>

              {/* Video Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Video Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  required
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              {/* Video Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will students learn in this video?"
                  rows={3}
                  disabled={loading}
                  className="mt-2 rounded-xl"
                />
              </div>

              {/* Video Source Selection */}
              <div>
                <Label className="mb-3 block text-base font-semibold">Video Source *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSource('google_drive')
                      setVideoUrl('')
                    }}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      videoSource === 'google_drive'
                        ? 'border-indigo-600 bg-indigo-50 shadow-md scale-105'
                        : 'border-gray-300 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">📁</div>
                    <div className={`font-semibold ${videoSource === 'google_drive' ? 'text-indigo-600' : 'text-gray-700'}`}>
                      Google Drive
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Upload from Drive</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVideoSource('youtube')
                      setVideoUrl('')
                    }}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      videoSource === 'youtube'
                        ? 'border-red-600 bg-red-50 shadow-md scale-105'
                        : 'border-gray-300 hover:border-red-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">▶️</div>
                    <div className={`font-semibold ${videoSource === 'youtube' ? 'text-red-600' : 'text-gray-700'}`}>
                      YouTube
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Link from YouTube</div>
                  </button>
                </div>
              </div>

              {/* Video URL Input */}
              <div>
                <Label htmlFor="videoUrl" className="text-base font-semibold">
                  {videoSource === 'google_drive' ? 'Google Drive Link' : 'YouTube Link'} *
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={
                    videoSource === 'google_drive'
                      ? 'https://drive.google.com/file/d/...'
                      : 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                  }
                  required
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {videoSource === 'google_drive' ? (
                    <>
                      💡 Make sure the file is set to{' '}
                      <span className="font-semibold">"Anyone with the link"</span> in sharing settings
                    </>
                  ) : (
                    <>
                      💡 Video must be{' '}
                      <span className="font-semibold">public or unlisted</span> on YouTube
                    </>
                  )}
                </p>
                {videoUrl && videoSource === 'google_drive' && !isValidGoogleDriveUrl(videoUrl) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    ❌ Invalid Google Drive URL
                  </p>
                )}
                {videoUrl && videoSource === 'youtube' && !isValidYouTubeUrl(videoUrl) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    ❌ Invalid YouTube URL
                  </p>
                )}
                {videoUrl && videoSource === 'google_drive' && isValidGoogleDriveUrl(videoUrl) && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    ✅ Valid Google Drive URL
                  </p>
                )}
                {videoUrl && videoSource === 'youtube' && isValidYouTubeUrl(videoUrl) && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    ✅ Valid YouTube URL
                  </p>
                )}
              </div>

              {/* Section Name */}
              <div>
                <Label htmlFor="section" className="text-base font-semibold">Section Name (optional)</Label>
                <Input
                  id="section"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g., Getting Started, Advanced Topics"
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-base font-semibold">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g., 15"
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              {/* Preview Checkbox */}
              <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl">
                <Checkbox
                  id="preview"
                  checked={isPreview}
                  onCheckedChange={(checked) => setIsPreview(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="preview" className="cursor-pointer text-base">
                  👁️ Allow free preview (students can watch without enrolling)
                </Label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !videoUrl.trim()}
                  className="flex-1 gradient-primary text-white font-semibold rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding Video...
                    </span>
                  ) : (
                    'Add Video'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200 border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-lg">
              {videoSource === 'google_drive' ? '📝 How to get Google Drive link:' : '📝 How to get YouTube link:'}
            </h3>
            {videoSource === 'google_drive' ? (
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Upload your video to Google Drive</li>
                <li>Right-click the video → "Share"</li>
                <li>Change to "Anyone with the link"</li>
                <li>Copy the link and paste it above</li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Upload your video to YouTube</li>
                <li>Set visibility to "Public" or "Unlisted"</li>
                <li>Copy the video URL from the address bar</li>
                <li>Paste it above (supports youtube.com/watch?v= or youtu.be/ formats)</li>
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
