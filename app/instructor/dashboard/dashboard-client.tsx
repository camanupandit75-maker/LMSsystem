"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Eye, DollarSign, ArrowRight, Video } from "lucide-react"
import type { Course } from "@/lib/types/database.types"

interface InstructorDashboardClientProps {
  courses: Course[]
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

export function InstructorDashboardClient({ courses }: InstructorDashboardClientProps) {
  const displayedCourses = courses.slice(0, 6)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {displayedCourses.map((course) => (
        <motion.div key={course.id} variants={itemVariants}>
          <Link href={`/instructor/courses/${course.id}/edit`}>
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 rounded-2xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 blur transition-opacity duration-300 rounded-2xl" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </CardTitle>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      course.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : course.status === "draft"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{course.total_videos || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{course.enrollment_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <DollarSign className="h-4 w-4" />
                      <span>${course.total_revenue?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

