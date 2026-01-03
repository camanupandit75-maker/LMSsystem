import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'

interface ReviewsListProps {
  courseId: string
}

export async function ReviewsList({ courseId }: ReviewsListProps) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('course_reviews')
    .select(`
      *,
      student:user_profiles!course_reviews_student_id_fkey(full_name)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⭐</div>
          <p className="text-gray-600 text-lg">
            No reviews yet. Be the first to review!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <Card key={review.id} className="bg-white rounded-xl shadow-lg border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {review.student?.full_name || 'Anonymous'}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            {review.review_text && (
              <p className="text-gray-700 mt-3 leading-relaxed">
                {review.review_text}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}





