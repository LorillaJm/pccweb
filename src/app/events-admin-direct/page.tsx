'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function EventsAdminDirectPage() {
  const { user, isLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      fetchEvents();
    }
  }, [isLoading]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events-test');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p>Please log in to access this page.</p>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-green-800 font-medium">Direct Events Admin Page (No Layout)</h2>
          <p className="text-green-600 text-sm">
            This page bypasses the admin layout to test if the issue is in the layout component.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Events Management (Direct)</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Authentication Status</h3>
          <div className="space-y-2 text-sm">
            <p><strong>User:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Test Events</h3>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event: any, index) => (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {event.venue} • {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No events found</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.location.href = '/admin/events'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try /admin/events (With Layout)
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}