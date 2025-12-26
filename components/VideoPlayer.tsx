'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  videoSource: 'google_drive' | 'youtube'
  title?: string
  onComplete?: () => void
}

export function VideoPlayer({ videoUrl, videoSource, title, onComplete }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract Google Drive file ID
  const extractGoogleDriveId = (url: string): string | null => {
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

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const renderPlayer = () => {
    if (videoSource === 'youtube') {
      const videoId = extractYouTubeId(videoUrl)
      if (!videoId) {
        return (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white p-4">
            <div className="text-center">
              <p className="font-bold mb-2">Invalid YouTube URL</p>
              <p className="text-sm">Could not extract video ID from URL</p>
            </div>
          </div>
        )
      }

      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title || 'YouTube Video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError('Failed to load YouTube video')
          }}
        />
      )
    }

    // Google Drive
    const fileId = extractGoogleDriveId(videoUrl)
    if (!fileId) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white p-4">
          <div className="text-center">
            <p className="font-bold mb-2">Invalid Google Drive URL</p>
            <p className="text-sm">Could not extract file ID from URL</p>
          </div>
        </div>
      )
    }

    return (
      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title={title || 'Google Drive Video'}
        className="w-full h-full"
        allow="autoplay"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError('Failed to load video from Google Drive')
        }}
      />
    )
  }

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
      <div className="w-full h-full">
        {renderPlayer()}
      </div>
    </div>
  )
}
