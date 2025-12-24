"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface CheckResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
}

export default function CheckSupabasePage() {
  const [checks, setChecks] = useState<CheckResult[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    runChecks()
  }, [])

  async function runChecks() {
    setLoading(true)
    const results: CheckResult[] = []

    // 1. Check Connection
    results.push({
      name: "Supabase Connection",
      status: "loading",
      message: "Testing connection...",
    })
    setChecks([...results])

    try {
      const { error } = await supabase.from("user_profiles").select("count").limit(1)
      if (error && error.code !== "PGRST116") {
        results[0] = {
          name: "Supabase Connection",
          status: "error",
          message: `Connection failed: ${error.message}`,
        }
      } else {
        results[0] = {
          name: "Supabase Connection",
          status: "success",
          message: "Successfully connected to Supabase",
        }
      }
    } catch (err: any) {
      results[0] = {
        name: "Supabase Connection",
        status: "error",
        message: `Connection error: ${err.message}`,
      }
    }
    setChecks([...results])

    // 2. Check Tables
    const tables = [
      { name: "user_profiles", required: true },
      { name: "instructor_subscriptions", required: true },
      { name: "courses", required: true },
      { name: "course_videos", required: true },
      { name: "enrollments", required: true },
      { name: "transactions", required: true },
      { name: "transaction_splits", required: true },
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table.name).select("*").limit(1)
        if (error) {
          if (error.code === "PGRST116" || error.message.includes("does not exist")) {
            results.push({
              name: `Table: ${table.name}`,
              status: table.required ? "error" : "warning",
              message: table.required
                ? "Table does NOT exist (required)"
                : "Table does NOT exist (optional)",
            })
          } else if (error.code === "42501") {
            results.push({
              name: `Table: ${table.name}`,
              status: "warning",
              message: "Table exists but no access (check RLS policies)",
            })
          } else {
            results.push({
              name: `Table: ${table.name}`,
              status: "error",
              message: `Error: ${error.message}`,
            })
          }
        } else {
          results.push({
            name: `Table: ${table.name}`,
            status: "success",
            message: "Table exists and accessible",
          })
        }
      } catch (err: any) {
        results.push({
          name: `Table: ${table.name}`,
          status: "error",
          message: `Error: ${err.message}`,
        })
      }
      setChecks([...results])
    }

    // 3. Storage check removed - using Google Drive for videos now
    setChecks([...results])

    // 4. Check User Profiles
    try {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("id, role, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        results.push({
          name: "User Profiles",
          status: "warning",
          message: `Could not check: ${error.message}`,
        })
      } else if (profiles && profiles.length > 0) {
        results.push({
          name: "User Profiles",
          status: "success",
          message: `Found ${profiles.length} user profile(s)`,
          details: profiles
            .map((p) => `${p.full_name || "No name"} (${p.role})`)
            .join(", "),
        })
      } else {
        results.push({
          name: "User Profiles",
          status: "warning",
          message: "No user profiles found yet",
        })
      }
    } catch (err: any) {
      results.push({
        name: "User Profiles",
        status: "warning",
        message: `Could not check: ${err.message}`,
      })
    }
    setChecks([...results])

    setLoading(false)
  }

  const getStatusIcon = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-500/20 bg-green-500/10"
      case "error":
        return "border-red-500/20 bg-red-500/10"
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/10"
      case "loading":
        return "border-blue-500/20 bg-blue-500/10"
      default:
        return ""
    }
  }

  const successCount = checks.filter((c) => c.status === "success").length
  const errorCount = checks.filter((c) => c.status === "error").length
  const warningCount = checks.filter((c) => c.status === "warning").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Supabase Configuration Check
          </h1>
          <p className="text-muted-foreground">
            Diagnosing your Supabase setup and configuration
          </p>
        </div>

        {loading && checks.length === 0 && (
          <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p>Running checks...</p>
            </CardContent>
          </Card>
        )}

        {checks.length > 0 && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {successCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Success</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {errorCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    {warningCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </CardContent>
              </Card>
            </div>

            {/* Check Results */}
            <div className="space-y-4 mb-8">
              {checks.map((check, index) => (
                <Card
                  key={index}
                  className={`border-2 ${getStatusColor(check.status)} rounded-2xl`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{check.name}</h3>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {check.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Manual Checks */}
            <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
              <CardHeader>
                <CardTitle>Manual Checks Required</CardTitle>
                <CardDescription>
                  These settings must be checked in Supabase Dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">📧 Email Configuration</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Go to: <strong>Authentication → Settings → Email Auth</strong></li>
                    <li>Check <strong>"Enable email confirmations"</strong> (ON/OFF)</li>
                    <li>Check <strong>SMTP Settings</strong> (configured or not)</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📋 Auth Logs</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Go to: <strong>Logs → Auth Logs</strong></li>
                    <li>Look for email sending errors</li>
                    <li>Check for "Failed to send email" messages</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✉️ Email Templates</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Go to: <strong>Authentication → Email Templates</strong></li>
                    <li>Verify <strong>"Confirm signup"</strong> template exists</li>
                    <li>Check if templates are enabled</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button
                onClick={runChecks}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? "Running Checks..." : "Run Checks Again"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

