'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Globe, EyeOff } from 'lucide-react'

interface PublishButtonProps {
  courseId: string
  currentStatus: string
}

export function PublishButton({ courseId, currentStatus }: PublishButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePublish = async () => {
    setLoading(true)
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', courseId)

      if (error) {
        alert('Error updating course: ' + error.message)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePublish}
      disabled={loading}
      className={`rounded-xl ${
        currentStatus === 'published'
          ? 'bg-yellow-600 hover:bg-yellow-700'
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {currentStatus === 'published' ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          {loading ? 'Unpublishing...' : 'Unpublish'}
        </>
      ) : (
        <>
          <Globe className="mr-2 h-4 w-4" />
          {loading ? 'Publishing...' : 'Publish Course'}
        </>
      )}
    </Button>
  )
}




