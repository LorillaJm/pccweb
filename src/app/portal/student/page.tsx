'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { announcementsApi, subjectsApi, Announcement, ClassSection } from '@/lib/api';
import { BookOpen, Clock, Users, TrendingUp, Award, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { WelcomeCard } from '@/components/portal/WelcomeCard';
import { QuickStatsCard } from '@/components/portal/QuickStatsCard';
import { AnnouncementsFeed } from '@/components/portal/AnnouncementsFeed';
import { UpcomingEventsSection } from '@/components/portal/UpcomingEventsSection';
import { motion } from 'framer-motion';

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
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoadingDashboard(false);
      return;
    }

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
        // Check if we're calling the wrong API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';
        if (apiUrl.includes('pccweb.onrender.com')) {
          setError('⚠️ Frontend is calling production API but you\'re logged into local backend. Please restart frontend: npm run dev');
        } else {
          setError('Your session has expired. Please sign in again.');
        }
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const studentProfile = profile as any;

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout>
        <div className="space-y-8 mt-4">
          {/* World-Class Welcome Card */}
          <WelcomeCard
            firstName={user?.firstName || 'Student'}
            program={studentProfile?.program}
            yearLevel={studentProfile?.yearLevel}
            semester={studentProfile?.semester}
          />

          {/* Quick Stats - Animated Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatsCard
              title="Enrolled Subjects"
              value={isLoadingDashboard ? '...' : enrolledSubjects.length}
              subtitle="Active courses"
              icon={BookOpen}
              gradient="from-blue-600 to-indigo-600"
              delay={0.1}
            />
            <QuickStatsCard
              title="Current GPA"
              value={isLoadingDashboard ? '...' : (studentProfile?.gpa ? studentProfile.gpa.toFixed(2) : 'N/A')}
              subtitle="Academic performance"
              icon={TrendingUp}
              gradient="from-emerald-600 to-green-600"
              delay={0.2}
            />
            <QuickStatsCard
              title="Attendance"
              value="95%"
              subtitle="This semester"
              icon={Target}
              gradient="from-purple-600 to-pink-600"
              delay={0.3}
            />
            <QuickStatsCard
              title="Total Units"
              value={isLoadingDashboard ? '...' : enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0)}
              subtitle="Current load"
              icon={Zap}
              gradient="from-amber-600 to-orange-600"
              delay={0.4}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enrolled Subjects - Takes 2 columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">My Subjects</h3>
                    </div>
                    <Link
                      href="/portal/student/subjects"
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold bg-white px-4 py-2 rounded-xl hover:shadow-md transition-all"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
                
                <div className="p-6">
                  {isLoadingDashboard ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading subjects...</p>
                    </div>
                  ) : enrolledSubjects.length > 0 ? (
                    <div className="space-y-4">
                      {enrolledSubjects.slice(0, 4).map((subject, index) => (
                        <motion.div
                          key={subject.sectionId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          className="group p-5 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md"
                            >
                              <BookOpen className="h-6 w-6 text-white" />
                            </motion.div>
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
                        </motion.div>
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
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No enrolled subjects yet.</p>
                      <Link 
                        href="/portal/student/subjects"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                      >
                        Browse available subjects
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Announcements Feed */}
            <div>
              <AnnouncementsFeed 
                announcements={announcements} 
                isLoading={isLoadingDashboard}
              />
            </div>
          </div>

          {/* Upcoming Events Section */}
          <UpcomingEventsSection />

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { href: '/portal/student/subjects', icon: BookOpen, label: 'My Subjects', desc: '📚 View courses', gradient: 'from-blue-500 to-indigo-600' },
                { href: '/portal/student/announcements', icon: Award, label: 'Announcements', desc: '📢 Latest news', gradient: 'from-yellow-500 to-orange-500' },
                { href: '/portal/student/profile', icon: Users, label: 'Profile', desc: '👤 My info', gradient: 'from-green-500 to-emerald-600' },
                { href: '/', icon: Award, label: 'Main Site', desc: '🏠 Homepage', gradient: 'from-gray-500 to-slate-600' },
              ].map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Link 
                    href={action.href}
                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-2xl transition-all border border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <action.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="mt-4 text-sm font-semibold text-gray-900">{action.label}</span>
                    <span className="text-xs text-gray-600 mt-1">{action.desc}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <p className="text-red-600">{error}</p>
            </motion.div>
          )}
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}
