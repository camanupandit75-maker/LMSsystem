"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface VideoCardProps {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  createdAt: string
}

export function VideoCard({ id, title, description, thumbnailUrl, createdAt }: VideoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }
  
  const timeAgo = formatDate(createdAt)

  return (
    <Link href={`/video/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 rounded-2xl">
          {/* Gradient border on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 rounded-2xl" />
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-2xl overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="h-16 w-16 text-white/50" />
                    </motion.div>
                  </div>
                )}
                {/* Overlay with play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30"
                  >
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  </motion.div>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <CardTitle className="line-clamp-2 text-lg font-bold mb-2 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
                {title}
              </CardTitle>
              {description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between p-5 pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
