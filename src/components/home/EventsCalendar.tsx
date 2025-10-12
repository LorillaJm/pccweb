'use client';

import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ChevronRight } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: 'Annual Awards Ceremony 2024',
    date: 'December 20, 2024',
    time: '2:00 PM - 5:00 PM',
    location: 'PCC Auditorium',
    attendees: 500,
    category: 'Ceremony',
    color: 'bg-purple-500'
  },
  {
    id: 2,
    title: 'Career Fair & Job Expo',
    date: 'January 15, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Main Campus Grounds',
    attendees: 1000,
    category: 'Career',
    color: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'Research Symposium',
    date: 'January 25, 2025',
    time: '8:00 AM - 5:00 PM',
    location: 'Conference Hall',
    attendees: 300,
    category: 'Academic',
    color: 'bg-green-500'
  },
  {
    id: 4,
    title: 'Sports Festival 2025',
    date: 'February 10, 2025',
    time: 'All Day',
    location: 'Sports Complex',
    attendees: 800,
    category: 'Sports',
    color: 'bg-orange-500'
  }
];

export function EventsCalendar() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-semibold text-sm">UPCOMING EVENTS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Events Calendar
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for exciting events, seminars, and activities throughout the year
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {upcomingEvents.map((event) => (
            <div 
              key={event.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="flex">
                {/* Date Badge */}
                <div className={`${event.color} text-white p-6 flex flex-col items-center justify-center min-w-[120px]`}>
                  <div className="text-3xl font-bold">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-sm font-semibold uppercase">
                    {new Date(event.date).toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="text-xs opacity-90">
                    {new Date(event.date).getFullYear()}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6">
                  <div className="mb-2">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {event.attendees} Expected Attendees
                    </div>
                  </div>
                  <Link 
                    href={`/events/${event.id}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 mt-4 group-hover:translate-x-1 transition-transform"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/events" 
            className="inline-flex items-center bg-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <Calendar className="mr-2 h-5 w-5" />
            View Full Calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
