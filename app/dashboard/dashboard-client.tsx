"use client"

import { VideoCard } from "@/components/VideoCard"
import { motion } from "framer-motion"

interface DashboardClientProps {
  videos: Array<{
    id: string
    title: string
    description?: string
    thumbnail_url?: string
    created_at: string
  }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
}

export function DashboardClient({ videos }: DashboardClientProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {videos.map((video, index) => (
        <motion.div key={video.id} variants={itemVariants}>
          <VideoCard
            id={video.id}
            title={video.title}
            description={video.description}
            thumbnailUrl={video.thumbnail_url}
            createdAt={video.created_at}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}








