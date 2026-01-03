'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function grantBonusCourses(
  instructorId: string,
  bonusAmount: number,
  reason: string
) {
  const supabase = await createClient()
  
  // Check admin role
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  // Find subscription using same query as display
  const { data: subscription, error: findError } = await supabase
    .from('instructor_subscriptions')
    .select('courses_allowed, bonus_courses, is_active, id, instructor_id')
    .eq('instructor_id', instructorId)
    .eq('is_active', true)
    .maybeSingle()

  if (findError) {
    throw new Error(`Failed to find subscription: ${findError.message}`)
  }

  if (!subscription) {
    throw new Error('No active subscription found for this instructor')
  }

  if (!subscription.id) {
    throw new Error('Subscription found but missing ID')
  }

  // Update using subscription ID
  const { data: updatedData, error: updateError } = await supabase
    .from('instructor_subscriptions')
    .update({
      bonus_courses: bonusAmount,
      bonus_granted_by: session.user.id,
      bonus_granted_at: new Date().toISOString(),
      bonus_reason: reason
    })
    .eq('id', subscription.id)
    .select()

  if (updateError) {
    throw new Error(`Failed to update subscription: ${updateError.message}`)
  }

  if (!updatedData || updatedData.length === 0) {
    throw new Error(`No rows were updated. Subscription ID: ${subscription.id}`)
  }

  // Revalidate the page
  revalidatePath(`/admin/instructors/${instructorId}`)

  return { success: true, data: updatedData[0] }
}





