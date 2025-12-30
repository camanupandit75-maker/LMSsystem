'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  courseId: string
  existingReview?: {
    id: string
    rating: number
    review_text?: string
  }
  onSuccess?: () => void
}

export function ReviewForm({ courseId, existingReview, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkEnrollment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkEnrollment() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .single()

    setIsEnrolled(!!data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/auth/signin?redirect=/courses/${courseId}`)
        return
      }

      if (!isEnrolled) {
        setError('You must be enrolled in this course to leave a review')
        setLoading(false)
        return
      }

      if (rating === 0) {
        setError('Please select a rating')
        setLoading(false)
        return
      }

      const reviewData = {
        course_id: courseId,
        student_id: session.user.id,
        rating,
        review_text: reviewText.trim() || null,
        is_verified_purchase: true
      }

      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('course_reviews')
          .update(reviewData)
          .eq('id', existingReview.id)

        if (updateError) throw updateError
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('course_reviews')
          .insert(reviewData)

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('You have already reviewed this course')
          }
          throw insertError
        }
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!isEnrolled && !existingReview) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        You must be enrolled in this course to leave a review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Your Rating *
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="review" className="text-base font-semibold">
          Your Review (Optional)
        </Label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this course..."
          rows={4}
          maxLength={1000}
          className="mt-2 rounded-xl"
        />
        <p className="text-xs text-gray-500 mt-1">
          {reviewText.length} / 1000 characters
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="gradient-primary text-white font-semibold rounded-xl"
      >
        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </Button>
    </form>
  )
}

