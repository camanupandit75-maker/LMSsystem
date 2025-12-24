"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { UserPlus, Mail, Lock, ArrowRight, CheckCircle2, GraduationCap, BookOpen } from "lucide-react"
import type { UserRole } from "@/lib/types/database.types"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("student")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      // 1. Create auth user (NO email confirmation for now)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No user returned from signup")

      console.log("Auth user created:", authData.user.id)

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          role: role,
          full_name: fullName.trim(),
          avatar_url: null,
        })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      console.log("User profile created")

      // 3. If instructor, create free subscription
      if (role === "instructor") {
        const { error: subError } = await supabase
          .from("instructor_subscriptions")
          .insert({
            instructor_id: authData.user.id,
            tier: "free",
            max_courses: 1,
            used_courses: 0,
            is_active: true,
          })

        if (subError) {
          console.error("Subscription creation error:", subError)
          // Don't throw - profile created successfully
        } else {
          console.log("Instructor subscription created")
        }
      }

      // 4. Auto sign in (since email confirmation is disabled)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Auto sign-in error:", signInError)
        // Don't throw - user can sign in manually
        alert("Account created! Please sign in.")
        router.push("/auth/signin")
        return
      }

      console.log("User signed in successfully")

      // 5. Redirect based on role
      if (role === "instructor") {
        router.push("/instructor/dashboard")
      } else {
        router.push("/student/dashboard")
      }
      
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = password.length >= 6 && password === confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <motion.div
        className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
        className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          x: [0, -100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass border-2 border-white/20 rounded-3xl shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Enter your information to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">I want to sign up as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setRole("student")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      role === "student"
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <BookOpen className={`h-6 w-6 mb-2 ${role === "student" ? "text-blue-400" : "text-muted-foreground"}`} />
                    <div className={`font-semibold ${role === "student" ? "text-blue-400" : "text-muted-foreground"}`}>
                      Student
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Browse & Learn</div>
                    {role === "student" && (
                      <motion.div
                        layoutId="role-indicator"
                        className="absolute inset-0 border-2 border-blue-500 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setRole("instructor")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      role === "instructor"
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <GraduationCap className={`h-6 w-6 mb-2 ${role === "instructor" ? "text-purple-400" : "text-muted-foreground"}`} />
                    <div className={`font-semibold ${role === "instructor" ? "text-purple-400" : "text-muted-foreground"}`}>
                      Instructor
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Teach & Earn</div>
                    {role === "instructor" && (
                      <motion.div
                        layoutId="role-indicator"
                        className="absolute inset-0 border-2 border-purple-500 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-semibold">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pl-10 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pl-10 text-base rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                {password.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {password.length < 6 ? (
                      <span className="text-red-500">At least 6 characters required</span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Password strength: Good
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-semibold">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-12 pl-10 text-base rounded-xl border-2 transition-all ${
                      confirmPassword && password === confirmPassword
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : confirmPassword && password !== confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </div>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-xs text-red-500 mt-1">Passwords do not match</div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border-2 border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
                disabled={isLoading || !passwordStrength || !fullName.trim()}
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign Up as {role === "instructor" ? "Instructor" : "Student"}
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/auth/signin"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
