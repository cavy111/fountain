import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import api from '../api/axios';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('fees');
  
  const [student, setStudent] = useState(null);
  const [feePayments, setFeePayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [summary, setSummary] = useState({
    totalFeesPaid: 0,
    outstandingBalance: 0,
    attendanceRate: 0,
    latestAverage: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [studentRes, feesRes, attendanceRes, resultsRes] = await Promise.all([
        api.get(`/api/students/students/${id}/`),
        api.get(`/api/students/fee-payments/?student=${id}`),
        api.get(`/api/attendance/attendance/?student=${id}`),
        api.get(`/api/results/results/?student=${id}`)
      ]);

      setStudent(studentRes.data);
      setFeePayments(feesRes.data);
      setAttendance(attendanceRes.data);
      setResults(resultsRes.data);
      
      // Fetch notifications after we have the student data
      if (studentRes.data.guardian) {
        try {
          const notificationsRes = await api.get(`/api/notifications/?guardian=${studentRes.data.guardian}`);
          setNotifications(notificationsRes.data);
        } catch (notifErr) {
          console.warn('Could not fetch notifications:', notifErr);
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
      
      calculateSummary(feesRes.data, attendanceRes.data, resultsRes.data);
    } catch (err) {
      setError('Failed to fetch student data');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (fees, attendance, results) => {
    const totalPaid = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount_usd) || 0), 0);
    // Since there's no balance field, we'll calculate outstanding as 0 for paid fees
    const outstandingBalance = 0; // This would need to be calculated based on fees owed vs paid
    
    const presentCount = attendance.filter(att => att.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
    
    const latestResults = results.slice(-5);
    const latestAverage = latestResults.length > 0 
      ? latestResults.reduce((sum, result) => sum + (parseFloat(result.mark) || 0), 0) / latestResults.length 
      : 0;

    setSummary({
      totalFeesPaid: totalPaid || 0,
      outstandingBalance: outstandingBalance || 0,
      attendanceRate: attendanceRate || 0,
      latestAverage: latestAverage || 0
    });
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

  const groupResultsByTerm = (results) => {
    const grouped = {};
    results.forEach(result => {
      if (!grouped[result.term]) {
        grouped[result.term] = [];
      }
      grouped[result.term].push(result);
    });
    return grouped;
  };

  if (loading) {
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
        <button 
          onClick={() => navigate('/students')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">Student not found</div>
        <button 
          onClick={() => navigate('/students')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  const groupedResults = groupResultsByTerm(results);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/students')}
            className="mb-4 text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        </div>
      </div>

      {/* Student Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <h2 className="text-2xl font-bold text-white">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-green-100 mt-1">
            Reg: {student.reg_number} | Grade: {student.grade} {student.stream}
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Guardian Name</p>
              <p className="font-medium text-gray-900">{student.guardian_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Guardian Phone</p>
              <p className="font-medium text-gray-900">{student.guardian_phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium text-gray-900">
                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Enrolled On</p>
              <p className="font-medium text-gray-900">
                {student.enrolled_on ? new Date(student.enrolled_on).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Fees Paid</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            ${summary.totalFeesPaid.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Outstanding Balance</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            ${summary.outstandingBalance.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.attendanceRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Latest Average</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            {summary.latestAverage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['fees', 'attendance', 'results', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (USD)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (ZWL)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feePayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.term}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount_usd}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount_zwl}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paid_on ? new Date(payment.paid_on).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.receipt_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feePayments.length === 0 && (
                <div className="text-center py-8 text-gray-500">No fee payments found</div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.subject?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && (
                <div className="text-center py-8 text-gray-500">No attendance records found</div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {Object.entries(groupedResults).map(([term, termResults]) => (
                <div key={term} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{term}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mark</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {termResults.map((result) => (
                          <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.subject?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.mark}%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.class_position}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{result.teacher_comment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-center py-8 text-gray-500">No results found</div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-l-4 border-green-500 bg-gray-50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">No notifications found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
