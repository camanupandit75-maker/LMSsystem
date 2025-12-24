"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  description?: string
}

export function VideoPlayer({ videoUrl, title, description }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100
      setProgress(percent)
    }

    video.addEventListener("timeupdate", updateProgress)
    video.addEventListener("play", () => setIsPlaying(true))
    video.addEventListener("pause", () => setIsPlaying(false))
    
    return () => {
      video.removeEventListener("timeupdate", updateProgress)
      video.removeEventListener("play", () => setIsPlaying(true))
      video.removeEventListener("pause", () => setIsPlaying(false))
    }
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  function toggleFullscreen() {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="glass border-b border-white/10 p-6">
        <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-base text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative aspect-video w-full overflow-hidden bg-black group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Custom Controls Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
          >
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-12 w-12"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-12 w-12"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-12 w-12"
              >
                <Maximize2 className="h-5 w-5 text-white" />
              </Button>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
