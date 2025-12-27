'use client'

import { useState } from 'react'

interface GoogleDrivePlayerProps {
  googleDriveUrl: string
  title?: string
  onComplete?: () => void
}

export function GoogleDrivePlayer({ googleDriveUrl, title, onComplete }: GoogleDrivePlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract file ID from Google Drive URL
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
    
    return url
  }

  const fileId = extractFileId(googleDriveUrl)
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4 z-10">
          <div className="text-center">
            <p className="font-bold mb-2">Error loading video</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError('Failed to load video from Google Drive')
        }}
        title={title || 'Video'}
      />
    </div>
  )
}




