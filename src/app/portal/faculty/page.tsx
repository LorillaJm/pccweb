'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { announcementsApi, subjectsApi, Announcement, ClassSection } from '@/lib/api';
import { BookOpen, Calendar, Users, Bell, TrendingUp, Upload, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch announcements
      const announcementsResponse = await announcementsApi.getAnnouncements({ 
        limit: 5 
      });
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.data.announcements);
      }

      // Fetch assigned subjects
      const subjectsResponse = await subjectsApi.getAssignedSubjects();
      if (subjectsResponse.success) {
        setAssignedSubjects(subjectsResponse.data.assignedSubjects);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const facultyProfile = profile as any; // Type assertion for faculty profile

  return (
    <ProtectedRoute requiredRole="faculty">
      <PortalLayout title="Faculty Dashboard">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome, Prof. {user?.lastName}!
                </h2>
                <p className="text-green-100">
                  {facultyProfile?.department && `${facultyProfile.department} Department`}
                  {facultyProfile?.position && ` • ${facultyProfile.position}`}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 bg-green-500 bg-opacity-50 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teaching Load</p>
                  <p className="text-2xl font-bold text-gray-900">{assignedSubjects.length}</p>
                  <p className="text-xs text-gray-500">Classes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignedSubjects.reduce((total, subject) => total + subject.enrolledStudents, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Materials</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignedSubjects.reduce((total, subject) => total + (subject.materialCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teaching Classes */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
                  <Link 
                    href="/portal/faculty/classes"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading classes...</p>
                  </div>
                ) : assignedSubjects.length > 0 ? (
                  <div className="space-y-4">
                    {assignedSubjects.slice(0, 4).map((subject) => (
                      <div key={subject.sectionId} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {subject.subjectCode} - {subject.subjectName}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span className="mr-3">Section: {subject.sectionName}</span>
                            <Users className="h-3 w-3 mr-1" />
                            <span className="mr-3">{subject.enrolledStudents}/{subject.maxStudents} students</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {subject.schedule || 'Schedule TBA'} • {subject.room || 'Room TBA'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                          </div>
                          {subject.materialCount && subject.materialCount > 0 && (
                            <div className="text-xs text-blue-600">
                              {subject.materialCount} materials
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {assignedSubjects.length > 4 && (
                      <div className="text-center pt-4">
                        <Link 
                          href="/portal/faculty/classes"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View {assignedSubjects.length - 4} more classes →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No assigned classes yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Announcements</h3>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href="/portal/faculty/announcements/new"
                      className="text-green-600 hover:text-green-700 p-1 rounded"
                      title="Create new announcement"
                    >
                      <Plus className="h-4 w-4" />
                    </Link>
                    <Link 
                      href="/portal/faculty/announcements"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start">
                          <div className={`p-1 rounded-full mr-3 mt-1 ${
                            announcement.priority === 'high' ? 'bg-red-100' :
                            announcement.priority === 'urgent' ? 'bg-red-200' :
                            'bg-blue-100'
                          }`}>
                            <Bell className={`h-3 w-3 ${
                              announcement.priority === 'high' ? 'text-red-600' :
                              announcement.priority === 'urgent' ? 'text-red-700' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {announcement.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No announcements</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/portal/faculty/materials"
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <Upload className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm font-medium text-blue-900">Upload Material</span>
              </Link>
              
              <Link 
                href="/portal/faculty/announcements/new"
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <Plus className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm font-medium text-green-900">New Announcement</span>
              </Link>
              
              <Link 
                href="/portal/faculty/classes"
                className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
              >
                <BookOpen className="h-8 w-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm font-medium text-yellow-900">My Classes</span>
              </Link>
              
              <Link 
                href="/portal/faculty/profile"
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <Users className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm font-medium text-purple-900">Profile</span>
              </Link>
            </div>
          </div>

          {/* Faculty Info Card */}
          {facultyProfile && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Faculty Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Department</h4>
                  <p className="text-gray-900">{facultyProfile.department || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Position</h4>
                  <p className="text-gray-900">{facultyProfile.position || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Office Location</h4>
                  <p className="text-gray-900">{facultyProfile.officeLocation || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Office Hours</h4>
                  <p className="text-gray-900">{facultyProfile.officeHours || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}