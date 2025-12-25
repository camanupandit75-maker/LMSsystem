'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddVideoPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [googleDriveUrl, setGoogleDriveUrl] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const extractFileId = (url: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const fileId = extractFileId(googleDriveUrl)
      if (!fileId) {
        throw new Error('Invalid Google Drive URL. Please paste a valid shareable link.')
      }

      // Get next order index
      const { data: videos } = await supabase
        .from('course_videos')
        .select('order_index')
        .eq('course_id', params.id)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrder = videos && videos.length > 0 ? videos[0].order_index + 1 : 0

      // Insert video
      const { error: videoError } = await supabase
        .from('course_videos')
        .insert({
          course_id: params.id,
          title,
          description: description || null,
          google_drive_url: googleDriveUrl,
          google_drive_file_id: fileId,
          section_name: sectionName || null,
          duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
          is_preview: isPreview,
          order_index: nextOrder
        })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href={`/instructor/courses/${params.id}`}>
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Add Video 📹
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Upload your video to Google Drive, make it shareable, and paste the link below
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Drive URL */}
              <div>
                <Label htmlFor="url" className="text-base font-semibold">Google Drive Video URL *</Label>
                <Input
                  id="url"
                  value={googleDriveUrl}
                  onChange={(e) => setGoogleDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  required
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Make sure the video is set to "Anyone with the link can view" in Google Drive settings
                </p>
              </div>

              {/* Title */}
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

              {/* Description */}
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
                  Allow free preview (students can watch without enrolling)
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
                  disabled={loading || !title.trim() || !googleDriveUrl.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
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
            <h3 className="font-semibold mb-3 text-lg">📝 How to get Google Drive link:</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Upload your video to Google Drive</li>
              <li>Right-click the video → "Share"</li>
              <li>Change to "Anyone with the link"</li>
              <li>Copy the link and paste it above</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



