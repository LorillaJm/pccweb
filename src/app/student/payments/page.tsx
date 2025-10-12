'use client';

import { useEffect, useState } from 'react';

interface Payment {
  id: number;
  academic_year: string;
  semester: number;
  payment_type: string;
  description: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: string;
  due_date: string;
  last_payment_date: string;
  payment_method: string;
  reference_number: string;
}

interface PaymentTransaction {
  id: number;
  transaction_date: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  receipt_number: string;
  verified_by_name: string;
  verified_at: string;
  notes: string;
}

interface PaymentSummary {
  academic_year: string;
  semester: number;
  total_due: number;
  total_paid: number;
  total_balance: number;
  total_payments: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchPaymentSummary();
  }, [selectedYear, selectedSemester]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedYear) params.append('academic_year', selectedYear);
      if (selectedSemester) params.append('semester', selectedSemester);

      const response = await fetch(`/api/student-services/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student-services/payments/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentSummary(data);
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (paymentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student-services/payments/${paymentId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleViewTransactions = async (payment: Payment) => {
    setSelectedPayment(payment);
    await fetchTransactions(payment.id);
    setShowTransactions(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentSemesterSummary = paymentSummary.find(
    s => s.academic_year === selectedYear && s.semester === parseInt(selectedSemester)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-gray-600">View your tuition balance and payment history</p>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">Summer</option>
          </select>
        </div>
      </div>

      {/* Payment Summary Cards */}
      {currentSemesterSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                ₱{currentSemesterSummary.total_balance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                ₱{currentSemesterSummary.total_due.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Amount Due</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                ₱{currentSemesterSummary.total_paid.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Paid</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {currentSemesterSummary.pending_count}
              </p>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Online Payment Options:</h4>
            <ul className="space-y-1">
              <li>• GCash: 09XX-XXX-XXXX</li>
              <li>• PayMaya: 09XX-XXX-XXXX</li>
              <li>• BPI Online Banking</li>
              <li>• BDO Online Banking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Over-the-Counter:</h4>
            <ul className="space-y-1">
              <li>• Cashier's Office (Main Building)</li>
              <li>• Office Hours: 8:00 AM - 5:00 PM</li>
              <li>• Bring your student ID</li>
              <li>• Keep your receipt</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Details for {selectedYear} - {selectedSemester === '1' ? '1st' : selectedSemester === '2' ? '2nd' : 'Summer'} Semester
          </h2>
        </div>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{payment.amount_due.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{payment.amount_paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={payment.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        ₱{payment.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewTransactions(payment)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View History
                      </button>
                      {payment.balance > 0 && (
                        <a
                          href={`mailto:cashier@pcc.edu.ph?subject=Payment for ${payment.description}&body=I would like to make a payment for ${payment.description}. Amount: ₱${payment.balance.toLocaleString()}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Pay Now
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No payment records available for this semester.
            </p>
          </div>
        )}
      </div>

      {/* Payment History Modal */}
      {showTransactions && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment History - {selectedPayment.description}
              </h3>
              <button
                onClick={() => setShowTransactions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Amount Due:</span> ₱{selectedPayment.amount_due.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Amount Paid:</span> ₱{selectedPayment.amount_paid.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Balance:</span> 
                  <span className={selectedPayment.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    ₱{selectedPayment.balance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
            </div>

            {transactions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ₱{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {transaction.payment_method}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {transaction.reference_number || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.verified_at ? (
                            <span className="text-green-600">Verified</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No payment transactions found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
