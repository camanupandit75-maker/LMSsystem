'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function acceptInstructorAgreement() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  // Check if user is instructor
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'instructor') {
    throw new Error('Only instructors can accept this agreement')
  }

  // Get IP address from headers
  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown'

  // Update user profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      instructor_agreement_accepted: true,
      instructor_agreement_accepted_at: new Date().toISOString(),
      instructor_agreement_ip_address: ipAddress,
      instructor_agreement_version: '1.0'
    })
    .eq('id', session.user.id)

  if (updateError) throw updateError

  // Log acceptance (if table exists)
  try {
    const { error: logError } = await supabase
      .from('instrument_agreement_log')
      .insert({
        instructor_id: session.user.id,
        agreement_version: '1.0',
        ip_address: ipAddress,
        user_agent: headersList.get('user-agent') || 'unknown'
      })

    if (logError) {
      console.error('Failed to log agreement (table might not exist):', logError)
    }
  } catch (logError) {
    // Table might not exist, continue anyway
    console.error('Could not log agreement:', logError)
  }

  return { success: true }
}

