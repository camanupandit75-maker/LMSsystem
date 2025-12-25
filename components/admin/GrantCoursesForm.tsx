'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface GrantCoursesFormProps {
  instructorId: string
  currentBonus: number
}

export function GrantCoursesForm({ instructorId, currentBonus }: GrantCoursesFormProps) {
  const [bonusCourses, setBonusCourses] = useState(currentBonus.toString())
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const bonusAmount = parseInt(bonusCourses)
      if (isNaN(bonusAmount) || bonusAmount < 0) {
        throw new Error('Please enter a valid number of courses')
      }

      if (!reason.trim()) {
        throw new Error('Please provide a reason for granting bonus courses')
      }

      // Update subscription with bonus courses
      const { error: updateError } = await supabase
        .from('instructor_subscriptions')
        .update({
          bonus_courses: bonusAmount,
          bonus_granted_by: session.user.id,
          bonus_granted_at: new Date().toISOString(),
          bonus_reason: reason
        })
        .eq('instructor_id', instructorId)
        .eq('is_active', true)

      if (updateError) throw updateError

      // Log admin action (if admin_actions table exists)
      try {
        await supabase.from('admin_actions').insert({
          admin_id: session.user.id,
          action_type: 'grant_bonus_courses',
          target_type: 'instructor',
          target_id: instructorId,
          details: {
            previous_bonus: currentBonus,
            new_bonus: bonusAmount,
            reason: reason
          }
        })
      } catch (logError) {
        // Admin actions table might not exist, continue anyway
        console.log('Could not log admin action:', logError)
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🎁</span> Grant Bonus Courses
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="bonusCourses" className="font-semibold">
            Total Bonus Courses
          </Label>
          <Input
            id="bonusCourses"
            type="number"
            min="0"
            value={bonusCourses}
            onChange={(e) => setBonusCourses(e.target.value)}
            placeholder="e.g., 5"
            required
            disabled={loading}
            className="mt-2"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            💡 Current bonus: <strong>{currentBonus}</strong> courses. Enter new total (not additional).
          </p>
        </div>

        <div>
          <Label htmlFor="reason" className="font-semibold">
            Reason for Grant
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Excellent content quality, promotional campaign, partnership agreement..."
            rows={3}
            required
            disabled={loading}
            className="mt-2"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded text-sm flex items-center gap-2">
            <span>✅</span>
            <span>Bonus courses granted successfully!</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
        >
          {loading ? '⏳ Granting...' : '✅ Grant Bonus Courses'}
        </Button>
      </form>
    </div>
  )
}

