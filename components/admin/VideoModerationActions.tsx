'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface VideoModerationActionsProps {
  videoId: string
  isApproved: boolean | null | undefined
}

export function VideoModerationActions({ videoId, isApproved }: VideoModerationActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('course_videos')
        .update({
          is_approved: true,
          approval_status: 'approved',
          rejection_reason: null,
          moderated_by: session.user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', videoId)

      if (updateError) throw updateError

      // Log action (if admin_actions table exists)
      try {
        await supabase.from('admin_actions').insert({
          admin_id: session.user.id,
          action_type: 'approve_video',
          target_type: 'video',
          target_id: videoId,
          details: { action: 'approved' }
        })
      } catch (logError) {
        // Admin actions table might not exist, continue anyway
        console.log('Could not log admin action:', logError)
      }

      router.refresh()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('course_videos')
        .update({
          is_approved: false,
          approval_status: 'rejected',
          rejection_reason: rejectionReason,
          moderated_by: session.user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', videoId)

      if (updateError) throw updateError

      // Log action (if admin_actions table exists)
      try {
        await supabase.from('admin_actions').insert({
          admin_id: session.user.id,
          action_type: 'reject_video',
          target_type: 'video',
          target_id: videoId,
          details: { 
            action: 'rejected',
            reason: rejectionReason
          }
        })
      } catch (logError) {
        // Admin actions table might not exist, continue anyway
        console.log('Could not log admin action:', logError)
      }

      setShowRejectForm(false)
      setRejectionReason('')
      router.refresh()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 border-t-2 pt-4">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!showRejectForm && (
        <div className="flex gap-3">
          {isApproved !== true && (
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 font-semibold"
            >
              {loading ? '⏳ Approving...' : '✅ Approve Video'}
            </Button>
          )}
          {isApproved === true && (
            <Button
              onClick={() => setShowRejectForm(true)}
              variant="destructive"
              disabled={loading}
              className="font-semibold"
            >
              ❌ Reject Video
            </Button>
          )}
          {isApproved === false && (
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 font-semibold"
            >
              {loading ? '⏳ Approving...' : '✅ Approve Video'}
            </Button>
          )}
        </div>
      )}

      {showRejectForm && (
        <div className="bg-white border-2 border-red-400 rounded-lg p-5">
          <Label htmlFor="reason" className="text-red-800 font-bold text-base">
            🚫 Reason for Rejection
          </Label>
          <Textarea
            id="reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Contains copyrighted material, violates community guidelines, inappropriate content..."
            rows={4}
            className="mt-3"
          />
          <p className="text-xs text-gray-600 mt-2">
            This reason will be visible to the instructor
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              variant="destructive"
              className="font-semibold"
            >
              {loading ? '⏳ Rejecting...' : '🚫 Confirm Rejection'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false)
                setRejectionReason('')
                setError(null)
              }}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}





