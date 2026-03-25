import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { theme } from '../../styles/theme';

const GuardianResultsPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [resultsData, setResultsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchChildren();
    // Set default to 2024 to match seeded data
    setSelectedYear('2024');
  }, []);

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      fetchResultsData(selectedChild);
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

  const fetchResultsData = async (childId) => {
    setLoading(true);
    try {
      const response = await api.get('/api/students/guardians/my_children_results/');
      console.log('Raw results response:', response.data);
      const childResults = response.data.filter(result => result.student === childId);
      console.log('Filtered results for child', childId, ':', childResults);
      setResultsData(prev => ({ ...prev, [childId]: childResults }));
    } catch (err) {
      setError('Failed to fetch results data');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTerms = () => {
    if (!selectedChild || !resultsData[selectedChild]) return [];
    const terms = [...new Set(resultsData[selectedChild].map(result => result.term).filter(Boolean))];
    return terms.sort();
  };

  const getAvailableYears = () => {
    if (!selectedChild || !resultsData[selectedChild]) return [];
    const years = [...new Set(resultsData[selectedChild].map(result => result.academic_year).filter(Boolean))];
    return years.sort();
  };

  const calculateSummaryCards = () => {
    console.log('Calculating summary for selectedChild:', selectedChild);
    console.log('Available resultsData:', resultsData);
    
    if (!selectedChild || !resultsData[selectedChild]) {
      console.log('No selected child or results data');
      return {
        averageMark: 0,
        highestMark: 0,
        lowestMark: 0
      };
    }

    let results = resultsData[selectedChild];
    console.log('Raw results for child:', results);
    
    // Apply filters if set
    if (selectedTerm) {
      results = results.filter(result => result.term === selectedTerm);
      console.log('After term filter:', results);
    }
    if (selectedYear) {
      results = results.filter(result => result.academic_year == selectedYear);
      console.log('After year filter:', results);
    }

    if (results.length === 0) {
      console.log('No results after filtering');
      return {
        averageMark: 0,
        highestMark: 0,
        lowestMark: 0
      };
    }

    const marks = results.map(result => parseFloat(result.mark) || 0);
    console.log('Extracted marks:', marks);
    const averageMark = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
    const highestMark = Math.max(...marks);
    const lowestMark = Math.min(...marks);

    const summary = {
      averageMark: averageMark.toFixed(1),
      highestMark,
      lowestMark
    };
    console.log('Calculated summary:', summary);
    return summary;
  };

  const getFilteredResults = () => {
    if (!selectedChild || !resultsData[selectedChild]) return [];
    
    let results = resultsData[selectedChild];
    
    // Apply filters if set
    if (selectedTerm) {
      results = results.filter(result => result.term === selectedTerm);
    }
    if (selectedYear) {
      results = results.filter(result => result.academic_year === selectedYear);
    }

    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
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
  const filteredResults = getFilteredResults();
  const availableTerms = getAvailableTerms();
  const availableYears = getAvailableYears();

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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.gray900 }}>
          Filter Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Terms</option>
              {availableTerms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.gray900 }}>
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTerm('');
                setSelectedYear(new Date().getFullYear().toString());
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: theme.primary, color: theme.white }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Average Mark</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.averageMark}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.accent }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Highest Mark</div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            {summary.highestMark}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: theme.primary }}>
          <div className="text-sm font-medium text-gray-600 mb-1">Lowest Mark</div>
          <div className="text-2xl font-bold" style={{ color: theme.primary }}>
            {summary.lowestMark}%
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: theme.gray900 }}>
            Academic Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          {filteredResults.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Mark
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Class Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                    Teacher Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.subject?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(result.mark || 0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.class_position || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.term || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {result.teacher_comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results found for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianResultsPage;