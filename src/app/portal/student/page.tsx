'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { announcementsApi, subjectsApi, Announcement, ClassSection } from '@/lib/api';
import { BookOpen, Calendar, Clock, Users, Bell, TrendingUp, Award, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<ClassSection[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingDashboard(true);
      
      // Fetch announcements
      const announcementsResponse = await announcementsApi.getAnnouncements({ 
        limit: 5 
      });
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.data.announcements);
      }

      // Fetch enrolled subjects
      const subjectsResponse = await subjectsApi.getEnrolledSubjects();
      if (subjectsResponse.success) {
        setEnrolledSubjects(subjectsResponse.data.enrolledSubjects);
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      const status = error?.response?.status;
      if (status === 401) {
        setError('Your session is not authorized to load dashboard data. Please sign in again.');
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const studentProfile = profile as any; // Type assertion for student profile

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout title="Student Dashboard">
        <div className="space-y-12">
          {/* Premium Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[2rem] shadow-2xl shadow-blue-900/25">
            {/* Sophisticated Background Pattern */}
            <div className="absolute inset-0">
              {/* Primary gradient mesh */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20"></div>
              
              {/* Geometric patterns */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
                <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
              </div>
              
              {/* Ambient lighting */}
              <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-radial from-blue-400/15 via-blue-400/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-60 h-60 bg-gradient-radial from-indigo-400/15 via-purple-400/5 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
                <div className="flex-1 space-y-6">
                  {/* Premium greeting */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl blur-lg"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                          <BookOpen className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                          Welcome back, <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">{user?.firstName}</span>! 
                        </h2>
                        <p className="text-xl text-blue-100 font-medium">
                          Ready to excel in your academic journey today?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium badges */}
                  <div className="flex flex-wrap items-center gap-4">
                    {studentProfile?.program && (
                      <div className="group flex items-center space-x-2 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                        <span className="text-white font-semibold">{studentProfile.program}</span>
                      </div>
                    )}
                    {studentProfile?.yearLevel && (
                      <div className="group flex items-center space-x-2 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                        <span className="text-white font-semibold">Year {studentProfile.yearLevel}</span>
                      </div>
                    )}
                    {studentProfile?.semester && (
                      <div className="group flex items-center space-x-2 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                        <span className="text-white font-semibold">Semester {studentProfile.semester}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Premium illustration */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] blur-2xl"></div>
                    <div className="relative w-40 h-40 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20 transform rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105">
                      <GraduationCap className="h-20 w-20 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Enrolled Subjects Card */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-blue-600/20 border border-gray-200/60 transition-all duration-500 hover:scale-[1.02]">
              {/* Card accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl"></div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Enrolled Subjects</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {enrolledSubjects.length}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/25 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-blue-700 font-semibold">Active courses this semester</span>
                </div>
              </div>
            </div>

            {/* GPA Card */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-emerald-600/20 border border-gray-200/60 transition-all duration-500 hover:scale-[1.02]">
              {/* Card accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-t-3xl"></div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current GPA</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {studentProfile?.gpa ? studentProfile.gpa.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/25 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-emerald-700 font-semibold">Academic performance</span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-amber-600/20 border border-gray-200/60 transition-all duration-500 hover:scale-[1.02]">
              {/* Card accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-3xl"></div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Academic Status</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent capitalize">
                      {studentProfile?.status || 'Active'}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-600/25 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-amber-700 font-semibold">Current enrollment standing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enrolled Subjects */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">My Subjects</h3>
                  </div>
                  <Link 
                    href="/portal/student/subjects"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {isLoadingDashboard ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading subjects...</p>
                  </div>
                ) : enrolledSubjects.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledSubjects.slice(0, 4).map((subject, index) => (
                      <div key={subject.sectionId} className="group p-5 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-200 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 ml-4">
                            <h4 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {subject.subjectCode}
                            </h4>
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {subject.subjectName}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{subject.facultyName}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{subject.schedule || 'TBA'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-blue-100 group-hover:bg-blue-200 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full transition-colors">
                              {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                            </div>
                            {subject.materialCount && subject.materialCount > 0 && (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                📁 {subject.materialCount} materials
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {enrolledSubjects.length > 4 && (
                      <div className="text-center pt-4">
                        <Link 
                          href="/portal/student/subjects"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View {enrolledSubjects.length - 4} more subjects →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No enrolled subjects yet.</p>
                    <Link 
                      href="/portal/student/subjects"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                    >
                      Browse available subjects
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Announcements</h3>
                  </div>
                  <Link 
                    href="/portal/student/announcements"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {isLoadingDashboard ? (
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link 
                href="/portal/student/subjects"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <span className="mt-4 text-sm font-semibold text-blue-900">My Subjects</span>
                <span className="text-xs text-blue-600 mt-1">📚 View courses</span>
              </Link>
              
              <Link 
                href="/portal/student/announcements"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-yellow-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <span className="mt-4 text-sm font-semibold text-yellow-900">Announcements</span>
                <span className="text-xs text-yellow-600 mt-1">📢 Latest news</span>
              </Link>
              
              <Link 
                href="/portal/student/profile"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <span className="mt-4 text-sm font-semibold text-green-900">Profile</span>
                <span className="text-xs text-green-600 mt-1">👤 My info</span>
              </Link>
              
              <Link 
                href="/"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <span className="mt-4 text-sm font-semibold text-gray-900">Main Site</span>
                <span className="text-xs text-gray-600 mt-1">🏠 Homepage</span>
              </Link>
            </div>
          </div>

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