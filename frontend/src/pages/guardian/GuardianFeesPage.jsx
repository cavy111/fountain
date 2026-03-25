import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { theme } from '../../styles/theme';

const GuardianFeesPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [feesData, setFeesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      fetchFeesData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/students/guardians/my_children/');
      setChildren(response.data);
    } catch (err) {
      setError('Failed to fetch children data');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesData = async (childId) => {
    setLoading(true);
    try {
      const response = await api.get('/api/students/guardians/my_children_fees/');
      const childFees = response.data.filter(fee => fee.student === childId);
      setFeesData(prev => ({ ...prev, [childId]: childFees }));
    } catch (err) {
      setError('Failed to fetch fees data');
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryCards = () => {
    if (!selectedChild || !feesData[selectedChild]) {
      return {
        totalPaid: 0,
        totalOutstanding: 0,
        lastPaymentDate: null
      };
    }

    const fees = feesData[selectedChild];
    const totalPaid = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount_usd) || 0), 0);
    const totalOutstanding = fees.reduce((sum, fee) => sum + (parseFloat(fee.balance_usd) || 0), 0);
    
    const paidFees = fees.filter(fee => fee.date_paid);
    const lastPaymentDate = paidFees.length > 0 
      ? new Date(Math.max(...paidFees.map(fee => new Date(fee.date_paid))))
      : null;

    return {
      totalPaid: totalPaid || 0,
      totalOutstanding: totalOutstanding || 0,
      lastPaymentDate
    };
  };

  if (loading && !children.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  const summary = calculateSummaryCards();
  const currentFees = feesData[selectedChild] || [];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      {children.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
            Select Child
          </label>
          <select
            value={selectedChild || ''}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Paid</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            ${summary.totalPaid.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            ${summary.totalOutstanding.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Last Payment Date</div>
          <div className="text-lg font-semibold" style={{ color: theme.primary }}>
            {summary.lastPaymentDate 
              ? summary.lastPaymentDate.toLocaleDateString() 
              : 'No payments'}
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: theme.gray900 }}>
            Fee Payment History
          </h3>
        </div>
        <div className="overflow-x-auto">
          {currentFees.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Receipt Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Amount USD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Amount ZWL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Date Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFees.map((fee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.receipt_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(fee.amount_usd || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(fee.amount_zwl || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.payment_method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.term || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.academic_year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.date_paid ? new Date(fee.date_paid).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fee records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianFeesPage;