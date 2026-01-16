'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  price: number
  instructorId: string
}

export function EnrollButton({ courseId, courseSlug, price, instructorId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEnroll = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push(`/auth/signin?redirect=/courses/${courseSlug}`)
        return
      }

      // Check if already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', session.user.id)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking enrollment:', checkError)
      }

      if (existingEnrollment) {
        router.push(`/courses/${courseSlug}/watch`)
        return
      }

      // For now, create enrollment directly (TODO: Add payment processing with Stripe)
      // In production, this would go through Stripe checkout first
      
      // Create enrollment with proper amount
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: session.user.id,
          course_id: courseId,
          amount_paid: price,
          progress_percentage: 0,
          is_active: true
        })
        .select()
        .maybeSingle()

      if (enrollError) {
        if (enrollError.code === '23505') { // Duplicate key
          throw new Error('You are already enrolled in this course')
        }
        throw enrollError
      }

      if (!enrollment) {
        throw new Error('Failed to create enrollment')
      }

      // Create transaction record (triggers automatic revenue split)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'enrollment',
          status: 'completed',
          amount: price,
          student_id: session.user.id,
          instructor_id: instructorId,
          course_id: courseId,
          enrollment_id: enrollment.id,
          description: `Course enrollment: ${courseId}`
        })

      if (transactionError) {
        console.error('Transaction creation error:', transactionError)
        // Don't throw - enrollment was created successfully
      }

      // Update course enrollment count
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('enrollment_count')
        .eq('id', courseId)
        .maybeSingle()

      if (courseError) {
        console.error('Error fetching course:', courseError)
      }

      if (course) {
        await supabase
          .from('courses')
          .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
          .eq('id', courseId)
      }

      // Redirect to watch page
      // Removed router.refresh() - it causes Server Component errors
      router.push(`/courses/${courseSlug}/watch`)
      
    } catch (err: any) {
      console.error('Enrollment error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        fullError: err
      })
      setError(err.message || 'Failed to enroll')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6 rounded-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Enrolling...
          </span>
        ) : price === 0 ? (
          'Enroll for Free'
        ) : (
          `Enroll Now - $${price.toFixed(2)}`
        )}
      </Button>
      
      {error && (
        <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      {price === 0 && (
        <p className="text-center text-xs text-gray-500 mt-2">
          This course is free! Click to start learning.
        </p>
      )}
    </div>
  )
}




