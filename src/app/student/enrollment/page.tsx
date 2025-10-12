'use client';

import { useEffect, useState } from 'react';

interface AvailableSubject {
  id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  units: number;
  description: string;
  section_name: string;
  schedule: string;
  room: string;
  faculty_name: string;
  max_students: number;
  enrolled_students: number;
  available_slots: number;
  is_enrolled: boolean;
}

interface CurrentEnrollment {
  enrollment_id: number;
  subject_code: string;
  subject_name: string;
  units: number;
  section_name: string;
  schedule: string;
  room: string;
  faculty_name: string;
  enrollment_status: string;
  academic_year: string;
  semester: number;
}

export default function EnrollmentPage() {
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
  const [currentEnrollments, setCurrentEnrollments] = useState<CurrentEnrollment[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableSubjects();
    fetchCurrentEnrollments();
  }, [selectedYear, selectedSemester]);

  const fetchAvailableSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        academic_year: selectedYear,
        semester: selectedSemester
      });

      const response = await fetch(`/api/student-services/enrollment/available-subjects?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching available subjects:', error);
    }
  };

  const fetchCurrentEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        academic_year: selectedYear,
        semester: selectedSemester
      });

      const response = await fetch(`/api/student-services/enrollment/my-enrollments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching current enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classSectionId: number) => {
    setEnrolling(classSectionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student-services/enrollment/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          class_section_id: classSectionId,
          academic_year: selectedYear,
          semester: parseInt(selectedSemester)
        })
      });

      if (response.ok) {
        await fetchAvailableSubjects();
        await fetchCurrentEnrollments();
        alert('Successfully enrolled! Your enrollment is pending approval.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const handleDrop = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to drop this subject?')) return;

    const dropReason = prompt('Please provide a reason for dropping:');
    if (!dropReason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student-services/enrollment/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ drop_reason: dropReason })
      });

      if (response.ok) {
        await fetchAvailableSubjects();
        await fetchCurrentEnrollments();
        alert('Subject dropped successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to drop subject');
      }
    } catch (error) {
      console.error('Error dropping subject:', error);
      alert('Failed to drop subject');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'enrolled': return 'bg-blue-100 text-blue-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEnrolledUnits = currentEnrollments
    .filter(e => ['pending', 'approved', 'enrolled'].includes(e.enrollment_status))
    .reduce((sum, e) => sum + e.units, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Subject Enrollment</h1>
          <p className="text-gray-600">Register for classes and manage your course load</p>
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

      {/* Enrollment Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{currentEnrollments.length}</p>
            <p className="text-sm text-gray-600">Enrolled Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{totalEnrolledUnits}</p>
            <p className="text-sm text-gray-600">Total Units</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600">{24 - totalEnrolledUnits}</p>
            <p className="text-sm text-gray-600">Remaining Units (Max: 24)</p>
          </div>
        </div>
      </div>

      {/* Current Enrollments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Current Enrollments</h2>
        </div>
        
        {currentEnrollments.length > 0 ? (
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
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEnrollments.map((enrollment) => (
                  <tr key={enrollment.enrollment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{enrollment.subject_code}</div>
                        <div className="text-sm text-gray-500">{enrollment.subject_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.section_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.schedule}</div>
                      <div className="text-sm text-gray-500">{enrollment.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.faculty_name || 'TBA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.enrollment_status)}`}>
                        {enrollment.enrollment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {['pending', 'approved'].includes(enrollment.enrollment_status) && (
                        <button
                          onClick={() => handleDrop(enrollment.enrollment_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Drop
                        </button>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by enrolling in subjects from the available list below.
            </p>
          </div>
        )}
      </div>

      {/* Available Subjects */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Subjects</h2>
        </div>
        
        {availableSubjects.length > 0 ? (
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
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slots
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subject.subject_code}</div>
                        <div className="text-sm text-gray-500">{subject.subject_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.section_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subject.schedule}</div>
                      <div className="text-sm text-gray-500">{subject.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.faculty_name || 'TBA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${subject.available_slots <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {subject.available_slots}/{subject.max_students}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subject.is_enrolled ? (
                        <span className="text-gray-500">Enrolled</span>
                      ) : subject.available_slots > 0 ? (
                        <button
                          onClick={() => handleEnroll(subject.id)}
                          disabled={enrolling === subject.id || totalEnrolledUnits + subject.units > 24}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {enrolling === subject.id ? 'Enrolling...' : 'Enroll'}
                        </button>
                      ) : (
                        <span className="text-red-500">Full</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects available</h3>
            <p className="mt-1 text-sm text-gray-500">
              No subjects are available for enrollment at this time.
            </p>
          </div>
        )}
      </div>

      {/* Enrollment Guidelines */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Enrollment Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Maximum of 24 units per semester</li>
          <li>• Enrollment is subject to approval by the registrar</li>
          <li>• Prerequisites must be completed before enrolling</li>
          <li>• Late enrollment may incur additional fees</li>
          <li>• Contact the registrar for any enrollment issues</li>
        </ul>
      </div>
    </div>
  );
}
