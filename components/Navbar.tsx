"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun, LogOut, Video, BookOpen, GraduationCap, Settings, DollarSign } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import type { UserRole } from "@/lib/types/database.types"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [hasEnrollments, setHasEnrollments] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setUserRole(null)
        setUserProfile(null)
        setHasEnrollments(false)
      }
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      await fetchUserData(user.id)
    }
  }

  async function fetchUserData(userId: string) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()
    
    setUserRole(profile?.role || null)
    setUserProfile(profile)

    // Check if user has enrollments (for multi-role access)
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", userId)
      .eq("is_active", true)
      .limit(1)
    
    setHasEnrollments(enrollments && enrollments.length > 0)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserRole(null)
    router.push("/")
    router.refresh()
  }

  if (!mounted) return null

  const userInitials = user?.email?.charAt(0).toUpperCase() || "U"
  
  // Determine dashboard path based on role
  const getDashboardPath = () => {
    if (userRole === "instructor") return "/instructor/dashboard"
    if (userRole === "admin") return "/admin/dashboard"
    return "/student/dashboard"
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-white/20 shadow-lg"
          : "backdrop-blur-md bg-white/60 dark:bg-black/60 border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity" />
              <Video className="h-6 w-6 relative z-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ScholaPulse
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Role-based navigation */}
                {userRole === "instructor" && (
                  <>
                    <Link href="/instructor/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative rounded-xl ${
                          pathname.startsWith("/instructor")
                            ? "text-purple-600 dark:text-purple-400"
                            : ""
                        }`}
                      >
                        Dashboard
                        {pathname.startsWith("/instructor") && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Button>
                    </Link>
                    <Link href="/instructor/courses">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Courses
                      </Button>
                    </Link>
                    <Link href="/instructor/earnings">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Earnings
                      </Button>
                    </Link>
                  </>
                )}
                
                {userRole === "student" && (
                  <>
                    <Link href="/student/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative rounded-xl ${
                          pathname.startsWith("/student")
                            ? "text-blue-600 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        Dashboard
                        {pathname.startsWith("/student") && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Button>
                    </Link>
                    <Link href="/courses">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Button>
                    </Link>
                  </>
                )}

                {userRole === "admin" && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative rounded-xl ${
                          pathname.startsWith("/admin")
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        Admin
                        {pathname.startsWith("/admin") && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Button>
                    </Link>
                  </>
                )}

                {/* Fallback for users without role */}
                {!userRole && (
                  <Link href={getDashboardPath()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      <Avatar className="ring-2 ring-blue-500/20">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 glass rounded-2xl border-white/20 p-2"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal px-3 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email}
                        </p>
                        {userRole && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {userRole}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {/* Show dashboards based on role and enrollments */}
                    
                    {/* Admin Dashboard */}
                    {userRole === "admin" && (
                      <DropdownMenuItem
                        asChild
                        className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <Link href="/admin/dashboard" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          👑 Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Instructor Dashboard */}
                    {userRole === "instructor" && (
                      <>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <Link href="/instructor/dashboard" className="flex items-center">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            🎓 Instructor Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <Link href="/instructor/subscription" className="flex items-center">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Subscription
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <Link href="/instructor/earnings" className="flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Earnings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Student Dashboard - Show if role is student OR has enrollments */}
                    {(userRole === "student" || hasEnrollments) && (
                      <DropdownMenuItem
                        asChild
                        className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <Link href="/student/dashboard" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          📚 My Learning
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Browse Courses - Always show */}
                    <DropdownMenuItem
                      asChild
                      className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <Link href="/courses" className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        🔍 Browse Courses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg cursor-pointer hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
