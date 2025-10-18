'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  category: string;
}

interface UpcomingEventsSectionProps {
  events?: Event[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Midterm Examinations',
    date: new Date(2024, 10, 20),
    time: '8:00 AM',
    location: 'Various Rooms',
    category: 'Academic',
  },
  {
    id: '2',
    title: 'Tech Innovation Summit',
    date: new Date(2024, 10, 25),
    time: '2:00 PM',
    location: 'Auditorium',
    category: 'Event',
  },
  {
    id: '3',
    title: 'Career Fair 2025',
    date: new Date(2024, 10, 28),
    time: '9:00 AM',
    location: 'Gymnasium',
    category: 'Career',
  },
];

export function UpcomingEventsSection({ events = mockEvents }: UpcomingEventsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedEvents = showAll ? events : events.slice(0, 2);
  const hasMore = events.length > 2;

  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
        </div>
        <Link
          href="/portal/student/events"
          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
        >
          See all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Compact Events List */}
      <div className="divide-y divide-gray-100">
        {displayedEvents.map((event, index) => (
          <Link
            key={event.id}
            href="/portal/student/events"
            className="block"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * index }}
              className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Date Box */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-medium uppercase">{formatDate(event.date).month}</span>
                  <span className="text-lg font-bold leading-none">{formatDate(event.date).day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title and Category */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {event.title}
                    </h4>
                    <span className="text-xs text-purple-600 font-medium flex-shrink-0">
                      {event.category}
                    </span>
                  </div>

                  {/* Time and Location */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showAll ? 'Show less' : `Show ${events.length - 2} more`}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
