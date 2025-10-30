'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { subjectsApi, ClassSection } from '@/lib/api';
import { BookOpen, Clock, Users, MapPin, Award, Filter, Search, Grid3x3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseCard } from '@/components/portal/CourseCard';
import { staggerContainer, staggerItem, timing, easing } from '@/lib/animations';

type TabType = 'ongoing' | 'completed' | 'archived';
type ViewType = 'grid' | 'list';

export default function SubjectsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [subjects, setSubjects] = useState<ClassSection[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<ClassSection[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and view state
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchSubjects();
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, activeTab, searchQuery, selectedSemester, selectedDepartment]);

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const response = await subjectsApi.getEnrolledSubjects();
      
      if (response.success) {
        setSubjects(response.data.enrolledSubjects);
      }
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...subjects];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(subject =>
        subject.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.facultyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by semester
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(subject => subject.semester === selectedSemester);
    }

    // Filter by department (extracted from subject code)
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(subject =>
        subject.subjectCode.startsWith(selectedDepartment)
      );
    }

    // Filter by tab (for now, all are ongoing - you can add status field later)
    // This is a placeholder for future implementation
    if (activeTab === 'completed') {
      filtered = []; // No completed courses yet
    } else if (activeTab === 'archived') {
      filtered = []; // No archived courses yet
    }

    setFilteredSubjects(filtered);
  };

  const departments = Array.from(new Set(subjects.map(s => s.subjectCode.substring(0, 2))));
  const semesters = Array.from(new Set(subjects.map(s => s.semester))).sort();

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'ongoing', label: 'Ongoing', count: subjects.length },
    { id: 'completed', label: 'Completed', count: 0 },
    { id: 'archived', label: 'Archived', count: 0 },
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout>
        <div className="space-y-6 mt-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: timing.slow, ease: easing.smooth }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center"
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </motion.div>
                My Classes
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your enrolled courses and track your progress
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </motion.button>
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
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses, instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Semester Filter */}
              <div>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Semesters</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          {isLoadingSubjects ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="mt-4 text-gray-600">Loading your courses...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
            >
              <p className="text-red-600">{error}</p>
            </motion.div>
          ) : filteredSubjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: easing.smooth }}
              >
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedSemester !== 'all' || selectedDepartment !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You are not enrolled in any courses yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className={
                viewType === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredSubjects.map((subject, index) => (
                  <CourseCard
                    key={subject.sectionId}
                    subject={subject}
                    viewType={viewType}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}
