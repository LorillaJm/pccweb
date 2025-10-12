'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  description?: string;
  units: number;
  prerequisites?: string;
  year_level?: number;
  semester?: number;
  department?: string;
  is_active: boolean;
  section_count: number;
  active_sections: number;
  created_at: string;
  updated_at: string;
}

interface ClassSection {
  id: number;
  subject_id: number;
  section_name: string;
  faculty_id?: number;
  schedule?: string;
  room?: string;
  max_students: number;
  enrolled_students: number;
  academic_year: string;
  semester: number;
  is_active: boolean;
  subject_code: string;
  subject_name: string;
  units: number;
  faculty_name?: string;
}

interface CreateSubjectData {
  subjectCode: string;
  subjectName: string;
  description?: string;
  units: number;
  prerequisites?: string;
  yearLevel?: number;
  semester?: number;
  department?: string;
}

interface CreateSectionData {
  subjectId: number;
  sectionName: string;
  facultyId?: number;
  schedule?: string;
  room?: string;
  maxStudents: number;
  academicYear: string;
  semester: number;
}

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'sections'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    } else {
      fetchSections();
    }
  }, [activeTab, searchTerm]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/admin/subjects?${params}`);
      setSubjects(response.data.data.subjects);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/sections?page=1&limit=50');
      setSections(response.data.data.sections);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (subjectData: CreateSubjectData) => {
    try {
      await api.post('/admin/subjects', subjectData);
      setShowCreateSubjectModal(false);
      fetchSubjects();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleCreateSection = async (sectionData: CreateSectionData) => {
    try {
      await api.post('/admin/sections', sectionData);
      setShowCreateSectionModal(false);
      fetchSections();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleUpdateSubject = async (subjectId: number, updates: Partial<Subject>) => {
    try {
      await api.put(`/admin/subjects/${subjectId}`, updates);
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update subject');
    }
  };

  const CreateSubjectModal = () => {
    const [formData, setFormData] = useState<CreateSubjectData>({
      subjectCode: '',
      subjectName: '',
      units: 3
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setFormError(null);
        await handleCreateSubject(formData);
      } catch (err: any) {
        setFormError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Subject</h3>
            
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Units</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.units}
                    onChange={(e) => setFormData({...formData, units: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Level</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.yearLevel || ''}
                    onChange={(e) => setFormData({...formData, yearLevel: e.target.value ? parseInt(e.target.value) : undefined})}
                  >
                    <option value="">Any Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.semester || ''}
                    onChange={(e) => setFormData({...formData, semester: e.target.value ? parseInt(e.target.value) : undefined})}
                  >
                    <option value="">Any Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">Summer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prerequisites</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.prerequisites || ''}
                  onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  placeholder="e.g., MATH101, CS100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSubjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CreateSectionModal = () => {
    const [formData, setFormData] = useState<CreateSectionData>({
      subjectId: 0,
      sectionName: '',
      maxStudents: 30,
      academicYear: '2024-2025',
      semester: 1
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setFormError(null);
        await handleCreateSection(formData);
      } catch (err: any) {
        setFormError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Class Section</h3>
            
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: parseInt(e.target.value)})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.sectionName}
                    onChange={(e) => setFormData({...formData, sectionName: e.target.value})}
                    placeholder="e.g., A, B, 1, 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.schedule || ''}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    placeholder="e.g., MWF 9:00-10:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.room || ''}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="e.g., Room 101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Students</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                  >
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">Summer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSectionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage subjects, courses, and class sections
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateSubjectModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Subject
          </button>
          <button
            onClick={() => setShowCreateSectionModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Section
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subjects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Class Sections
          </button>
        </nav>
      </div>

      {/* Search */}
      {activeTab === 'subjects' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Subjects</label>
            <input
              type="text"
              placeholder="Subject code, name, or description..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        ) : activeTab === 'subjects' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year/Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subject.subject_code} - {subject.subject_name}
                        </div>
                        {subject.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {subject.description}
                          </div>
                        )}
                        {subject.prerequisites && (
                          <div className="text-xs text-gray-400 mt-1">
                            Prerequisites: {subject.prerequisites}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.year_level && `Year ${subject.year_level}`}
                      {subject.year_level && subject.semester && ', '}
                      {subject.semester && `Sem ${subject.semester}`}
                      {!subject.year_level && !subject.semester && 'Any'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.active_sections}/{subject.section_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateSubject(subject.id, { is_active: !subject.is_active })}
                        className={`${
                          subject.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } mr-3`}
                      >
                        {subject.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {section.subject_code}-{section.section_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {section.academic_year} Sem {section.semester}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {section.subject_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {section.units} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{section.schedule || 'TBA'}</div>
                      <div className="text-sm text-gray-500">{section.room || 'TBA'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {section.enrolled_students}/{section.max_students}
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (section.enrolled_students / section.max_students) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {section.faculty_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        section.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateSubjectModal && <CreateSubjectModal />}
      {showCreateSectionModal && <CreateSectionModal />}
    </div>
  );
}
