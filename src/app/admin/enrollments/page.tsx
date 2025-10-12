'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Enrollment {
  id: number;
  student_id: number;
  section_id: number;
  status: string;
  grade?: string;
  enrollment_date: string;
  status_reason?: string;
  student_number: string;
  student_name: string;
  student_email: string;
  subject_code: string;
  subject_name: string;
  section_name: string;
  schedule?: string;
  faculty_name?: string;
}

export default function EnrollmentControl() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    sectionId: '',
    studentId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEnrollments();
  }, [filters, pagination.page]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.sectionId && { sectionId: filters.sectionId }),
        ...(filters.studentId && { studentId: filters.studentId })
      });

      const response = await api.get(`/admin/enrollments?${params}`);
      setEnrollments(response.data.data.enrollments);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (enrollmentId: number, status: string, reason?: string) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}/status`, {
        status,
        reason
      });
      fetchEnrollments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update enrollment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'dropped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusUpdateModal = ({ enrollment, onClose }: { enrollment: Enrollment; onClose: () => void }) => {
    const [newStatus, setNewStatus] = useState(enrollment.status);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await handleStatusUpdate(enrollment.id, newStatus, reason);
        onClose();
      } catch (err) {
        // Error handled in handleStatusUpdate
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Enrollment Status</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium text-gray-900">{enrollment.student_name}</p>
              <p className="text-sm text-gray-600">{enrollment.subject_code} - {enrollment.subject_name}</p>
              <p className="text-sm text-gray-600">Section {enrollment.section_name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="rejected">Rejected</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for status change..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Control</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and approve student enrollments
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending: {enrollments.filter(e => e.status === 'pending').length}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Enrolled: {enrollments.filter(e => e.status === 'enrolled').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              placeholder="Student ID..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.studentId}
              onChange={(e) => setFilters({...filters, studentId: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section ID</label>
            <input
              type="text"
              placeholder="Section ID..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.sectionId}
              onChange={(e) => setFilters({...filters, sectionId: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchEnrollments}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {enrollment.student_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.student_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.student_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.subject_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.subject_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Section {enrollment.section_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.schedule || 'TBA'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                        {enrollment.status_reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            {enrollment.status_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.faculty_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {enrollment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(enrollment.id, 'enrolled')}
                                className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedEnrollment(enrollment)}
                            className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({...prev, page: Math.min(prev.pages, prev.page + 1)}))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({...prev, page: Math.min(prev.pages, prev.page + 1)}))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedEnrollment && (
        <StatusUpdateModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
        />
      )}
    </div>
  );
}
