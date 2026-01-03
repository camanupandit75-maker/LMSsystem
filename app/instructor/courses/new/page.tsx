'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { CourseCategory } from '@/lib/types/database.types'

export default function NewCoursePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [price, setPrice] = useState('0')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching categories:', error)
      } else if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Get instructor's subscription limits
      const { data: subscription, error: subError } = await supabase
        .from('instructor_subscriptions')
        .select('courses_allowed, bonus_courses, is_active, id')
        .eq('instructor_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle()

      console.log('Subscription query result:', { subscription, subError })

      if (subError) {
        console.error('Subscription query error:', subError)
        throw new Error(`Failed to check subscription: ${subError.message}`)
      }

      if (!subscription) {
        throw new Error('No active subscription found. Please contact support.')
      }

      // Count existing courses
      const { count: currentCourses, error: countError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', session.user.id)

      if (countError) {
        console.error('Course count error:', countError)
        throw new Error(`Failed to count courses: ${countError.message}`)
      }

      // Calculate limits using correct column names
      const totalAllowed = (subscription.courses_allowed || 1) + (subscription.bonus_courses || 0)
      const coursesUsed = currentCourses || 0

      // Check limit
      if (coursesUsed >= totalAllowed) {
        throw new Error(`Course limit reached (${coursesUsed}/${totalAllowed} used). Please upgrade or request bonus courses.`)
      }

      // Create course
      const slug = generateSlug(title)
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          instructor_id: session.user.id,
          title,
          description: description || null,
          category_id: categoryId || null,
          level,
          price: parseFloat(price) || 0,
          thumbnail_url: thumbnailUrl || null,
          slug,
          status: 'draft'
        })
        .select()
        .single()

      if (courseError) throw courseError

      // Course created successfully - no need to update used_courses
      // The count is calculated dynamically from the courses table

      // Redirect to course management
      router.push(`/instructor/courses/${course.id}`)
      
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
          <Link href="/instructor/dashboard">
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Course 📚
            </CardTitle>
            <p className="text-gray-600 mt-2">Fill in the details to create your course</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Course Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Web Development Bootcamp"
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
                  placeholder="What will students learn in this course?"
                  rows={5}
                  disabled={loading}
                  className="mt-2 rounded-xl"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                <Select 
                  value={categoryId} 
                  onValueChange={setCategoryId} 
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
                {categories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                )}
              </div>

              {/* Level */}
              <div>
                <Label htmlFor="level" className="text-base font-semibold">Level</Label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)} disabled={loading}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price" className="text-base font-semibold">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <Label htmlFor="thumbnail" className="text-base font-semibold">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                  className="mt-2 h-12 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">Add a thumbnail image URL for your course</p>
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
                  disabled={loading || !title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </span>
                  ) : (
                    'Create Course'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



