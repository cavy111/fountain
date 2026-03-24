import { useState, useEffect } from 'react';
import { getFeePayments, createFeePayment, deleteFeePayment, getStudents } from '../api/fees';

const termOptions = ['Term 1', 'Term 2', 'Term 3'];

const FeesPage = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    amount_usd: '',
    amount_zwl: '',
    payment_method: 'Cash',
    term: 'Term 1',
    academic_year: new Date().getFullYear(),
    receipt_number: '',
    notes: '',
    paid_on: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsData, studentsData] = await Promise.all([getFeePayments(), getStudents()]);
      setPayments(paymentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading fees data:', error);
    }
  };

  const totalCollected = payments.reduce((sum, item) => sum + Number(item.amount_usd || 0), 0);

  const totalOutstanding = 0; // No outstanding target in current schema; set to 0

  const defaultersCount = students.filter((s) => !payments.some((p) => p.student === s.id)).length;

  const filtered = payments
    .filter((p) => {
      const student = students.find((s) => s.id === p.student);
      const studentName = student ? `${student.first_name} ${student.last_name}` : '';
      return (
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.receipt_number || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter((p) => (termFilter ? p.term === termFilter : true))
    .filter((p) => (yearFilter ? String(p.academic_year) === String(yearFilter) : true));

  const uniqueAcademicYears = [...new Set(payments.map((p) => p.academic_year))].sort((a, b) => b - a);

  const studentOptions = students
    .filter((s) => `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.reg_number.toLowerCase().includes(studentSearch.toLowerCase()))
    .slice(0, 30);

  const openModal = () => {
    setFormData({
      student: '',
      amount_usd: '',
      amount_zwl: '',
      payment_method: 'Cash',
      term: 'Term 1',
      academic_year: new Date().getFullYear(),
      receipt_number: '',
      notes: '',
      paid_on: new Date().toISOString().split('T')[0],
    });
    setStudentSearch('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFeePayment({
        ...formData,
        amount_usd: Number(formData.amount_usd),
        amount_zwl: Number(formData.amount_zwl),
        academic_year: Number(formData.academic_year),
      });
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error creating fee payment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      await deleteFeePayment(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Collected (USD)</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-800">${totalCollected.toFixed(2)}</p>
        </div>
        <div className="p-5 rounded-xl bg-red-50 border border-red-200 shadow-sm">
          <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider">Total Outstanding (USD)</h3>
          <p className="mt-2 text-3xl font-bold text-red-800">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="p-5 rounded-xl bg-orange-50 border border-orange-200 shadow-sm">
          <h3 className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Number of Defaulters</h3>
          <p className="mt-2 text-3xl font-bold text-orange-800">{defaultersCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or receipt #"
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Terms</option>
            {termOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {uniqueAcademicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Record Payment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-max w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Receipt Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Student Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reg Number</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Amount (USD)</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Amount (ZWL)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Term</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Academic Year</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date Paid</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-500">
                  No payments found.
                </td>
              </tr>
            ) : (filtered.map((payment) => {
              const student = students.find((s) => s.id === payment.student);
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.receipt_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{student?.reg_number ?? '-'}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">${Number(payment.amount_usd).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">{Number(payment.amount_zwl).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.payment_method}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.term}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.academic_year}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(payment.paid_on).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="border-b px-4 lg:px-6 py-4">
              <h2 className="text-lg lg:text-xl font-semibold">Record Fee Payment</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">Search Student</label>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Type name or reg number"
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData((prev) => ({ ...prev, student: e.target.value }))}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pick student</option>
                  {studentOptions.map((s) => (
                    <option key={s.id} value={s.id}>{`${s.reg_number} - ${s.first_name} ${s.last_name}`}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount USD</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount_usd}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount_usd: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ZWL</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount_zwl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount_zwl: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData((prev) => ({ ...prev, payment_method: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="EcoCash">EcoCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Swipe">Swipe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData((prev) => ({ ...prev, term: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {termOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.academic_year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, academic_year: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, receipt_number: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Paid</label>
                  <input
                    type="date"
                    value={formData.paid_on}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paid_on: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;