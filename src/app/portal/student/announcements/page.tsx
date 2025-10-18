'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { announcementsApi, Announcement } from '@/lib/api';
import {
  Bell,
  Calendar,
  Clock,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  Sparkles,
  User
} from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, selectedCategory, selectedPriority]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await announcementsApi.getAnnouncements({ limit: 50 });
      if (response.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = [...announcements];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ann) =>
          ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((ann) => ann.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter((ann) => ann.priority === selectedPriority);
    }

    setFilteredAnnouncements(filtered);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'from-red-500 to-rose-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: AlertCircle,
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'from-orange-500 to-amber-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: TrendingUp,
          label: 'High Priority'
        };
      case 'normal':
        return {
          color: 'from-blue-500 to-indigo-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: Info,
          label: 'Normal'
        };
      default:
        return {
          color: 'from-gray-500 to-slate-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: CheckCircle,
          label: 'Low Priority'
        };
    }
  };

  const categories = ['all', 'academic', 'events', 'administrative', 'general'];
  const priorities = ['all', 'urgent', 'high', 'normal', 'low'];

  return (
    <ProtectedRoute requiredRole="student">
      <PortalLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
                >
                  <Bell className="h-8 w-8" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold">Announcements</h1>
                  <p className="text-blue-100 mt-1">Stay updated with the latest news</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">{filteredAnnouncements.length} Total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    {filteredAnnouncements.filter((a) => a.priority === 'urgent').length} Urgent
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {priorities.map((priority) => (
                          <motion.button
                            key={priority}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedPriority(priority)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              selectedPriority === priority
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Announcements List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAnnouncements.map((announcement, index) => {
                const priorityConfig = getPriorityConfig(announcement.priority);
                const PriorityIcon = priorityConfig.icon;

                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-blue-200 overflow-hidden group"
                  >
                    {/* Priority Indicator Bar */}
                    <div className={`h-2 bg-gradient-to-r ${priorityConfig.color}`} />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className={`p-2 ${priorityConfig.bg} rounded-xl`}
                            >
                              <PriorityIcon className={`h-5 w-5 ${priorityConfig.text}`} />
                            </motion.div>
                            <span
                              className={`px-3 py-1 ${priorityConfig.bg} ${priorityConfig.text} rounded-full text-xs font-bold uppercase tracking-wide`}
                            >
                              {priorityConfig.label}
                            </span>
                            {announcement.category && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold capitalize">
                                {announcement.category}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {announcement.title}
                          </h3>

                          <p className="text-gray-600 line-clamp-2 leading-relaxed">
                            {announcement.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                              {announcement.firstName} {announcement.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(announcement.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-blue-600 font-semibold text-sm flex items-center space-x-1"
                        >
                          <span>Read more</span>
                          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <Bell className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back later for updates'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Announcement Detail Modal */}
        <AnimatePresence>
          {selectedAnnouncement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div
                  className={`bg-gradient-to-r ${
                    getPriorityConfig(selectedAnnouncement.priority).color
                  } p-6 text-white relative`}
                >
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedAnnouncement(null)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>

                  <div className="flex items-center space-x-3 mb-3">
                    {React.createElement(
                      getPriorityConfig(selectedAnnouncement.priority).icon,
                      { className: 'h-8 w-8' }
                    )}
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold uppercase">
                      {getPriorityConfig(selectedAnnouncement.priority).label}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2">{selectedAnnouncement.title}</h2>

                  <div className="flex items-center space-x-4 text-sm text-white/90">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedAnnouncement.firstName} {selectedAnnouncement.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.content}
                    </p>
                  </div>

                  {selectedAnnouncement.category && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold capitalize">
                        Category: {selectedAnnouncement.category}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PortalLayout>
    </ProtectedRoute>
  );
}
