'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Demo data - simulates what would come from the database
const demoEvents = [
  {
    _id: '1',
    title: 'Annual Science Fair 2024',
    description: 'Showcase of innovative student projects and research presentations from all departments.',
    category: 'academic',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    venue: 'Main Auditorium',
    capacity: 200,
    registeredCount: 45,
    organizer: { firstName: 'Dr. Maria', lastName: 'Santos' },
    status: 'published',
    isPublic: true,
    availableSlots: 155,
    isFull: false,
    isRegistrationOpen: true
  },
  {
    _id: '2',
    title: 'Cultural Night: Filipino Heritage',
    description: 'Celebrate Filipino culture through traditional dances, music, and food.',
    category: 'cultural',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    venue: 'College Gymnasium',
    capacity: 300,
    registeredCount: 180,
    organizer: { firstName: 'Prof. Juan', lastName: 'Cruz' },
    status: 'published',
    isPublic: true,
    availableSlots: 120,
    isFull: false,
    isRegistrationOpen: true
  },
  {
    _id: '3',
    title: 'Basketball Championship Finals',
    description: 'Inter-department basketball championship final match.',
    category: 'sports',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    venue: 'Sports Complex',
    capacity: 500,
    registeredCount: 450,
    organizer: { firstName: 'Coach', lastName: 'Rodriguez' },
    status: 'published',
    isPublic: true,
    availableSlots: 50,
    isFull: false,
    isRegistrationOpen: true
  }
];

const demoTickets = [
  {
    id: '1',
    eventTitle: 'Annual Science Fair 2024',
    ticketNumber: 'SF2024001',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    status: 'confirmed',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    venue: 'Main Auditorium'
  }
];

export default function EventsDemoPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const handleRegister = (eventId: string) => {
    setRegisteredEvents([...registeredEvents, eventId]);
    alert('Successfully registered for event! Check the "My Tickets" tab to see your ticket.');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      seminar: 'bg-orange-100 text-orange-800',
      workshop: 'bg-indigo-100 text-indigo-800',
      conference: 'bg-red-100 text-red-800',
      social: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-blue-800 font-medium">Events System Demo</h3>
                <p className="text-blue-600 text-sm">
                  This is a demonstration of how the Events & Tickets system works. 
                  In production, this would connect to your database.
                </p>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Events & Tickets Demo</h1>
          <p className="text-gray-600 mt-2">Experience the full events system functionality</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
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
                Available Events ({demoEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Tickets ({registeredEvents.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Open
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.registeredCount} / {event.capacity} registered</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%`
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    Organized by {event.organizer.firstName} {event.organizer.lastName}
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleRegister(event._id)}
                      disabled={registeredEvents.includes(event._id)}
                      className="w-full"
                      variant={registeredEvents.includes(event._id) ? "secondary" : "default"}
                    >
                      {registeredEvents.includes(event._id) ? 'Registered ✓' : 'Register Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {registeredEvents.map((eventId, index) => {
              const event = demoEvents.find(e => e._id === eventId);
              if (!event) return null;
              
              return (
                <Card key={eventId} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600">{format(new Date(event.startDate), 'PPP p')}</p>
                      <p className="text-gray-600">{event.venue}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Confirmed
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Code</p>
                      <p className="font-mono text-lg font-semibold">EVT{eventId}00{index + 1}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">QR Code</p>
                      <div className="w-24 h-24 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                        <div className="text-xs text-gray-500 text-center">
                          QR Code<br/>Generated
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Present this QR code at the event entrance for admission.
                      Screenshots are acceptable.
                    </p>
                  </div>
                </Card>
              );
            })}

            {registeredEvents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
                <p className="text-gray-600 mb-4">
                  Register for events in the "Available Events" tab to see your tickets here.
                </p>
                <Button onClick={() => setActiveTab('events')}>
                  Browse Events
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How This Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Students:</h4>
              <ul className="space-y-1">
                <li>• Browse available events</li>
                <li>• Click "Register Now" to register</li>
                <li>• Get instant digital ticket with QR code</li>
                <li>• Present QR code at event entrance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Administrators:</h4>
              <ul className="space-y-1">
                <li>• Create events through /admin/events</li>
                <li>• Set capacity and manage registrations</li>
                <li>• Scan QR codes for attendance</li>
                <li>• View analytics and reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}