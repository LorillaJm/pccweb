'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  event_type: string;
  max_attendees: number;
  current_attendees: number;
  available_slots: number;
  organizer_name: string;
  registration_start?: string;
  registration_end?: string;
  is_free: boolean;
  ticket_price?: number;
}

export default function EventsPublicPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [selectedType, setSelectedType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      params.append('upcoming', 'true');

      // Try the new events API first, then fall back to old API
      let response = await fetch(`/api/events?${params}`);
      
      if (!response.ok) {
        // Fallback to old API
        response = await fetch(`/api/advanced/events?${params}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (eventId: number) => {
    alert('Registration requires login. Please log in first to register for events.');
    window.location.href = '/auth/login';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'academic': 'bg-blue-100 text-blue-800',
      'cultural': 'bg-purple-100 text-purple-800',
      'sports': 'bg-green-100 text-green-800',
      'social': 'bg-yellow-100 text-yellow-800',
      'seminar': 'bg-indigo-100 text-indigo-800',
      'workshop': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-800 font-medium">Public Events Page</h3>
                <p className="text-blue-600 text-sm">
                  Browse events without authentication. Login required for registration.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Login to Register
                </button>
                <button
                  onClick={() => window.location.href = '/events'}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                >
                  Try /events
                </button>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Events & Tickets</h1>
          <p className="text-gray-600 mt-2">Discover and register for college events</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error Loading Events</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              This might be because:
            </p>
            <ul className="text-red-600 text-sm mt-1 ml-4 list-disc">
              <li>MongoDB database is not running</li>
              <li>Backend server is not connected to database</li>
              <li>Events API endpoints are not properly configured</li>
            </ul>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="social">Social</option>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.available_slots} / {event.max_attendees} slots available
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Organized by {event.organizer_name}
                  </div>
                </div>

                {event.is_free ? (
                  <div className="text-green-600 font-medium mb-4">Free Event</div>
                ) : (
                  <div className="text-gray-900 font-medium mb-4">
                    ₱{event.ticket_price?.toFixed(2)}
                  </div>
                )}

                <button
                  onClick={() => handleRegister(event.id)}
                  className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login to Register
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">Check back later for upcoming events.</p>
          </div>
        )}
      </div>
    </div>
  );
}