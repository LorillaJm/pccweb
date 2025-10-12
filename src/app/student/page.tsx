'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  currentEnrollments: number;
  totalUnits: number;
  currentGPA: number;
  pendingPayments: number;
  totalBalance: number;
  newMaterials: number;
}

interface RecentGrade {
  subject_code: string;
  subject_name: string;
  final_grade: number;
  letter_grade: string;
  academic_year: string;
  semester: number;
}

interface RecentMaterial {
  id: number;
  title: string;
  subject_code: string;
  material_type: string;
  upload_date: string;
  uploaded_by_name: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentGrades, setRecentGrades] = useState<RecentGrade[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<RecentMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const [enrollmentsRes, gradesRes, paymentsRes, materialsRes] = await Promise.all([
        fetch('/api/student-services/enrollment/my-enrollments?academic_year=2024-2025&semester=1', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/student-services/grades/summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/student-services/payments/summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/student-services/materials?academic_year=2024-2025&semester=1', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const enrollments = await enrollmentsRes.json();
      const gradesSummary = await gradesRes.json();
      const paymentsSummary = await paymentsRes.json();
      const materials = await materialsRes.json();

      // Calculate stats
      const currentSemesterGrades = gradesSummary.find((g: any) => 
        g.academic_year === '2024-2025' && g.semester === 1
      );
      
      const currentSemesterPayments = paymentsSummary.find((p: any) => 
        p.academic_year === '2024-2025' && p.semester === 1
      );

      const dashboardStats: DashboardStats = {
        currentEnrollments: enrollments.length || 0,
        totalUnits: enrollments.reduce((sum: number, e: any) => sum + (e.units || 0), 0),
        currentGPA: currentSemesterGrades?.gpa || 0,
        pendingPayments: currentSemesterPayments?.pending_count || 0,
        totalBalance: currentSemesterPayments?.total_balance || 0,
        newMaterials: materials.filter((m: any) => {
          const uploadDate = new Date(m.upload_date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length
      };

      setStats(dashboardStats);

      // Fetch recent grades
      const recentGradesRes = await fetch('/api/student-services/grades?academic_year=2024-2025&semester=1', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const grades = await recentGradesRes.json();
      setRecentGrades(grades.slice(0, 5));

      // Set recent materials
      setRecentMaterials(materials.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name}! Here's your academic overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Enrollments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.currentEnrollments || 0}</p>
              <p className="text-sm text-gray-500">{stats?.totalUnits || 0} total units</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current GPA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.currentGPA ? stats.currentGPA.toFixed(2) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">This semester</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱{stats?.totalBalance ? stats.totalBalance.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-500">{stats?.pendingPayments || 0} pending payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/student/enrollment"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Enroll Subjects</span>
          </a>
          <a
            href="/student/grades"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View Grades</span>
          </a>
          <a
            href="/student/payments"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Pay Tuition</span>
          </a>
          <a
            href="/student/materials"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Download Materials</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h2>
          {recentGrades.length > 0 ? (
            <div className="space-y-3">
              {recentGrades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{grade.subject_code}</p>
                    <p className="text-sm text-gray-600">{grade.subject_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{grade.letter_grade}</p>
                    <p className="text-sm text-gray-600">{grade.final_grade?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No grades available yet</p>
          )}
        </div>

        {/* Recent Materials */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Materials
            {stats?.newMaterials && stats.newMaterials > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {stats.newMaterials} new
              </span>
            )}
          </h2>
          {recentMaterials.length > 0 ? (
            <div className="space-y-3">
              {recentMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-600">
                      {material.subject_code} • {material.material_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(material.upload_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{material.uploaded_by_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No materials available yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
