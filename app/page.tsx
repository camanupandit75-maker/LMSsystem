"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Upload, Users, Zap, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

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
      duration: 0.5,
    },
  },
}

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          {/* Animated blobs */}
          <motion.div
            className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"
            animate={{
              x: [0, 100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>AI-Powered Learning Platform</span>
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="block">Transform Your</span>
              <span className="block gradient-text">Learning Experience</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-xl md:text-2xl leading-8 text-muted-foreground max-w-3xl mx-auto"
            >
              Upload, organize, and share educational videos with your students.
              Built with Next.js, Supabase, and cutting-edge web technologies.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-2xl border-2 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: "10K+", label: "Videos Uploaded" },
                { value: "5K+", label: "Active Users" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="gradient-text">manage your courses</span>
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for educators and students
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                icon: Upload,
                title: "Easy Upload",
                description: "Drag and drop videos with progress tracking and instant preview",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Video,
                title: "Video Library",
                description: "Organize and manage all your educational content in one place",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "User Management",
                description: "Secure authentication and comprehensive user profiles",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Zap,
                title: "AI Ready",
                description: "Built-in hooks for transcription, summaries, and quizzes",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 rounded-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 w-fit`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-10" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative glass rounded-3xl p-12 md:p-16 text-center border-2 border-purple-500/20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of educators around the world using our platform to transform their teaching
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create Your Account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
