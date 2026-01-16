'use server'

import Razorpay from 'razorpay'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createPaymentOrder(courseId: string) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price, instructor_id')
    .eq('id', courseId)
    .maybeSingle()

  if (courseError) {
    console.error('Error fetching course:', courseError)
    throw new Error('Failed to fetch course details')
  }
  
  if (!course) throw new Error('Course not found')
  
  // Check if course is free (price is 0 or null)
  const coursePrice = course.price || 0
  if (coursePrice === 0) throw new Error('This course is free')

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', session.user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingEnrollment) throw new Error('Already enrolled in this course')

  // Calculate amounts (Razorpay uses paise - 1 rupee = 100 paise)
  // Convert USD to INR if needed, or assume price is already in INR
  // For now, assuming price is in INR
  const amountInPaise = Math.round(coursePrice * 100)
  const platformFee = Math.round(amountInPaise * 0.30) // 30% platform fee
  const instructorAmount = amountInPaise - platformFee // 70% to instructor

  // Create Razorpay order
  let order
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `enroll_${Date.now()}`, // Fixed: max 40 chars (Razorpay limit)
      notes: {
        course_id: courseId,
        student_id: session.user.id,
        instructor_id: course.instructor_id,
      },
    })
  } catch (razorpayError: any) {
    console.error('Razorpay order creation failed:', razorpayError)
    throw new Error(`Payment gateway error: ${razorpayError.message || 'Failed to create payment order'}`)
  }

  // Save transaction to database
  const { data: transaction, error: txError } = await supabase
    .from('payment_transactions')
    .insert({
      student_id: session.user.id,
      course_id: courseId,
      instructor_id: course.instructor_id,
      razorpay_order_id: order.id,
      amount: amountInPaise,
      currency: 'INR',
      platform_fee: platformFee,
      instructor_amount: instructorAmount,
      status: 'created',
      receipt_number: order.receipt,
      notes: order.notes,
    })
    .select()
    .maybeSingle()

  if (txError) {
    console.error('Payment transaction error:', txError)
    throw new Error(`Payment failed: ${txError.message}`)
  }
  
  if (!transaction) {
    throw new Error('Payment transaction was not created')
  }

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    transactionId: transaction.id,
    courseTitle: course.title,
  }
}

export async function verifyPayment(data: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  const supabase = await createClient()

  // Verify signature for security
  const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex')

  if (generatedSignature !== data.razorpay_signature) {
    // Update as failed
    await supabase
      .from('payment_transactions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('razorpay_order_id', data.razorpay_order_id)
    
    throw new Error('Invalid payment signature')
  }

  // Update transaction as captured
  const { data: transaction, error } = await supabase
    .from('payment_transactions')
    .update({
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      status: 'captured',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', data.razorpay_order_id)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error updating payment transaction:', error)
    throw error
  }
  
  if (!transaction) {
    throw new Error('Payment transaction not found')
  }

  // Enroll student in course
  const { error: enrollError } = await supabase
    .from('enrollments')
    .insert({
      student_id: transaction.student_id,
      course_id: transaction.course_id,
      enrolled_at: new Date().toISOString(),
      amount_paid: transaction.amount / 100, // Convert paise to rupees
      progress_percentage: 0,
      is_active: true,
    })

  if (enrollError) {
    console.error('Enrollment failed:', enrollError)
    // Don't throw - payment succeeded, we'll fix enrollment manually if needed
  }

  return { success: true, transaction }
}

export async function handlePaymentFailure(orderId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('payment_transactions')
    .update({ 
      status: 'failed', 
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_order_id', orderId)
}

// Subscription payment functions
export async function createSubscriptionOrder(planType: string) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // Plan pricing (in rupees)
  const planPricing: Record<string, number> = {
    free: 0,
    basic: 999,
    pro: 2499,
    enterprise: 4999,
  }

  const priceInRupees = planPricing[planType]
  if (priceInRupees === undefined) throw new Error('Invalid plan type')
  if (priceInRupees === 0) throw new Error('Cannot upgrade to free plan')

  // Check current subscription
  const { data: currentSubscription } = await supabase
    .from('instructor_subscriptions')
    .select('plan_type, id')
    .eq('instructor_id', session.user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (currentSubscription?.plan_type === planType) {
    throw new Error('You are already on this plan')
  }

  // Calculate billing period (monthly)
  const now = new Date()
  const billingPeriodStart = now.toISOString()
  const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
  const nextBillingDate = billingPeriodEnd

  // Convert to paise
  const amountInPaise = Math.round(priceInRupees * 100)

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `sub_${planType}_${Date.now()}`.substring(0, 40), // Ensure max 40 chars
    notes: {
      instructor_id: session.user.id,
      plan_type: planType,
      type: 'subscription',
    },
  })

  // Save subscription payment to database
  const { data: subscriptionPayment, error: paymentError } = await supabase
    .from('subscription_payments')
    .insert({
      instructor_id: session.user.id,
      plan_type: planType,
      amount_paise: amountInPaise,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'created',
      billing_period_start: billingPeriodStart,
      billing_period_end: billingPeriodEnd,
      next_billing_date: nextBillingDate,
      is_recurring: true,
      receipt_number: order.receipt,
      notes: order.notes,
    })
    .select()
    .single()

  if (paymentError) throw paymentError

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    paymentId: subscriptionPayment.id,
    planType: planType,
    planName: planType.charAt(0).toUpperCase() + planType.slice(1) + ' Plan',
  }
}

export async function verifySubscriptionPayment(data: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  console.log('🔍 Verifying subscription payment:', data.razorpay_order_id)
  const supabase = await createClient()

  // Verify signature
  const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex')

  console.log('🔍 Signature verification:', {
    generated: generatedSignature.substring(0, 20) + '...',
    received: data.razorpay_signature.substring(0, 20) + '...',
    match: generatedSignature === data.razorpay_signature
  })

  if (generatedSignature !== data.razorpay_signature) {
    console.error('❌ Signature mismatch!')
    await supabase
      .from('subscription_payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('razorpay_order_id', data.razorpay_order_id)
    
    throw new Error('Invalid payment signature')
  }

  console.log('✅ Signature verified, updating payment...')

  // Update subscription payment as captured
  const { data: subscriptionPayment, error } = await supabase
    .from('subscription_payments')
    .update({
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      status: 'captured',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', data.razorpay_order_id)
    .select()
    .maybeSingle()

  if (error) {
    console.error('❌ Failed to update payment status:', error)
    throw error
  }
  
  if (!subscriptionPayment) {
    throw new Error('Subscription payment not found')
  }

  console.log('✅ Payment status updated to captured')

  // Update instructor subscription
  const planCourses: Record<string, number> = {
    free: 1,
    basic: 5,
    pro: 20,
    enterprise: -1, // Unlimited
  }

  const coursesAllowed = planCourses[subscriptionPayment.plan_type] || 1

  // Update existing subscription (preserves bonus_courses automatically)
  const { error: subscriptionError } = await supabase
    .from('instructor_subscriptions')
    .update({
      plan_type: subscriptionPayment.plan_type,
      courses_allowed: coursesAllowed,
      // Don't update bonus_courses - it will be preserved automatically
      is_active: true,
    })
    .eq('instructor_id', subscriptionPayment.instructor_id)

  if (subscriptionError) {
    console.error('❌ Subscription update failed:', subscriptionError)
    throw new Error(`Payment succeeded but subscription update failed: ${subscriptionError.message}`)
  }

  console.log('✅ Subscription updated successfully:', {
    instructor_id: subscriptionPayment.instructor_id,
    plan_type: subscriptionPayment.plan_type,
    courses_allowed: coursesAllowed
  })

  return { success: true, subscriptionPayment }
}

export async function handleSubscriptionPaymentFailure(orderId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('subscription_payments')
    .update({ 
      status: 'failed', 
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_order_id', orderId)
}

