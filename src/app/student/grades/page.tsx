'use client';

import { useEffect, useState } from 'react';

interface Grade {
  id: number;
  subject_code: string;
  subject_name: string;
  units: number;
  section_name: string;
  faculty_name: string;
  academic_year: string;
  semester: number;
  prelim_grade: number;
  midterm_grade: number;
  finals_grade: number;
  final_grade: number;
  letter_grade: string;
  grade_points: number;
  status: string;
  remarks: string;
}

interface GradeSummary {
  academic_year: string;
  semester: number;
  total_subjects: number;
  gpa: number;
  total_units: number;
  passed_subjects: number;
  failed_subjects: number;
  incomplete_subjects: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeSummary, setGradeSummary] = useState<GradeSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
    fetchGradeSummary();
  }, [selectedYear, selectedSemester]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedYear) params.append('academic_year', selectedYear);
      if (selectedSemester) params.append('semester', selectedSemester);

      const response = await fetch(`/api/student-services/grades?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchGradeSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student-services/grades/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGradeSummary(data);
      }
    } catch (error) {
      console.error('Error fetching grade summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      case 'INC': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentSemesterSummary = gradeSummary.find(
    s => s.academic_year === selectedYear && s.semester === parseInt(selectedSemester)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600">View your academic performance and GPA</p>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">Summer</option>
          </select>
        </div>
      </div>

      {/* Grade Summary Cards */}
      {currentSemesterSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {currentSemesterSummary.gpa.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Current GPA</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {currentSemesterSummary.total_subjects}
              </p>
              <p className="text-sm text-gray-600">Total Subjects</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {currentSemesterSummary.passed_subjects}
              </p>
              <p className="text-sm text-gray-600">Passed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {currentSemesterSummary.total_units}
              </p>
              <p className="text-sm text-gray-600">Total Units</p>
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Grades for {selectedYear} - {selectedSemester === '1' ? '1st' : selectedSemester === '2' ? '2nd' : 'Summer'} Semester
          </h2>
        </div>
        
        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prelim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Midterm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letter Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{grade.subject_code}</div>
                        <div className="text-sm text-gray-500">{grade.subject_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.section_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.faculty_name || 'TBA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.prelim_grade ? grade.prelim_grade.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.midterm_grade ? grade.midterm_grade.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.finals_grade ? grade.finals_grade.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.final_grade ? grade.final_grade.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {grade.letter_grade ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.letter_grade)}`}>
                          {grade.letter_grade}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No grades available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Grades for this semester haven't been posted yet.
            </p>
          </div>
        )}
      </div>

      {/* GPA History */}
      {gradeSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">GPA History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passed/Failed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gradeSummary.map((summary, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.academic_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.semester === 1 ? '1st' : summary.semester === 2 ? '2nd' : 'Summer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {summary.gpa.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.total_units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.total_subjects}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-green-600">{summary.passed_subjects}</span>
                      {summary.failed_subjects > 0 && (
                        <>
                          {' / '}
                          <span className="text-red-600">{summary.failed_subjects}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
