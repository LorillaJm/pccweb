'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  category: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  registeredCount?: number;
  isPublic?: boolean;
}

interface Ticket {
  _id: string;
  eventId: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketNumber: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      // Backend returns: { success: true, data: { events: [...], pagination: {...} } }
      const eventsData = response.data.data?.events || response.data.events || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events');
      setEvents([]); // Ensure events is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // For admin, we need to fetch tickets for all events
      // Since there's no general /tickets endpoint, we'll fetch tickets for each event
      if (events.length === 0) {
        setTickets([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      const allTickets: Ticket[] = [];
      for (const event of events) {
        try {
          const response = await api.get(`/tickets/event/${event._id}`);
          const eventTickets = response.data.data?.tickets || response.data.tickets || [];
          if (Array.isArray(eventTickets)) {
            allTickets.push(...eventTickets);
          }
        } catch (err) {
          console.warn(`Failed to fetch tickets for event ${event._id}:`, err);
          // Continue with other events
        }
      }
      
      setTickets(allTickets);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      // Map frontend form data to backend Event model schema
      const startDate = new Date(eventData.date);
      const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
      
      const mappedEventData = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category.toLowerCase(), // Backend expects lowercase enum values
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        venue: eventData.location, // Map 'location' to 'venue'
        capacity: eventData.capacity,
        registrationDeadline: eventData.registrationDeadline,
        status: 'published', // Set status to published by default
        isPublic: true // Set as public by default
        // Note: 'price' field doesn't exist in backend model, removing it
      };

      console.log('Creating event with data:', mappedEventData);
      const response = await api.post('/events', mappedEventData);
      console.log('Event created successfully:', response.data);
      setShowCreateModal(false);
      fetchEvents();
    } catch (err: any) {
      console.error('Event creation error:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create event';
      const errorDetails = err.response?.data?.details ? ` (${err.response.data.details})` : '';
      throw new Error(errorMsg + errorDetails);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const CreateEventModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 100,
      category: '',
      registrationDeadline: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setFormError(null);
        await handleCreateEvent(formData);
      } catch (err: any) {
        setFormError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="event-description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="event-description"
                  required
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">Event Date</label>
                  <input
                    id="event-date"
                    type="datetime-local"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="registration-deadline" className="block text-sm font-medium text-gray-700">Registration Deadline</label>
                  <input
                    id="registration-deadline"
                    type="datetime-local"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    id="event-location"
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="event-category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="event-category"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="social">Social</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="event-capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  id="event-capacity"
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Tickets Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage events and view ticket registrations
          </p>
        </div>
        {activeTab === 'events' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({Array.isArray(events) ? events.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tickets ({Array.isArray(tickets) ? tickets.length : 0})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        ) : activeTab === 'events' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(events) && events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Category: {event.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(event.startDate).toLocaleDateString()} at{' '}
                        {new Date(event.startDate).toLocaleTimeString()}
                      </div>
                      <div className="text-sm text-gray-500">{event.venue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.registeredCount || 0} / {event.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' :
                        event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!Array.isArray(events) || events.length === 0) && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(tickets) && tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        QR: {ticket.qrCode?.substring(0, 20)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.eventId?.title || 'Unknown Event'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.userId?.firstName} {ticket.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{ticket.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!Array.isArray(tickets) || tickets.length === 0) && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
                <p className="mt-1 text-sm text-gray-500">Tickets will appear here when users register for events.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreateEventModal />}
    </div>
  );
}