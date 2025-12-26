'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteVideoButtonProps {
  videoId: string
  videoTitle: string
  courseId: string
}

export function DeleteVideoButton({ videoId, videoTitle, courseId }: DeleteVideoButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Delete the video
      const { error: deleteError } = await supabase
        .from('course_videos')
        .delete()
        .eq('id', videoId)

      if (deleteError) throw deleteError

      // Update course video count
      const { data: course } = await supabase
        .from('courses')
        .select('total_videos')
        .eq('id', courseId)
        .single()

      if (course) {
        await supabase
          .from('courses')
          .update({ total_videos: Math.max(0, (course.total_videos || 0) - 1) })
          .eq('id', courseId)
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      alert(`Failed to delete video: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Video?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4">
            Are you sure you want to delete <strong>"{videoTitle}"</strong>? This action cannot be undone.
            <br />
            <br />
            <span className="text-sm text-gray-500">
              The video will be permanently removed from this course.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            {loading ? 'Deleting...' : 'Delete Video'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

