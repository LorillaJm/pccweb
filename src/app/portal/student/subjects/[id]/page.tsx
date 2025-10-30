'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { subjectsApi, materialsApi, ClassSection, ClassMaterial } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Users,
  MapPin,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Award,
  Target,
  ArrowLeft,
  ExternalLink,
  Video,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { timing, easing, staggerContainer, staggerItem } from '@/lib/animations';
import Link from 'next/link';

type TabType = 'overview' | 'materials' | 'assignments' | 'grades';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = Number(params.id);

  const [subject, setSubject] = useState<ClassSection | null>(null);
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [sectionId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch enrolled subjects to find this one
      const subjectsResponse = await subjectsApi.getEnrolledSubjects();
      if (subjectsResponse.success) {
        const foundSubject = subjectsResponse.data.enrolledSubjects.find(
          s => s.sectionId === sectionId
        );
        if (foundSubject) {
          setSubject(foundSubject);
        } else {
          setError('Course not found');
        }
      }

      // Fetch materials
      try {
        const materialsResponse = await materialsApi.getSectionMaterials(sectionId);
        if (materialsResponse.success) {
          setMaterials(materialsResponse.data.materials);
        }
      } catch (err) {
        console.log('No materials found or error fetching materials');
      }
    } catch (error: any) {
      console.error('Failed to fetch course data:', error);
      setError('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (materialId: number, fileName: string) => {
    try {
      const blob = await materialsApi.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download material:', error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <PortalLayout>
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </PortalLayout>
      </ProtectedRoute>
    );
  }

  if (error || !subject) {
    return (
      <ProtectedRoute requiredRole="student">
        <PortalLayout>
          <div className="text-center py-20">
            <p className="text-red-600">{error || 'Course not found'}</p>
            <Link href="/portal/student/subjects" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Courses
            </Link>
          </div>
        </PortalLayout>
      </ProtectedRoute>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: Target },
    { id: 'grades', label: 'Grades', icon: Award },
  ];

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'link': return LinkIcon;
      case 'assignment': return Target;
      default: return FileText;
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout>
        <div className="space-y-6 mt-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/portal/student/subjects"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Courses
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: timing.slow, ease: easing.smooth }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold">{subject.subjectCode}</h1>
                    <p className="text-blue-100">{subject.subjectName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Users className="h-5 w-5 mb-2" />
                    <div className="text-sm opacity-80">Instructor</div>
                    <div className="font-semibold">{subject.facultyName || 'TBA'}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Clock className="h-5 w-5 mb-2" />
                    <div className="text-sm opacity-80">Schedule</div>
                    <div className="font-semibold">{subject.schedule || 'TBA'}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <MapPin className="h-5 w-5 mb-2" />
                    <div className="text-sm opacity-80">Room</div>
                    <div className="font-semibold">{subject.room || 'TBA'}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Award className="h-5 w-5 mb-2" />
                    <div className="text-sm opacity-80">Units</div>
                    <div className="font-semibold">{subject.units}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold">92%</div>
                  <div className="text-sm opacity-80 mt-1">Attendance</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold">A-</div>
                  <div className="text-sm opacity-80 mt-1">Current Grade</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2"
          >
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: timing.normal }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {subject.description || 'No description available for this course.'}
                    </p>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[
                        { type: 'material', title: 'New lecture notes uploaded', time: '2 hours ago' },
                        { type: 'assignment', title: 'Assignment 3 due soon', time: '1 day ago' },
                        { type: 'grade', title: 'Quiz 2 graded', time: '3 days ago' },
                      ].map((activity, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{activity.title}</div>
                            <div className="text-sm text-gray-500">{activity.time}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Course Progress</span>
                          <span className="font-semibold text-blue-600">75%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1, ease: easing.smooth }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Assignments</span>
                          <span className="font-semibold text-green-600">8/10</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '80%' }}
                            transition={{ duration: 1, ease: easing.smooth }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">Midterm Exam</div>
                          <div className="text-sm text-gray-500">March 15, 2024</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">Project Submission</div>
                          <div className="text-sm text-gray-500">March 20, 2024</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h3>
                {materials.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">No materials available yet</p>
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    {materials.map((material) => {
                      const Icon = getMaterialIcon(material.materialType);
                      return (
                        <motion.div
                          key={material.id}
                          variants={staggerItem}
                          whileHover={{
                            scale: 1.01,
                            x: 4,
                            boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                          }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{material.title}</h4>
                              {material.description && (
                                <p className="text-sm text-gray-600">{material.description}</p>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(material.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {material.filePath && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(material.id, material.fileName || 'file')}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Download className="h-5 w-5" />
                            </motion.button>
                          )}
                          {material.externalUrl && (
                            <motion.a
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              href={material.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </motion.a>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Assignments</h3>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No assignments available yet</p>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Grades</h3>
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No grades available yet</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}
