'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeroMorph from '@/components/animations/HeroMorph';
import PageTransition from '@/components/animations/PageTransition';
import { 
  Calendar, Ticket, MapPin, Users, Clock, Star, 
  TrendingUp, Award, CheckCircle
} from 'lucide-react';

interface Event {
  _id: string;
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  event_date?: string;
  venue: string;
  category: string;
  event_type?: string;
  capacity: number;
  max_attendees?: number;
  registeredCount: number;
  current_attendees?: number;
  availableSlots?: number;
  available_slots?: number;
  organizer: {
    firstName: string;
    lastName: string;
  };
  organizer_name?: string;
  registrationDeadline?: string;
  registration_start?: string;
  registration_end?: string;
  status: string;
  isPublic: boolean;
  is_free?: boolean;
  ticket_price?: number;
}

interface EventTicket {
  id: number;
  event_id: number;
  ticket_code: string;
  qr_code_url: string;
  status: string;
  title: string;
  event_date: string;
  venue: string;
  event_type: string;
}

export default function EventsPage() {
  const { token } = useAuth();
  
  // Temporary: Don't require authentication for viewing events
  // const { token } = { token: null };
  const [events, setEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [selectedType, setSelectedType] = useState<string>('');
  const [registering, setRegistering] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchMyTickets();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      params.append('upcoming', 'true');

      // Try multiple API endpoints
      let response = await fetch(`/api/events?${params}`);
      
      if (!response.ok) {
        // Fallback to old API
        response = await fetch(`/api/advanced/events?${params}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Events API response:', data);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data.data && data.data.events && Array.isArray(data.data.events)) {
          setEvents(data.data.events);
        } else if (data.data && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          console.warn('Unexpected events response format:', data);
          setEvents([]);
        }
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      // First get the current user to get their ID
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        console.log('Not logged in, cannot fetch tickets');
        setMyTickets([]);
        return;
      }
      
      const userData = await userResponse.json();
      const userId = userData.data?.user?.id || userData.data?.user?._id;
      
      if (!userId) {
        console.log('Could not get user ID');
        setMyTickets([]);
        return;
      }
      
      // Now fetch tickets for this user
      const response = await fetch(`/api/tickets/user/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        const ticketsData = data.data?.tickets || data.tickets || data.data || [];
        setMyTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        console.log('Failed to fetch tickets:', response.status);
        setMyTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setMyTickets([]);
    }
  };

  const registerForEvent = async (eventId: number | string) => {
    setRegistering(typeof eventId === 'number' ? eventId : parseInt(eventId));
    
    // Prompt for basic registration info
    const firstName = prompt('Enter your first name:');
    if (!firstName) {
      setRegistering(null);
      return;
    }
    
    const lastName = prompt('Enter your last name:');
    if (!lastName) {
      setRegistering(null);
      return;
    }
    
    const email = prompt('Enter your email:');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      setRegistering(null);
      return;
    }
    
    const phone = prompt('Enter your phone number (optional):') || '';
    
    try {
      // Use the new events API endpoint
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use session-based auth
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          specialRequests: '',
          dietaryRestrictions: []
        })
      });

      console.log('Registration request sent to:', `/api/events/${eventId}/register`);
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response body (raw):', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        data = { error: 'Invalid response from server', raw: responseText };
      }
      
      console.log('Registration response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });

      if (response.ok) {
        alert('Successfully registered for event! Check "My Tickets" tab to view your ticket.');
        fetchEvents();
        fetchMyTickets();
      } else {
        // More detailed error message
        const errorMsg = data.message || data.error || response.statusText || `Failed to register (${response.status})`;
        console.error('Registration failed:', { status: response.status, errorMsg, data });
        
        if (response.status === 401) {
          alert('Please log in to register for events. Redirecting to login page...');
          window.location.href = '/auth/login';
        } else if (response.status === 409) {
          alert('You are already registered for this event.');
        } else if (response.status === 429) {
          alert('Too many registration attempts. Please wait a moment and try again.');
        } else if (response.status === 500) {
          alert('Server error: ' + errorMsg + '. Please try again later.');
        } else {
          alert('Registration failed: ' + errorMsg);
        }
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Network error: Failed to register for event. Please check your connection.');
    } finally {
      setRegistering(null);
    }
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

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20">
        
        {/* Hero Section with Floating Tickets */}
        <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
          <div className="absolute inset-0 z-0">
            <HeroMorph 
              className="absolute inset-0"
              colors={['#F59E0B', '#F97316', '#EF4444', '#EC4899']}
              intensity={0.25}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-amber-50/60 to-orange-100/40" />

            {/* Floating Event Tickets - Interactive Background */}
            <div className="absolute inset-0 overflow-visible hidden lg:block">
              {/* Ticket 1 - Top Left */}
              <motion.div
                className="absolute top-20 left-12 w-72 h-40 opacity-40"
                animate={{
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                  rotate: [-6, -3, -6],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Ticket className="w-6 h-6 text-white/80" />
                      <Calendar className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">EVENT TICKET</div>
                    <div className="text-white font-bold text-base mb-1">Annual Festival 2024</div>
                    <div className="text-white/80 text-xs">December 15, 2024</div>
                    <div className="text-white/60 text-xs">PCC Gymnasium</div>
                  </div>
                </div>
              </motion.div>

              {/* Ticket 2 - Top Right */}
              <motion.div
                className="absolute top-24 right-12 w-72 h-40 opacity-40"
                animate={{
                  y: [0, 35, 0],
                  x: [0, -20, 0],
                  rotate: [6, 9, 6],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-6 h-6 text-white/80" />
                      <Award className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">VIP PASS</div>
                    <div className="text-white font-bold text-base mb-1">Graduation Ceremony</div>
                    <div className="text-white/80 text-xs">March 20, 2025</div>
                    <div className="text-white/60 text-xs">Main Auditorium</div>
                  </div>
                </div>
              </motion.div>

              {/* Ticket 3 - Bottom Left */}
              <motion.div
                className="absolute bottom-20 left-16 w-72 h-40 opacity-40"
                animate={{
                  y: [0, -28, 0],
                  x: [0, 18, 0],
                  rotate: [-5, -8, -5],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-6 h-6 text-white/80" />
                      <CheckCircle className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">GENERAL ADMISSION</div>
                    <div className="text-white font-bold text-base mb-1">Sports Festival</div>
                    <div className="text-white/80 text-xs">February 10-14, 2025</div>
                    <div className="text-white/60 text-xs">Campus Grounds</div>
                  </div>
                </div>
              </motion.div>

              {/* Ticket 4 - Bottom Right */}
              <motion.div
                className="absolute bottom-24 right-16 w-72 h-40 opacity-40"
                animate={{
                  y: [0, 32, 0],
                  x: [0, -18, 0],
                  rotate: [5, 7, 5],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mb-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <MapPin className="w-6 h-6 text-white/80" />
                      <TrendingUp className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">WORKSHOP PASS</div>
                    <div className="text-white font-bold text-base mb-1">Career Fair 2025</div>
                    <div className="text-white/80 text-xs">January 25, 2025</div>
                    <div className="text-white/60 text-xs">Conference Hall</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Icons */}
              {[
                { Icon: Calendar, x: '8%', y: '50%', delay: 0 },
                { Icon: Ticket, x: '92%', y: '55%', delay: 1 },
                { Icon: Star, x: '5%', y: '75%', delay: 2 },
                { Icon: Award, x: '95%', y: '80%', delay: 1.5 },
              ].map(({ Icon, x, y, delay }, index) => (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{ left: x, top: y }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, index % 2 === 0 ? 10 : -10, 0],
                    rotate: [0, 360],
                    opacity: [0.05, 0.2, 0.05],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 12 + index * 2,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-10 h-10 text-amber-600/30" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full text-amber-700 font-medium text-sm mb-6 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Campus Events & Activities
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent"
              >
                Events & Tickets
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Discover and register for exciting college events. 
                From festivals to workshops, never miss out on campus activities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {[
                  { number: events.length, label: 'Available Events', icon: Calendar },
                  { number: myTickets.length, label: 'Your Tickets', icon: Ticket },
                  { number: '50+', label: 'Events/Year', icon: TrendingUp },
                  { number: '100%', label: 'Free Entry', icon: CheckCircle },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
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

        {/* Modern Tabs with Morphing Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50 inline-flex">
            {[
              { id: 'events', label: 'Available Events', icon: Calendar },
              { id: 'tickets', label: `My Tickets (${myTickets.length})`, icon: Ticket }
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
                    layoutId="activeTabEvents"
                    className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {activeTab === 'events' && (
          <>
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
              {Array.isArray(events) && events.map((event) => {
                const eventId = event._id || event.id;
                const eventType = event.category || event.event_type || 'general';
                const eventDate = event.startDate || event.event_date;
                const maxAttendees = event.capacity || event.max_attendees || 0;
                const currentAttendees = event.registeredCount || event.current_attendees || 0;
                const availableSlots = event.availableSlots || event.available_slots || (maxAttendees - currentAttendees);
                const organizerName = event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : event.organizer_name || 'Unknown';
                
                return (
                  <div key={eventId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(eventType)}`}>
                          {eventType}
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
                          {formatDate(eventDate)}
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
                          {availableSlots} / {maxAttendees} slots available
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Organized by {organizerName}
                        </div>
                      </div>

                      {event.is_free !== undefined && (
                        event.is_free ? (
                          <div className="text-green-600 font-medium mb-4">Free Event</div>
                        ) : (
                          <div className="text-gray-900 font-medium mb-4">
                            ₱{event.ticket_price?.toFixed(2)}
                          </div>
                        )
                      )}

                      <button
                        onClick={() => registerForEvent(eventId)}
                        disabled={availableSlots === 0 || registering === (typeof eventId === 'string' ? parseInt(eventId) : eventId)}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          availableSlots === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : registering === (typeof eventId === 'string' ? parseInt(eventId) : eventId)
                            ? 'bg-blue-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {registering === (typeof eventId === 'string' ? parseInt(eventId) : eventId)
                          ? 'Registering...'
                          : availableSlots === 0
                          ? 'Fully Booked'
                          : 'Register Now'
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {events.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
                <p className="text-gray-600">Check back later for upcoming events.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {myTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-gray-600">{formatDate(ticket.event_date)}</p>
                    <p className="text-gray-600">{ticket.venue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(ticket.event_type)}`}>
                      {ticket.event_type}
                    </span>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Code</p>
                    <p className="font-mono text-lg font-semibold">{ticket.ticket_code}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">QR Code</p>
                    {ticket.qr_code_url && (
                      <img
                        src={ticket.qr_code_url}
                        alt="QR Code"
                        className="w-24 h-24 border border-gray-300 rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Present this QR code at the event entrance for admission.
                    Screenshots are acceptable.
                  </p>
                </div>
              </div>
            ))}

            {myTickets.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
                <p className="text-gray-600">Register for events to see your tickets here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
