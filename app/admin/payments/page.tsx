import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSwitcher } from '@/components/DashboardSwitcher'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Check admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Get all payment transactions
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select(`
      *,
      student:user_profiles!student_id(full_name),
      course:courses(title),
      instructor:user_profiles!instructor_id(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate stats from transactions
  const totalTransactions = transactions?.length || 0
  const successfulPayments = transactions?.filter(tx => tx.status === 'captured').length || 0
  const totalRevenue = transactions?.filter(tx => tx.status === 'captured')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
  const platformEarnings = transactions?.filter(tx => tx.status === 'captured')
    .reduce((sum, tx) => sum + (tx.platform_fee || 0), 0) || 0
  const instructorEarnings = transactions?.filter(tx => tx.status === 'captured')
    .reduce((sum, tx) => sum + (tx.instructor_amount || 0), 0) || 0

  // Convert from paise to rupees for display
  const totalRevenueInr = totalRevenue / 100
  const platformEarningsInr = platformEarnings / 100
  const instructorEarningsInr = instructorEarnings / 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardSwitcher />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Payment Dashboard 💰
          </h1>
          <p className="text-gray-600 mt-2">Monitor all payment transactions and revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-green-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₹{totalRevenueInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">All successful payments</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Platform Earnings (30%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ₹{platformEarningsInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Platform commission</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Instructor Earnings (70%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ₹{instructorEarningsInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Paid to instructors</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalTransactions > 0 
                  ? Math.round((successfulPayments / totalTransactions) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {successfulPayments} / {totalTransactions} successful
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(tx.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.student?.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.course?.title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.instructor?.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{((tx.amount || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            tx.status === 'captured' 
                              ? 'bg-green-100 text-green-800' 
                              : tx.status === 'failed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

