import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'
import { Check, GraduationCap, ArrowLeft } from 'lucide-react'
import SubscriptionPaymentButton from '@/components/payments/SubscriptionPaymentButton'

export default async function InstructorSubscriptionPage() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Check if user is instructor
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'instructor') {
    redirect('/')
  }

  // Get current subscription
  const { data: subscription } = await supabase
    .from('instructor_subscriptions')
    .select('courses_allowed, bonus_courses, plan_type, is_active, id, created_at, bonus_granted_at')
    .eq('instructor_id', session.user.id)
    .eq('is_active', true)
    .maybeSingle()

  // Get courses count
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('instructor_id', session.user.id)

  const currentTier = subscription?.plan_type || 'free'
  const baseCourses = subscription?.courses_allowed || 0
  const bonusCourses = subscription?.bonus_courses || 0
  const totalAllowed = baseCourses + bonusCourses
  const usedCourses = courses?.length || 0
  const remainingCourses = totalAllowed - usedCourses

  // Define subscription plans
  const plans = [
    {
      tier: 'free',
      name: 'Free Plan',
      price: 0,
      priceUnit: 'forever',
      maxCourses: 1,
      features: [
        '1 course allowed',
        'Basic course management',
        'Student enrollment tracking',
        'Course analytics',
        'Email support'
      ],
      popular: false,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      tier: 'basic',
      name: 'Basic Plan',
      price: 999,
      priceUnit: 'per month',
      maxCourses: 5,
      features: [
        '5 courses allowed',
        'Advanced course management',
        'Priority support',
        'Detailed analytics',
        'Custom branding',
        'Email & chat support'
      ],
      popular: true,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      tier: 'pro',
      name: 'Pro Plan',
      price: 2499,
      priceUnit: 'per month',
      maxCourses: 20,
      features: [
        '20 courses allowed',
        'Unlimited students',
        'Advanced analytics',
        'Custom domain',
        'API access',
        'Priority support',
        'Revenue sharing (70/30)'
      ],
      popular: false,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      tier: 'enterprise',
      name: 'Enterprise Plan',
      price: 4999,
      priceUnit: 'per month',
      maxCourses: -1, // Unlimited
      features: [
        'Unlimited courses',
        'Unlimited students',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
        'Revenue sharing (80/20)',
        'SLA guarantee'
      ],
      popular: false,
      gradient: 'from-emerald-500 to-emerald-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/instructor/dashboard">
            <Button variant="ghost" className="mb-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Subscription Plans
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium ml-14">
            Choose the perfect plan for your teaching needs
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-10 border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 shadow-xl">
          <CardHeader className="border-b border-purple-100/50 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Your Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-3xl font-extrabold capitalize bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {currentTier} Plan
                </div>
                <p className="text-gray-700 font-medium mt-1">
                  {totalAllowed === -1 ? 'Unlimited' : totalAllowed} course{totalAllowed !== 1 ? 's' : ''} allowed
                  {bonusCourses > 0 && (
                    <span className="text-green-600 font-semibold ml-1">
                      ({baseCourses} base + {bonusCourses} bonus)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {usedCourses} course{usedCourses !== 1 ? 's' : ''} created
                  {remainingCourses > 0 && (
                    <span className="text-green-600 ml-2">
                      • {remainingCourses} remaining
                    </span>
                  )}
                  {remainingCourses <= 0 && totalAllowed !== -1 && (
                    <span className="text-red-600 ml-2">
                      • Limit reached
                    </span>
                  )}
                </p>
              </div>
              {subscription && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Active since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(subscription.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = plan.tier === currentTier
            const isPopular = plan.popular
            
            return (
              <Card
                key={plan.tier}
                className={`relative border-2 transition-all duration-300 hover:shadow-2xl ${
                  isCurrentPlan
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50'
                    : isPopular
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      CURRENT
                    </span>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold capitalize mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 text-sm">/{plan.priceUnit}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {plan.maxCourses === -1 ? 'Unlimited' : plan.maxCourses} Courses
                    </p>
                    <p className="text-sm text-gray-600">Maximum courses you can create</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button
                      className="w-full bg-gray-400 cursor-not-allowed"
                      disabled={true}
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <SubscriptionPaymentButton
                      planType={plan.tier}
                      planName={plan.name}
                      price={plan.price}
                      className={`w-full ${
                        isPopular
                          ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      } rounded-xl py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                    >
                      Upgrade to {plan.name}
                    </SubscriptionPaymentButton>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Note */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Need More Courses?</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Contact your administrator to request bonus courses or upgrade your plan. 
                  Bonus courses are added to your base plan limit.
                </p>
                <p className="text-xs text-gray-600">
                  For enterprise solutions or custom plans, please reach out to our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

