import { createClient } from "@/lib/supabase/server"
import { UploadForm } from "@/components/UploadForm"
import { redirect } from "next/navigation"

export default async function UploadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Video
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your educational content with students around the world
          </p>
        </div>
        <UploadForm />
      </div>
    </div>
  )
}
