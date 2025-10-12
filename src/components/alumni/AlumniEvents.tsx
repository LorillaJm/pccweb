'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { AlumniEvent, AlumniEventsProps } from './types';

const AlumniEvents: React.FC<AlumniEventsProps> = ({
  events,
  onRegister,
  loading = false,
  userType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState<AlumniEvent[]>(events);

  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Audience filter
    if (audienceFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.targetAudience === audienceFilter || event.targetAudience === 'both'
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, categoryFilter, audienceFilter]);

  const getCategoryColor = (category: string) => {
    const colors = {
      networking: 'bg-blue-100 text-blue-800',
      reunion: 'bg-purple-100 text-purple-800',
      career: 'bg-green-100 text-green-800',
      seminar: 'bg-orange-100 text-orange-800',
      workshop: 'bg-indigo-100 text-indigo-800',
      social: 'bg-pink-100 text-pink-800',
      fundraising: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'alumni':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Alumni Only</Badge>;
      case 'students':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Students Only</Badge>;
      case 'both':
        return <Badge variant="outline" className="text-green-600 border-green-600">Open to All</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (event: AlumniEvent) => {
    if (!event.isRegistrationOpen) {
      return <Badge variant="secondary">Registration Closed</Badge>;
    }
    if (event.isFull) {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (event.status === 'ongoing') {
      return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alumni Events</h1>
        <p className="text-gray-600 mt-1">
          Stay connected through networking events, reunions, and professional development opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="reunion">Reunion</SelectItem>
            <SelectItem value="career">Career Development</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="fundraising">Fundraising</SelectItem>
          </SelectContent>
        </Select>

        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="alumni">Alumni Only</SelectItem>
            <SelectItem value="students">Students Only</SelectItem>
            <SelectItem value="both">Open to All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || audienceFilter !== 'all'
                    ? 'Try adjusting your filters to see more events.'
                    : 'There are no alumni events available at the moment.'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                  <div className="flex flex-col gap-1 items-end">
                    {getStatusBadge(event)}
                    {getAudienceBadge(event.targetAudience)}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
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
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
                    onClick={() => onRegister(event._id)}
                    disabled={!event.isRegistrationOpen || event.isFull}
                    className="w-full"
                    variant={event.isRegistrationOpen && !event.isFull ? "default" : "secondary"}
                  >
                    {!event.isRegistrationOpen
                      ? 'Registration Closed'
                      : event.isFull
                      ? 'Event Full'
                      : 'Register Now'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AlumniEvents;
