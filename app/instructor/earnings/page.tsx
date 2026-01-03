import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'

export default async function InstructorEarningsPage() {
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

  // Get instructor's payment transactions
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select(`
      *,
      student:user_profiles!student_id(full_name),
      course:courses(title)
    `)
    .eq('instructor_id', session.user.id)
    .eq('status', 'captured')
    .order('paid_at', { ascending: false })

  // Calculate earnings
  const totalEarnings = transactions?.reduce((sum, tx) => sum + (tx.instructor_amount || 0), 0) || 0
  const totalSales = transactions?.length || 0
  const refundedAmount = 0 // TODO: Calculate from refunded transactions

  // Convert from paise to rupees for display
  const totalEarningsInr = totalEarnings / 100
  const refundedAmountInr = refundedAmount / 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            My Earnings 💰
          </h1>
          <p className="text-gray-600 mt-2">Track your course sales and earnings</p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white opacity-90">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mt-2">
                ₹{totalEarningsInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-white opacity-75 mt-1">70% of course sales</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white opacity-90">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mt-2">
                {totalSales}
              </div>
              <p className="text-xs text-white opacity-75 mt-1">Successful enrollments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white opacity-90">Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mt-2">
                ₹{refundedAmountInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-white opacity-75 mt-1">Refunded amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="divide-y">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{tx.course?.title || 'Unknown Course'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {tx.student?.full_name || 'Unknown Student'} • {new Date(tx.paid_at || tx.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">
                        +₹{((tx.instructor_amount || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        70% of ₹{((tx.amount || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Start selling courses to see your earnings here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

