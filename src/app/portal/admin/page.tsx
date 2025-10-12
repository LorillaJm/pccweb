'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  FileText,
  UserPlus,
  Shield,
  Database
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  totalAnnouncements: number;
  activeEnrollments: number;
}

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  time: string;
  status: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalAnnouncements: 0,
    activeEnrollments: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const { api } = await import('@/lib/api');
      const response = await api.get('/admin/dashboard');
      
      const { userStats, enrollmentStats, recentUsers, recentAnnouncements } = response.data.data;
      
      // Calculate totals from userStats
      const totalUsers = userStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
      const studentStat = userStats.find((s: any) => s.role === 'student');
      const facultyStat = userStats.find((s: any) => s.role === 'faculty');
      
      // Get subjects count
      let totalSubjects = 0;
      try {
        const subjectsResponse = await api.get('/admin/subjects?limit=1');
        totalSubjects = subjectsResponse.data.data?.pagination?.total || 0;
      } catch (err) {
        console.warn('Failed to fetch subjects count:', err);
      }
      
      // Get announcements count
      let totalAnnouncements = 0;
      try {
        const announcementsResponse = await api.get('/admin/announcements?limit=1');
        totalAnnouncements = announcementsResponse.data.data?.pagination?.total || 0;
      } catch (err) {
        console.warn('Failed to fetch announcements count:', err);
      }
      
      setStats({
        totalUsers,
        totalStudents: studentStat?.count || 0,
        totalFaculty: facultyStat?.count || 0,
        totalSubjects,
        totalAnnouncements,
        activeEnrollments: enrollmentStats?.active_enrollments || 0
      });
      
      // Build recent activity from recent users and announcements
      const activities: ActivityItem[] = [];
      
      recentUsers.slice(0, 3).forEach((user: any, index: number) => {
        activities.push({
          id: activities.length + 1,
          type: 'user_created',
          message: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
          time: getRelativeTime(user.createdAt),
          status: 'success'
        });
      });
      
      recentAnnouncements.slice(0, 2).forEach((announcement: any) => {
        activities.push({
          id: activities.length + 1,
          type: 'announcement',
          message: `New announcement: ${announcement.title}`,
          time: getRelativeTime(announcement.createdAt),
          status: 'info'
        });
      });
      
      setRecentActivity(activities);
    } catch (error: unknown) {
      console.error('Failed to fetch dashboard stats:', error);
      // Fallback to zeros on error
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalSubjects: 0,
        totalAnnouncements: 0,
        activeEnrollments: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };



  const quickActions = [
    {
      title: 'User Management',
      description: 'Add, edit, and manage students, faculty, and staff accounts',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      color: 'bg-blue-500',
      count: stats.totalUsers
    },
    {
      title: 'Academic Management',
      description: 'Manage courses, programs, subjects, and class sections',
      icon: BookOpen,
      href: '/admin/academic',
      gradient: 'from-emerald-600 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      color: 'bg-green-500',
      count: stats.totalSubjects
    },
    {
      title: 'Content Management',
      description: 'Create and manage news, events, and announcements',
      icon: MessageSquare,
      href: '/admin/content',
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      color: 'bg-purple-500',
      count: stats.totalAnnouncements
    },
    {
      title: 'Enrollment Control',
      description: 'Track, approve, and manage student enrollments',
      icon: UserPlus,
      href: '/admin/enrollments',
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      color: 'bg-orange-500',
      count: stats.activeEnrollments
    },
    {
      title: 'System Analytics',
      description: 'View comprehensive reports and system analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      gradient: 'from-indigo-600 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      color: 'bg-indigo-500',
      count: '24/7'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      gradient: 'from-gray-600 to-slate-600',
      bgGradient: 'from-gray-50 to-slate-50',
      color: 'bg-gray-500',
      count: 'Config'
    }
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Faculty',
      value: stats.totalFaculty,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Announcements',
      value: stats.totalAnnouncements,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Active Enrollments',
      value: stats.activeEnrollments,
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <PortalLayout title="Admin Dashboard">
        <div className="space-y-12">
          {/* Premium Admin Overview */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[2rem] shadow-2xl shadow-blue-900/25">
            {/* Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20"></div>
              <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-radial from-blue-400/15 via-blue-400/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-60 h-60 bg-gradient-radial from-indigo-400/15 via-purple-400/5 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl blur-lg"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                          <Shield className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                          Admin <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Control Center</span>
                        </h2>
                        <p className="text-xl text-blue-100 font-medium">
                          Complete system management and oversight
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-semibold">System Online</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-semibold">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'} Access</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] blur-2xl"></div>
                    <div className="relative w-40 h-40 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20 transform rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105">
                      <Database className="h-20 w-20 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="group relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-900/10 hover:shadow-2xl border border-gray-200/60 transition-all duration-500 hover:scale-[1.02]">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color === 'text-blue-600' ? 'from-blue-600 to-indigo-600' : 
                  stat.color === 'text-green-600' ? 'from-emerald-600 to-green-600' :
                  stat.color === 'text-purple-600' ? 'from-purple-600 to-pink-600' :
                  stat.color === 'text-orange-600' ? 'from-orange-600 to-red-600' :
                  stat.color === 'text-red-600' ? 'from-red-600 to-pink-600' :
                  'from-indigo-600 to-purple-600'} rounded-t-2xl`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">
                        {isLoadingStats ? '...' : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">{action.title}</h3>
                  </div>
                  <p className="text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'info' ? 'bg-blue-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">System logs and user activities will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}
