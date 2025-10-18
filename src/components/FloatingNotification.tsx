'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, Announcement } from '@/lib/api';

interface FloatingNotificationProps {
  userRole?: string;
  autoShowInterval?: number; // in milliseconds
}

export function FloatingNotification({ 
  userRole = 'student',
  autoShowInterval = 10000 // 10 seconds default
}: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastClosedTime, setLastClosedTime] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<number[]>([]);

  // Load read announcements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readAnnouncements');
    if (stored) {
      try {
        setReadAnnouncementIds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse read announcements:', e);
      }
    }
  }, []);

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await announcementsApi.getAnnouncements({ limit: 5 });
      if (response.success) {
        setAnnouncements(response.data.announcements);
        
        // Check if there are any unread announcements
        const hasUnread = response.data.announcements.some(
          (ann: Announcement) => !readAnnouncementIds.includes(ann.id)
        );
        
        // Only show notification if there are unread announcements
        setIsVisible(hasUnread);
      }
    } catch (error: any) {
      // Silently fail if not authenticated (401) - this is expected on initial load
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch announcements:', error);
      }
      // Don't show notification if there's an error
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    const allIds = announcements.map(ann => ann.id);
    const updatedReadIds = [...new Set([...readAnnouncementIds, ...allIds])];
    setReadAnnouncementIds(updatedReadIds);
    localStorage.setItem('readAnnouncements', JSON.stringify(updatedReadIds));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const unreadAnnouncements = announcements.filter(a => !readAnnouncementIds.includes(a.id));
  const unreadCount = unreadAnnouncements.length;

  useEffect(() => {
    if (!isVisible && lastClosedTime) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsExpanded(false);
      }, autoShowInterval);

      return () => clearTimeout(timer);
    }
  }, [isVisible, lastClosedTime, autoShowInterval]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
    setIsVisible(false);
    setIsExpanded(false);
    setLastClosedTime(Date.now());
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed top-24 sm:top-28 right-4 z-[60]"
        >
          <motion.div
            animate={{ 
              width: isExpanded ? '384px' : '280px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden"
          >
            {/* Header - Clickable */}
            <motion.div
              onClick={handleToggle}
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              className="relative p-4 cursor-pointer border-b border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Animated Bell Icon */}
                  <motion.div
                    animate={{ 
                      rotate: isExpanded ? 0 : [0, -15, 15, -15, 15, 0],
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: isExpanded ? 0 : Infinity,
                      repeatDelay: 3
                    }}
                    className="relative"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    {unreadCount > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span className="text-white text-xs font-bold">{unreadCount}</span>
                      </motion.div>
                    )}
                  </motion.div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    aria-label="Close notification"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-8 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-sm text-gray-500 mt-3">Loading...</p>
                      </div>
                    ) : announcements.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {announcements.map((announcement, index) => {
                          const isUnread = !readAnnouncementIds.includes(announcement.id);
                          const isUrgent = announcement.priority === 'urgent' || announcement.priority === 'high';
                          return (
                            <motion.div
                              key={announcement.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-4 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                                isUnread ? 'bg-blue-50/30' : 'bg-gray-50/30'
                              }`}
                            >
                              <Link href={`/portal/${userRole}/announcements`} onClick={() => markAllAsRead()}>
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    isUnread ? (isUrgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500') : 'bg-gray-300'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className={`text-sm font-medium truncate ${
                                        isUnread ? 'text-gray-900' : 'text-gray-600'
                                      }`}>
                                        {announcement.title}
                                      </h4>
                                      {isUnread && isUrgent && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                          {announcement.priority.toUpperCase()}
                                        </span>
                                      )}
                                      {isUnread && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                          NEW
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-xs mt-1 line-clamp-2 ${
                                      isUnread ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                      {announcement.content}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <p className="text-xs text-gray-400">
                                        {getTimeAgo(announcement.createdAt)}
                                      </p>
                                      {announcement.category && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                          {announcement.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No announcements yet</p>
                      </div>
                    )}
                  </div>

                  {/* View All Link */}
                  {announcements.length > 0 && (
                    <Link
                      href={`/portal/${userRole}/announcements`}
                      className="block p-3 text-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border-t border-gray-100"
                    >
                      View all announcements
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar - only show when collapsed */}
            {!isExpanded && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: autoShowInterval / 1000, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 origin-left"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
