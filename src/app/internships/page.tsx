'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeroMorph from '@/components/animations/HeroMorph';
import PageTransition from '@/components/animations/PageTransition';
import { 
  Briefcase, Building2, MapPin, Clock, Users, Calendar, 
  Search, Filter, ChevronRight, Star, Award, TrendingUp,
  FileText, Upload, X, Check, AlertCircle, ExternalLink
} from 'lucide-react';

interface Company {
  id: number;
  company_name: string;
  industry: string;
  description: string;
  website?: string;
  logo_url?: string;
  is_verified: boolean;
  active_positions: number;
}

interface InternshipPosition {
  id: number;
  company_id: number;
  title: string;
  description: string;
  requirements: string[];
  skills_required: string[];
  position_type: string;
  duration_months: number;
  location: string;
  slots_available: number;
  slots_filled: number;
  available_slots: number;
  application_deadline?: string;
  company_name: string;
  industry: string;
  logo_url?: string;
}

interface Application {
  id: number;
  position_id: number;
  status: string;
  application_date: string;
  title: string;
  position_type: string;
  company_name: string;
  logo_url?: string;
}

export default function InternshipsPage() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [positions, setPositions] = useState<InternshipPosition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'companies' | 'applications'>('positions');
  const [filters, setFilters] = useState({
    position_type: '',
    location: '',
    industry: '',
    search: ''
  });
  const [selectedPosition, setSelectedPosition] = useState<InternshipPosition | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null as File | null,
    portfolio: null as File | null
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchPositions();
    if (user?.role === 'student') {
      fetchApplications();
    }
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.industry) params.append('industry', filters.industry);
      params.append('verified', 'true');

      const response = await fetch(`/api/advanced/companies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.position_type) params.append('position_type', filters.position_type);
      if (filters.location) params.append('location', filters.location);

      const response = await fetch(`/api/advanced/internships?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/advanced/internships/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = (position: InternshipPosition) => {
    setSelectedPosition(position);
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    if (!selectedPosition) return;

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }
      if (applicationData.portfolio) {
        formData.append('portfolio', applicationData.portfolio);
      }

      const response = await fetch(`/api/advanced/internships/${selectedPosition.id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: '', resume: null, portfolio: null });
        fetchApplications();
        fetchPositions();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const filteredPositions = positions.filter(pos => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return pos.title.toLowerCase().includes(searchLower) ||
             pos.company_name.toLowerCase().includes(searchLower) ||
             pos.description.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading opportunities...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

        {/* Hero Section with Morph */}
        <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
          <div className="absolute inset-0 z-0">
            <HeroMorph 
              className="absolute inset-0"
              colors={['#3B82F6', '#6366F1', '#8B5CF6', '#06B6D4']}
              intensity={0.25}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-100/40" />
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-6 shadow-lg"
              >
                <Briefcase className="w-4 h-4" />
                Career Opportunities Portal
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                OJT & Internships
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Discover meaningful opportunities with leading companies. 
                Build your career, gain real-world experience, and shape your future.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {[
                  { number: positions.length, label: 'Open Positions', icon: Briefcase },
                  { number: companies.length, label: 'Partner Companies', icon: Building2 },
                  { number: applications.length, label: 'Your Applications', icon: FileText },
                  { number: '95%', label: 'Success Rate', icon: TrendingUp },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
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
                { id: 'positions', label: 'Available Positions', icon: Briefcase },
                { id: 'companies', label: 'Partner Companies', icon: Building2 },
                ...(user?.role === 'student' ? [{ id: 'applications', label: `My Applications (${applications.length})`, icon: FileText }] : [])
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
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
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
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <select
                value={filters.position_type}
                onChange={(e) => setFilters({...filters, position_type: e.target.value})}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Types</option>
                <option value="internship">Internship</option>
                <option value="ojt">OJT</option>
                <option value="practicum">Practicum</option>
              </select>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </motion.div>

          {/* Positions Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'positions' && (
              <motion.div
                key="positions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {position.logo_url ? (
                            <img
                              src={position.logo_url}
                              alt={position.company_name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {position.title}
                            </h3>
                            <p className="text-sm text-gray-600">{position.company_name}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPositionTypeColor(position.position_type)}`}>
                          {position.position_type.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {position.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          {position.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          {position.duration_months} months
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-blue-500" />
                          {position.available_slots} / {position.slots_available} slots
                        </div>
                        {position.application_deadline && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            Deadline: {formatDate(position.application_deadline)}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {position.skills_required.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                              {skill}
                            </span>
                          ))}
                          {position.skills_required.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                              +{position.skills_required.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {user?.role === 'student' && (
                        <motion.button
                          onClick={() => handleApply(position)}
                          disabled={position.available_slots === 0}
                          whileHover={{ scale: position.available_slots > 0 ? 1.02 : 1 }}
                          whileTap={{ scale: position.available_slots > 0 ? 0.98 : 1 }}
                          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                            position.available_slots === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                          }`}
                        >
                          {position.available_slots === 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              No Slots Available
                            </>
                          ) : (
                            <>
                              Apply Now
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Companies Tab */}
            {activeTab === 'companies' && (
              <motion.div
                key="companies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {companies.map((company, index) => (
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

        {/* Application Modal */}
        <AnimatePresence>
          {showApplicationModal && selectedPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowApplicationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
                      <p className="text-gray-600 mt-1">{selectedPosition.title}</p>
                    </div>
                    <motion.button
                      onClick={() => setShowApplicationModal(false)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us why you're interested in this position..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Resume (PDF, DOC, DOCX)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setApplicationData({...applicationData, resume: e.target.files?.[0] || null})}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {applicationData.resume ? applicationData.resume.name : 'Click to upload resume'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Portfolio (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setApplicationData({...applicationData, portfolio: e.target.files?.[0] || null})}
                        className="hidden"
                        id="portfolio-upload"
                      />
                      <label
                        htmlFor="portfolio-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {applicationData.portfolio ? applicationData.portfolio.name : 'Click to upload portfolio'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      onClick={() => setShowApplicationModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={submitApplication}
                      disabled={!applicationData.coverLetter.trim() || applying}
                      whileHover={{ scale: !applicationData.coverLetter.trim() || applying ? 1 : 1.02 }}
                      whileTap={{ scale: !applicationData.coverLetter.trim() || applying ? 1 : 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
