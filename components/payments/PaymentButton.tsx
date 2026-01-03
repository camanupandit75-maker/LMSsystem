'use client'

import { useState } from 'react'
import { createPaymentOrder, verifyPayment, handlePaymentFailure } from '@/app/actions/payments'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentButtonProps {
  courseId: string
  price: number
  courseName?: string
  courseSlug?: string
}

export default function PaymentButton({ courseId, price, courseName, courseSlug }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Create order on server
      const { orderId, amount, currency, courseTitle } = await createPaymentOrder(courseId)

      // Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'ScholaPulse',
        description: courseTitle || courseName || 'Course Purchase',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            // Success - redirect to course watch page
            if (courseSlug) {
              router.push(`/courses/${courseSlug}/watch?enrolled=true`)
            } else {
              // Fallback: redirect to course detail page
              router.push(`/courses/${courseId}?enrolled=true`)
            }
            router.refresh()
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: async function() {
            // User closed the payment modal
            await handlePaymentFailure(orderId)
            setLoading(false)
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#9333EA', // Purple
        },
      }

      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', async function (response: any) {
        await handlePaymentFailure(orderId)
        alert('Payment failed: ' + response.error.description)
        setLoading(false)
      })

      razorpay.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        `Enroll Now - ₹${price.toLocaleString('en-IN')}`
      )}
    </button>
  )
}

