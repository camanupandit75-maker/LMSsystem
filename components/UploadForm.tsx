"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Video as VideoIcon, CheckCircle2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    
    // Validate file type
    const validTypes = ["video/mp4", "video/mov", "video/quicktime", "video/webm"]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid video file (MP4, MOV, or WebM)")
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 500MB")
      return
    }

    setFile(selectedFile)
    setError(null)
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".webm"],
    },
    maxFiles: 1,
  })

  async function handleUpload() {
    if (!file) {
      setError("Please select a file")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload videos")
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `videos/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath)

      // Create database record
      const { data: videoData, error: dbError } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
          status: "uploaded",
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Reset form
      setFile(null)
      setTitle("")
      setDescription("")
      setUploadProgress(0)

      // Redirect to video page
      router.push(`/video/${videoData.id}`)
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.")
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-2xl rounded-3xl">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Video
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          Upload educational videos to share with your students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Modern Dropzone */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Video File</Label>
          <div
            {...getRootProps()}
            className={`relative group cursor-pointer transition-all duration-300 ${
              isDragActive ? "scale-[1.02]" : ""
            }`}
          >
            {/* Animated gradient border */}
            <div
              className={`absolute -inset-1 rounded-2xl blur transition-opacity duration-300 ${
                isDragActive
                  ? "opacity-100 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  : "opacity-0 group-hover:opacity-50 bg-gradient-to-r from-blue-500 to-purple-500"
              }`}
            />
            
            <div
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                isDragActive
                  ? "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20"
                  : file
                  ? "border-green-500 bg-green-500/10 dark:bg-green-500/20"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 group-hover:border-blue-400 dark:group-hover:border-blue-600"
              }`}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500"
                    >
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold mb-1">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="rounded-xl hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500"
                    >
                      {isDragActive ? (
                        <Sparkles className="h-10 w-10 text-white" />
                      ) : (
                        <Upload className="h-10 w-10 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        {isDragActive
                          ? "Drop your video here"
                          : "Drag & drop a video file here"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse • MP4, MOV, WebM • Max 500MB
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-semibold">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            disabled={isUploading}
            className="h-12 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-semibold">
            Description
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description (optional)"
            disabled={isUploading}
            className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
          />
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-600 dark:text-blue-400">Uploading...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl bg-red-500/10 border-2 border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !title.trim() || isUploading}
          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="h-5 w-5" />
              </motion.div>
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Video
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
