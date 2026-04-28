import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getResults, createResult, updateResult, deleteResult } from '../api/results';
import { getStudents } from '../api/students';
import { getSubjects } from '../api/attendance';
import HorizontalScrollSync from '../components/HorizontalScrollSync';
import { AddButton, EditButton, DeleteButton } from '../components/TableButton';

const termOptions = ['Term 1', 'Term 2', 'Term 3'];

const gradeClasses = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  E: 'bg-red-100 text-red-800',
};

const calculateGrade = (mark) => {
  const numMark = Number(mark);
  if (numMark >= 75) return 'A';
  if (numMark >= 60) return 'B';
  if (numMark >= 50) return 'C';
  if (numMark >= 40) return 'D';
  return 'E';
};

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState('Term 1');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [form, setForm] = useState({
    student: '',
    subject: '',
    term: 'Term 1',
    academic_year: new Date().getFullYear(),
    mark: '',
    grade: '',
    class_position: '',
    teacher_comment: '',
  });

  const loadSupportingData = async () => {
    try {
      const [studentData, subjectData] = await Promise.all([getStudents(), getSubjects()]);
      setStudents(studentData);
      setSubjects(subjectData);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  };

  const loadResults = async () => {
    try {
      const params = { term: termFilter, academic_year: yearFilter };
      const data = await getResults(params);
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  useEffect(() => {
    loadSupportingData();
  }, []);

  useEffect(() => {
    loadResults();
  }, [termFilter, yearFilter]);

  const filteredResults = results.filter((result) => {
    const student = students.find((s) => s.id === result.student);
    const studentName = student ? `${student.first_name} ${student.last_name}` : '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openModal = () => {
    setIsEditing(false);
    setCurrentResult(null);
    setForm({
      student: '',
      subject: '',
      term: 'Term 1',
      academic_year: new Date().getFullYear(),
      mark: '',
      grade: '',
      class_position: '',
      teacher_comment: '',
    });
    setStudentSearch('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.student || !form.subject || !form.mark || !form.class_position) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        ...form,
        mark: Number(form.mark),
        academic_year: Number(form.academic_year),
        class_position: Number(form.class_position),
        grade: calculateGrade(form.mark),
      };

      if (isEditing) {
        await updateResult(currentResult.id, data);
      } else {
        await createResult(data);
      }

      closeModal();
      await loadResults();
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result. Please check the console for details.');
    }
  };

  const handleEdit = (result) => {
    setIsEditing(true);
    setCurrentResult(result);
    setForm({
      student: result.student,
      subject: result.subject,
      term: result.term,
      academic_year: result.academic_year,
      mark: result.mark,
      grade: result.grade,
      class_position: result.class_position,
      teacher_comment: result.teacher_comment,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await deleteResult(id);
      await loadResults();
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-600">Term</label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[40px]"
            >
              {termOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[40px]"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
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
            Add Result
          </AddButton>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <HorizontalScrollSync containerId="resultsTable">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subject</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Mark</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Grade</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Class Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Term</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Academic Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Teacher Comment</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const student = students.find((s) => s.id === result.student);
                  const studentName = student ? `${student.first_name} ${student.last_name}` : 'Unknown';
                  const subject = subjects.find((s) => s.id === result.subject);
                  const grade = result.grade || calculateGrade(result.mark);
                  return (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{subject ? subject.name : result.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{result.mark}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gradeClasses[grade] || ''}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{result.class_position}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.term}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.academic_year}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.teacher_comment}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <EditButton onClick={() => handleEdit(result)} />
                          <DeleteButton onClick={() => handleDelete(result.id)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </HorizontalScrollSync>
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Result' : 'Add New Result'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <input
                    type="text"
                    placeholder="Type name or reg number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mark (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.mark}
                      onChange={(e) => setForm({ ...form, mark: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Position</label>
                    <input
                      type="number"
                      min="1"
                      value={form.class_position}
                      onChange={(e) => setForm({ ...form, class_position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                    <select
                      value={form.term}
                      onChange={(e) => setForm({ ...form, term: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                      required
                    >
                      {termOptions.map((term) => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                    <input
                      type="number"
                      value={form.academic_year}
                      onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[40px]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Comment</label>
                  <textarea
                    value={form.teacher_comment}
                    onChange={(e) => setForm({ ...form, teacher_comment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-2 flex-shrink-0">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 min-h-[40px]"
                  style={{ backgroundColor: '#1B8C3E' }}
                >
                  {isEditing ? 'Update Result' : 'Add Result'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-h-[40px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResultsPage;