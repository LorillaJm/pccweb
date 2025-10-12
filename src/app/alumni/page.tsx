'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeroMorph from '@/components/animations/HeroMorph';
import PageTransition from '@/components/animations/PageTransition';
import { 
  Users, Briefcase, GraduationCap, MapPin, Building2, Calendar,
  Search, ChevronRight, Star, Award, TrendingUp, Mail, Linkedin,
  X, Check, UserCheck, Plus, ExternalLink, Clock, DollarSign
} from 'lucide-react';

interface AlumniProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  graduation_year: number;
  program: string;
  current_company?: string;
  current_position?: string;
  industry?: string;
  location?: string;
  years_experience?: number;
  is_mentor_available: boolean;
  linkedin_url?: string;
  bio?: string;
}

interface JobPosting {
  id: number;
  company_name: string;
  job_title: string;
  job_description: string;
  requirements: string[];
  skills_required: string[];
  experience_level: string;
  employment_type: string;
  salary_range?: string;
  location: string;
  application_deadline?: string;
  external_url?: string;
  contact_email?: string;
  posted_by_name: string;
  created_at: string;
  is_featured: boolean;
}

export default function AlumniPage() {
  const { user, token } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [mentors, setMentors] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'jobs' | 'mentorship'>('directory');
  const [filters, setFilters] = useState({
    graduation_year: '',
    industry: '',
    location: '',
    search: '',
    experience_level: '',
    employment_type: ''
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobData, setJobData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    requirements: '',
    skills_required: '',
    experience_level: 'entry',
    employment_type: 'full-time',
    salary_range: '',
    location: '',
    application_deadline: '',
    external_url: '',
    contact_email: ''
  });

  useEffect(() => {
    fetchAlumni();
    fetchJobs();
    fetchMentors();
  }, [filters]);

  const fetchAlumni = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && ['graduation_year', 'industry', 'location', 'search'].includes(key)) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/advanced/alumni?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && ['experience_level', 'employment_type', 'location', 'search'].includes(key)) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/advanced/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/advanced/mentorship', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const createJobPosting = async () => {
    try {
      const response = await fetch('/api/advanced/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...jobData,
          requirements: jobData.requirements.split('\n').filter(r => r.trim()),
          skills_required: jobData.skills_required.split(',').map(s => s.trim()).filter(s => s)
        })
      });

      if (response.ok) {
        alert('Job posting created successfully!');
        setShowJobModal(false);
        setJobData({
          company_name: '', job_title: '', job_description: '', requirements: '',
          skills_required: '', experience_level: 'entry', employment_type: 'full-time',
          salary_range: '', location: '', application_deadline: '', external_url: '', contact_email: ''
        });
        fetchJobs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create job posting');
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('Failed to create job posting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      'entry': 'bg-green-50 text-green-700 border-green-200',
      'mid': 'bg-blue-50 text-blue-700 border-blue-200',
      'senior': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-blue-50 text-blue-700 border-blue-200',
      'part-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'contract': 'bg-amber-50 text-amber-700 border-amber-200',
      'remote': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'reviewing': 'bg-blue-50 text-blue-700 border-blue-200',
      'accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPositionTypeColor = (type: string) => {
    const colors = {
      'internship': 'bg-blue-50 text-blue-700 border-blue-200',
      'ojt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'practicum': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const filteredAlumni = alumni.filter(a => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return a.first_name.toLowerCase().includes(searchLower) ||
             a.last_name.toLowerCase().includes(searchLower) ||
             a.current_company?.toLowerCase().includes(searchLower) ||
             a.current_position?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const filteredJobs = jobs.filter(job => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return job.job_title.toLowerCase().includes(searchLower) ||
             job.company_name.toLowerCase().includes(searchLower) ||
             job.job_description.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading alumni portal...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">

        {/* Hero Section with Morph */}
        <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
          <div className="absolute inset-0 z-0">
            <HeroMorph 
              className="absolute inset-0"
              colors={['#8B5CF6', '#6366F1', '#EC4899', '#06B6D4']}
              intensity={0.25}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-50/60 to-indigo-100/40" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full text-purple-700 font-medium text-sm mb-6 shadow-lg"
              >
                <GraduationCap className="w-4 h-4" />
                Alumni Network & Career Hub
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Alumni Portal
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Connect with fellow alumni, explore career opportunities, and give back through mentorship.
                Together, we build a stronger community.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {[
                  { number: alumni.length, label: 'Alumni Members', icon: Users },
                  { number: jobs.length, label: 'Job Opportunities', icon: Briefcase },
                  { number: mentors.length, label: 'Active Mentors', icon: UserCheck },
                  { number: '98%', label: 'Success Rate', icon: TrendingUp },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Modern Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50 inline-flex">
              {[
                { id: 'directory', label: 'Alumni Directory', icon: Users },
                { id: 'jobs', label: 'Job Board', icon: Briefcase },
                { id: 'mentorship', label: 'Mentorship', icon: UserCheck }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabAlumni"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="Search positions, companies..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <select
                value={filters.graduation_year}
                onChange={(e) => setFilters({...filters, graduation_year: e.target.value})}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">All Years</option>
                {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </motion.div>

          {/* Alumni Directory Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'directory' && (
              <motion.div
                key="directory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredAlumni.map((alumnus, index) => (
                  <motion.div
                    key={alumnus.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg"
                        >
                          {alumnus.first_name[0]}{alumnus.last_name[0]}
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {alumnus.first_name} {alumnus.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                          <GraduationCap className="w-4 h-4" />
                          Class of {alumnus.graduation_year}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        {alumnus.current_company && (
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                            {alumnus.current_company}
                          </div>
                        )}
                        {alumnus.current_position && (
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                            {alumnus.current_position}
                          </div>
                        )}
                        {alumnus.industry && (
                          <div className="flex items-center text-gray-600">
                            <Award className="w-4 h-4 mr-2 text-purple-500" />
                            {alumnus.industry}
                          </div>
                        )}
                        {alumnus.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                            {alumnus.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {alumnus.is_mentor_available && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Mentor
                          </span>
                        )}
                        {alumnus.linkedin_url && (
                          <a
                            href={alumnus.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.company_name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {company.company_name}
                            </h3>
                            <p className="text-sm text-gray-600">{company.industry}</p>
                          </div>
                        </div>
                        {company.is_verified && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {company.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{company.active_positions}</span> positions
                        </div>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            Visit
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && user?.role === 'student' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {applications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {application.logo_url ? (
                          <img
                            src={application.logo_url}
                            alt={application.company_name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{application.title}</h3>
                          <p className="text-gray-600">{application.company_name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Applied on {formatDate(application.application_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPositionTypeColor(application.position_type)}`}>
                          {application.position_type.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {applications.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50"
                  >
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">Start applying for internship positions to see them here.</p>
                    <motion.button
                      onClick={() => setActiveTab('positions')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Browse Positions
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>
    </PageTransition>
  );
}
