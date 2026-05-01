import { useState, useEffect } from 'react';
import { getAttendance, createAttendance, deleteAttendance, getSubjects } from '../api/attendance';
import { getStudents } from '../api/students';
import HorizontalScrollSync from '../components/HorizontalScrollSync';
import { ViewButton, EditButton, DeleteButton, AddButton } from '../components/TableButton';

const statusClasses = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-amber-100 text-amber-800',
};

const AttendancePage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [form, setForm] = useState({
    student: '',
    subject: '',
    date: today,
    status: 'present',
    notes: '',
  });

  const loadAttendance = async () => {
    try {
      const params = { date: selectedDate };
      if (selectedSubject) params.subject = selectedSubject;
      const data = await getAttendance(params);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const loadSupporting = async () => {
    try {
      const [studentData, subjectData] = await Promise.all([getStudents(), getSubjects()]);
      setStudents(studentData);
      setSubjects(subjectData);
    } catch (error) {
      console.error('Error fetching students/subjects:', error);
    }
  };

  useEffect(() => {
    loadSupporting();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate, selectedSubject]);

  const filteredRecords = records.filter((r) => {
    const student = students.find((s) => s.id === r.student);
    const studentName = student ? `${student.first_name} ${student.last_name}` : '';
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalCount = records.length;
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setForm({ student: '', subject: '', date: today, status: 'present', notes: '' });
    setStudentSearch('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting attendance form:', form);

    // Validate required fields
    if (!form.student || !form.subject || !form.date || !form.status) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await createAttendance(form);
      console.log('Attendance created successfully:', response);
      closeModal();
      await loadAttendance();
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Failed to save attendance. Please check the console for details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      await loadAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  const studentOptions = students
    .filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`;
      return (
        fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.reg_number.toLowerCase().includes(studentSearch.toLowerCase())
      );
    })
    .slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <h3 className="text-xs font-semibold uppercase text-green-700">Present Today</h3>
          <p className="mt-1 text-2xl md:text-3xl font-bold text-green-800">{presentCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h3 className="text-xs font-semibold uppercase text-red-700">Absent Today</h3>
          <p className="mt-1 text-2xl md:text-3xl font-bold text-red-800">{absentCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <h3 className="text-xs font-semibold uppercase text-amber-700">Attendance Rate</h3>
          <p className="mt-1 text-2xl md:text-3xl font-bold text-amber-800">{attendanceRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-600">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[40px]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[40px]"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[40px]"
          />
          <AddButton onClick={openModal} className="min-h-[40px]">
            Add Attendance
          </AddButton>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <HorizontalScrollSync containerId="attendanceTable">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reg Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Notes</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    No attendance found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const student = students.find((s) => s.id === rec.student);
                  const subject = subjects.find((s) => s.id === rec.subject);
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student?.reg_number ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{subject?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[rec.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{rec.notes || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <DeleteButton onClick={() => handleDelete(rec.id)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </HorizontalScrollSync>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold">Mark Attendance</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 lg:p-6 max-h-[80vh] overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Search Student</label>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Type name or reg number"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  name="student"
                  value={form.student}
                  required
                  onChange={handleFormChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select student</option>
                  {studentOptions.map((s) => (
                    <option key={s.id} value={s.id}>{`${s.reg_number} - ${s.first_name} ${s.last_name}`}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional comments"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;