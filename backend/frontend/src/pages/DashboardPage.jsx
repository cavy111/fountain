import { useState, useEffect, useRef } from 'react';
import { getStudents } from '../api/students';
import { getFeePayments } from '../api/fees';
import { getAttendance, getSubjects } from '../api/attendance';
import { getNotifications } from '../api/notifications';
import { theme } from '../styles/theme';

const DashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (feePayments.length > 0) {
      renderBarChart();
    }
  }, [feePayments]);

  useEffect(() => {
    if (attendances.length > 0) {
      renderPieChart();
    }
  }, [attendances]);

  const fetchData = async () => {
    try {
      const [studentsData, feePaymentsData, attendancesData, notificationsData, subjectsData] = await Promise.all([
        getStudents(),
        getFeePayments(),
        getAttendance(),
        getNotifications(),
        getSubjects()
      ]);
      setStudents(studentsData);
      setFeePayments(feePaymentsData);
      setAttendances(attendancesData);
      setNotifications(notificationsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderBarChart = () => {
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }
    const ctx = barChartRef.current.getContext('2d');
    const currentYear = new Date().getFullYear();
    const monthlyFees = Array(12).fill(0);
    feePayments.forEach(payment => {
      const date = new Date(payment.paid_on);
      if (date.getFullYear() === currentYear) {
        monthlyFees[date.getMonth()] += parseFloat(payment.amount_usd);
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Fee Collections (USD)',
          data: monthlyFees,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  const renderPieChart = () => {
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }
    const ctx = pieChartRef.current.getContext('2d');
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = attendances.filter(a => a.date === today);
    const statusCounts = { present: 0, absent: 0, late: 0 };
    todayAttendances.forEach(attendance => {
      statusCounts[attendance.status]++;
    });
    pieChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [{
          data: [statusCounts.present, statusCounts.absent, statusCounts.late],
          backgroundColor: [theme.primary, '#DC2626', theme.accent],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  };

  const totalStudents = students.length;
  const currentYear = new Date().getFullYear();
  const feesThisYear = feePayments
    .filter(p => p.academic_year === currentYear)
    .reduce((sum, p) => sum + parseFloat(p.amount_usd), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(a => a.date === today);
  const presentCount = todayAttendances.filter(a => a.status === 'present').length;
  const attendanceRate = todayAttendances.length > 0 ? ((presentCount / todayAttendances.length) * 100).toFixed(1) : 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const notificationsThisMonth = notifications.filter(n => {
    if (!n.sent_at) return false;
    const sentDate = new Date(n.sent_at);
    return sentDate.getMonth() === thisMonth && sentDate.getFullYear() === thisYear;
  }).length;

  const recentPayments = feePayments
    .sort((a, b) => new Date(b.paid_on) - new Date(a.paid_on))
    .slice(0, 5)
    .map(payment => {
      const student = students.find(s => s.id === payment.student);
      return {
        ...payment,
        studentName: student ? `${student.first_name} ${student.last_name}` : 'Unknown'
      };
    });

  const recentAbsences = todayAttendances
    .filter(a => a.status === 'absent')
    .slice(0, 5)
    .map(attendance => {
      const student = students.find(s => s.id === attendance.student);
      const subject = subjects.find(s => s.id === attendance.subject);
      return {
        ...attendance,
        studentName: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
        subjectName: subject ? subject.name : 'Unknown'
      };
    });

  return (
    <div className="p-6 w-full max-w-full overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {username}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="text-white p-8 rounded-lg shadow-md min-w-0" style={{ backgroundColor: theme.primary }}>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">👥</div>
            <div>
              <h3 className="text-lg font-semibold">Total Students</h3>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="text-white p-8 rounded-lg shadow-md min-w-0" style={{ backgroundColor: theme.accent }}>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">💰</div>
            <div>
              <h3 className="text-lg font-semibold">Fees Collected This Year</h3>
              <p className="text-2xl font-bold">${feesThisYear.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="text-white p-8 rounded-lg shadow-md min-w-0" style={{ backgroundColor: theme.primary }}>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>
              <h3 className="text-lg font-semibold">Attendance Rate Today</h3>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
            </div>
          </div>
        </div>
        <div className="text-white p-8 rounded-lg shadow-md min-w-0" style={{ backgroundColor: theme.accent }}>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">📢</div>
            <div>
              <h3 className="text-lg font-semibold">Notifications Sent This Month</h3>
              <p className="text-2xl font-bold">{notificationsThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Fee Collections This Year</h3>
          <div className="w-full">
            <canvas ref={barChartRef} className="w-full h-64 lg:h-80"></canvas>
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Attendance Breakdown Today</h3>
          <div className="w-full">
            <canvas ref={pieChartRef} className="w-full h-64 lg:h-80"></canvas>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Recent Fee Payments</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[320px] sm:min-w-[400px]">
              <thead>
                <tr style={{ backgroundColor: theme.primaryLight }}>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Student Name</th>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Amount (USD)</th>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Date Paid</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-sm lg:text-base">{payment.studentName}</td>
                    <td className="py-2 text-sm lg:text-base">${parseFloat(payment.amount_usd).toFixed(2)}</td>
                    <td className="py-2 text-sm lg:text-base">{payment.paid_on}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Recent Absences Today</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[320px] sm:min-w-[400px]">
              <thead>
                <tr style={{ backgroundColor: theme.primaryLight }}>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Student Name</th>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Subject</th>
                  <th className="text-left py-2 text-sm lg:text-base font-semibold" style={{ color: theme.gray900 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAbsences.map(attendance => (
                  <tr key={attendance.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-sm lg:text-base">{attendance.studentName}</td>
                    <td className="py-2 text-sm lg:text-base">{attendance.subjectName}</td>
                    <td className="py-2 text-sm lg:text-base">{attendance.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;