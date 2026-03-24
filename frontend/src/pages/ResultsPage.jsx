import { useState, useEffect } from 'react';
import { getResults, createResult, updateResult, deleteResult } from '../api/results';
import { getStudents } from '../api/students';
import { getSubjects } from '../api/attendance';

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

  useEffect(() => {
    loadSupportingData();
  }, []);

  useEffect(() => {
    loadResults();
  }, [termFilter, yearFilter]);

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

  const filteredResults = results.filter((result) => {
    const student = students.find((s) => s.id === result.student);
    const studentName = student ? `${student.first_name} ${student.last_name}` : '';
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student?.reg_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const performanceSummary = {
    highest: Math.max(...filteredResults.map(r => Number(r.mark) || 0)),
    lowest: Math.min(...filteredResults.map(r => Number(r.mark) || 0)),
    average: filteredResults.length > 0
      ? (filteredResults.reduce((sum, r) => sum + Number(r.mark || 0), 0) / filteredResults.length).toFixed(2)
      : 0,
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate grade when mark changes
      if (name === 'mark') {
        updated.grade = calculateGrade(value);
      }

      return updated;
    });
  };

  const openModal = (result = null) => {
    if (result) {
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
    } else {
      setIsEditing(false);
      setCurrentResult(null);
      setForm({
        student: '',
        subject: '',
        term: termFilter,
        academic_year: yearFilter,
        mark: '',
        grade: '',
        class_position: '',
        teacher_comment: '',
      });
    }
    setStudentSearch('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting result form:', form);

    // Validate required fields
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
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-gray-600">Term</label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {termOptions.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Academic Year</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-gray-600">Search by student</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name or reg number"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="self-start px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Result
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Student Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reg Number</th>
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
                <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filteredResults.map((result) => {
                const student = students.find((s) => s.id === result.student);
                const subject = subjects.find((s) => s.id === result.subject);
                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student?.reg_number ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{subject?.name ?? 'Unknown'}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{Number(result.mark).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gradeClasses[result.grade] || 'bg-gray-100 text-gray-700'}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{result.class_position}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{result.term}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{result.academic_year}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{result.teacher_comment || '-'}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => openModal(result)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(result.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="text-xs font-semibold uppercase text-blue-700">Highest Mark</h3>
            <p className="mt-1 text-2xl font-bold text-blue-800">{performanceSummary.highest.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <h3 className="text-xs font-semibold uppercase text-purple-700">Lowest Mark</h3>
            <p className="mt-1 text-2xl font-bold text-purple-800">{performanceSummary.lowest.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <h3 className="text-xs font-semibold uppercase text-indigo-700">Class Average</h3>
            <p className="mt-1 text-2xl font-bold text-indigo-800">{performanceSummary.average}</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold">{isEditing ? 'Edit Result' : 'Add Result'}</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Mark (0-100)</label>
                  <input
                    type="number"
                    name="mark"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.mark}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade</label>
                  <input
                    type="text"
                    value={form.grade}
                    readOnly
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                    placeholder="Auto-calculated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Class Position</label>
                  <input
                    type="number"
                    name="class_position"
                    min="1"
                    value={form.class_position}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="number"
                    name="academic_year"
                    min="2000"
                    max="2100"
                    value={form.academic_year}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Term</label>
                  <select
                    name="term"
                    value={form.term}
                    required
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {termOptions.map((term) => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher Comment</label>
                  <input
                    type="text"
                    name="teacher_comment"
                    value={form.teacher_comment}
                    onChange={handleFormChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional comment"
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
                  {isEditing ? 'Update Result' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;