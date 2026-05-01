import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { theme } from '../../styles/theme';

const GuardianDashboardPage = () => {
  const [guardianData, setGuardianData] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenData, setChildrenData] = useState({});
  const [feesData, setFeesData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [resultsData, setResultsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const guardian = JSON.parse(localStorage.getItem('guardian_data') || '{}');
    setGuardianData(guardian);
    fetchChildren();
  }, []);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
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

  const fetchChildData = async (childId) => {
    setLoading(true);
    try {
      const [feesRes, attendanceRes, resultsRes] = await Promise.all([
        api.get('/api/students/guardians/my_children_fees/'),
        api.get('/api/students/guardians/my_children_attendance/'),
        api.get('/api/students/guardians/my_children_results/')
      ]);

      const childFees = feesRes.data.filter(fee => fee.student === childId);
      const childAttendance = attendanceRes.data.filter(att => att.student === childId);
      const childResults = resultsRes.data.filter(result => result.student === childId);

      setFeesData(prev => ({ ...prev, [childId]: childFees }));
      setAttendanceData(prev => ({ ...prev, [childId]: childAttendance }));
      setResultsData(prev => ({ ...prev, [childId]: childResults }));
    } catch (err) {
      setError('Failed to fetch child data');
      console.error('Error fetching child data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryCards = () => {
    if (!selectedChild || !feesData[selectedChild] || !attendanceData[selectedChild] || !resultsData[selectedChild]) {
      return {
        totalFeesPaid: 0,
        attendanceRate: 0,
        latestAverage: 0,
        outstandingBalance: 0
      };
    }

    const fees = feesData[selectedChild];
    const attendance = attendanceData[selectedChild];
    const results = resultsData[selectedChild];

    const totalPaid = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount_usd) || 0), 0);
    const outstandingBalance = fees.reduce((sum, fee) => sum + (parseFloat(fee.balance_usd) || 0), 0);
    
    const presentCount = attendance.filter(att => att.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
    
    const latestResults = results.slice(-5);
    const latestAverage = latestResults.length > 0 
      ? latestResults.reduce((sum, result) => sum + (parseFloat(result.mark) || 0), 0) / latestResults.length 
      : 0;

    return {
      totalFeesPaid: totalPaid || 0,
      attendanceRate: attendanceRate || 0,
      latestAverage: latestAverage || 0,
      outstandingBalance: outstandingBalance || 0
    };
  };

  const getRecentAttendance = () => {
    if (!selectedChild || !attendanceData[selectedChild]) return [];
    return attendanceData[selectedChild]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getRecentResults = () => {
    if (!selectedChild || !resultsData[selectedChild]) return [];
    return resultsData[selectedChild]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade) => {
    const gradeUpper = grade?.toUpperCase();
    if (['A', 'B+', 'B'].includes(gradeUpper)) return 'bg-green-100 text-green-800';
    if (['C+', 'C'].includes(gradeUpper)) return 'bg-yellow-100 text-yellow-800';
    if (['D', 'E', 'F'].includes(gradeUpper)) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
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
  const recentAttendance = getRecentAttendance();
  const recentResults = getRecentResults();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.primary }}>
          Welcome, {guardianData?.first_name || 'Guardian'}
        </h1>
        <p className="text-gray-600">Here is an overview of your child's progress</p>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Fees Paid</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            ${summary.totalFeesPaid.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            {summary.attendanceRate}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Latest Term Average</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.latestAverage}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Outstanding Balance</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            ${summary.outstandingBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: theme.gray900 }}>
            Recent Attendance
          </h3>
        </div>
        <div className="overflow-x-auto">
          {recentAttendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                      {console.log('Attendance record:', record) || ''}
                      {record.subject?.name || record.subject || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: theme.gray900 }}>
            Recent Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          {recentResults.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                      {console.log('Result record:', result) || ''}
                      {result.subject?.name || result.subject || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                      {result.mark || 'N/A'}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboardPage;