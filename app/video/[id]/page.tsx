import { createClient } from "@/lib/supabase/server"
import { VideoPlayer } from "@/components/VideoPlayer"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function VideoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: video, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !video) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>
        <VideoPlayer
          videoUrl={video.video_url}
          title={video.title}
          description={video.description}
        />
      </div>
    </div>
  )
}
