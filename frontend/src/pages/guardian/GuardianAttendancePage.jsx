import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { theme } from '../../styles/theme';

const GuardianAttendancePage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchChildren();
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceData(selectedChild);
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

  const fetchAttendanceData = async (childId) => {
    setLoading(true);
    try {
      const response = await api.get('/api/students/guardians/my_children_attendance/');
      const childAttendance = response.data.filter(att => att.student === childId);
      setAttendanceData(prev => ({ ...prev, [childId]: childAttendance }));
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryCards = () => {
    if (!selectedChild || !attendanceData[selectedChild]) {
      return {
        totalPresent: 0,
        totalAbsent: 0,
        attendanceRate: 0
      };
    }

    let attendance = attendanceData[selectedChild];
    
    // Apply date filters if set
    if (fromDate || toDate) {
      attendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        const from = fromDate ? new Date(fromDate) : new Date('1900-01-01');
        const to = toDate ? new Date(toDate) : new Date('2100-12-31');
        return recordDate >= from && recordDate <= to;
      });
    }

    const totalPresent = attendance.filter(att => att.status === 'present').length;
    const totalAbsent = attendance.filter(att => att.status === 'absent').length;
    const attendanceRate = attendance.length > 0 ? (totalPresent / attendance.length) * 100 : 0;

    return {
      totalPresent,
      totalAbsent,
      attendanceRate: attendanceRate.toFixed(1)
    };
  };

  const getFilteredAttendance = () => {
    if (!selectedChild || !attendanceData[selectedChild]) return [];
    
    let attendance = attendanceData[selectedChild];
    
    // Apply date filters if set
    if (fromDate || toDate) {
      attendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        const from = fromDate ? new Date(fromDate) : new Date('1900-01-01');
        const to = toDate ? new Date(toDate) : new Date('2100-12-31');
        return recordDate >= from && recordDate <= to;
      });
    }

    return attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
  const filteredAttendance = getFilteredAttendance();

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

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.gray900 }}>
          Filter by Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
                setToDate(today.toISOString().split('T')[0]);
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: theme.primary, color: theme.white }}
            >
              Reset to Last 30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Present</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.totalPresent}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Absent</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            {summary.totalAbsent}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.attendanceRate}%
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: theme.gray900 }}>
            Attendance Records
          </h3>
        </div>
        <div className="overflow-x-auto">
          {filteredAttendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.subject?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected date range
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianAttendancePage;