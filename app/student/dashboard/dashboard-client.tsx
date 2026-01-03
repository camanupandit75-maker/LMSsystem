"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Clock, DollarSign, ArrowRight, User } from "lucide-react"
import Image from "next/image"
import type { Course, Enrollment } from "@/lib/types/database.types"

interface StudentDashboardClientProps {
  enrollments?: Array<Enrollment & { courses: Course }>
  courses?: Array<Course & { user_profiles?: { full_name: string; avatar_url?: string } }>
  type: "enrolled" | "catalog"
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

export function StudentDashboardClient({ enrollments, courses, type }: StudentDashboardClientProps) {
  if (type === "enrolled" && enrollments) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {enrollments.map((enrollment) => {
          const course = enrollment.courses
          if (!course) return null

          return (
            <motion.div key={enrollment.id} variants={itemVariants}>
              <Link href={`/courses/${course.slug || course.id}/watch`}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 rounded-2xl cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 blur transition-opacity duration-300 rounded-2xl" />
                  <CardHeader className="p-0">
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Play className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                        <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-semibold text-white">
                          {enrollment.progress_percentage}% Complete
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <CardTitle className="line-clamp-2 text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </CardTitle>
                    {course.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          <span>{course.total_videos || 0} videos</span>
                        </div>
                        {course.total_duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{course.total_duration_minutes} min</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  if (type === "catalog" && courses) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {courses.map((course) => (
          <motion.div key={course.id} variants={itemVariants}>
            <Link href={`/courses/${course.slug || course.id}`}>
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 rounded-2xl cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 blur transition-opacity duration-300 rounded-2xl" />
                <CardHeader className="p-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                      <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <CardTitle className="line-clamp-2 text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </CardTitle>
                  {course.user_profiles && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{course.user_profiles.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-400">
                      <DollarSign className="h-5 w-5" />
                      <span>{course.price.toFixed(2)}</span>
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

  return null
}







