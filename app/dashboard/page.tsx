import { createClient } from "@/lib/supabase/server"
import { VideoCard } from "@/components/VideoCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Upload, Video, TrendingUp, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalVideos = videos?.length || 0
  const recentVideos = videos?.filter((v) => {
    const videoDate = new Date(v.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return videoDate > weekAgo
  }).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Videos
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and view all your uploaded videos
              </p>
            </div>
            <Link href="/upload">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-6 py-6 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Upload Video
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Videos</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalVideos}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">This Week</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{recentVideos}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Storage</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {totalVideos > 0 ? "Active" : "Empty"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-6 text-destructive mb-8">
            <p className="font-semibold">Error loading videos</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {videos && videos.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20" />
                <Video className="h-20 w-20 text-muted-foreground relative z-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">No videos yet</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Get started by uploading your first educational video and share knowledge with your students
              </p>
              <Link href="/upload">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Upload Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <DashboardClient videos={videos || []} />
        )}
      </div>
    </div>
  )
}
