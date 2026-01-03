'use client'

import { useState } from 'react'
import { createSubscriptionOrder, verifySubscriptionPayment, handleSubscriptionPaymentFailure } from '@/app/actions/payments'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface SubscriptionPaymentButtonProps {
  planType: string
  planName: string
  price: number
  className?: string
  children?: React.ReactNode
}

export default function SubscriptionPaymentButton({ 
  planType, 
  planName, 
  price, 
  className = '',
  children 
}: SubscriptionPaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Create order on server
      const { orderId, amount, currency, planName: orderPlanName } = await createSubscriptionOrder(planType)

      // Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'ScholaPulse',
        description: `${orderPlanName} Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            // Success - refresh page to show new subscription
            router.refresh()
            alert('Subscription upgraded successfully!')
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
            await handleSubscriptionPaymentFailure(orderId)
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
        await handleSubscriptionPaymentFailure(orderId)
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
      className={className}
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
        children || `Upgrade to ${planName}`
      )}
    </button>
  )
}

