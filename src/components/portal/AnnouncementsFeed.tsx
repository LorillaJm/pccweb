'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Announcement } from '@/lib/api';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
  isLoading?: boolean;
}

export function AnnouncementsFeed({ announcements, isLoading }: AnnouncementsFeedProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredAnnouncements =
    filter === 'all'
      ? announcements
      : announcements.filter((a) => a.category === filter || a.priority === filter);

  const displayedAnnouncements = showAll ? filteredAnnouncements : filteredAnnouncements.slice(0, 2);
  const hasMore = filteredAnnouncements.length > 2;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Announcements</h3>
        </div>
        <Link
          href="/portal/student/announcements"
          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
        >
          See all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Compact Filter Pills */}
      <div className="px-4 py-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {['all', 'urgent', 'academic', 'event'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Compact Announcements List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto" />
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <>
            {displayedAnnouncements.map((announcement, index) => (
              <Link
                key={announcement.id}
                href="/portal/student/announcements"
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Dot */}
                    <div className="flex-shrink-0 mt-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          announcement.priority === 'urgent'
                            ? 'bg-red-500'
                            : announcement.priority === 'high'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title and Category */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {announcement.title}
                        </h4>
                        {announcement.category && (
                          <span className="text-xs text-gray-500 capitalize flex-shrink-0">
                            {announcement.category}
                          </span>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                        {announcement.content}
                      </p>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeAgo(announcement.createdAt)}</span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* Show More Button */}
            {hasMore && !showAll && (
              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Show {filteredAnnouncements.length - 2} more
                </button>
              </div>
            )}

            {/* Show Less Button */}
            {showAll && hasMore && (
              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAll(false)}
                  className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Show less
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500">No announcements</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
