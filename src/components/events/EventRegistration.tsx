'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  organizer: {
    firstName: string;
    lastName: string;
  };
  status: string;
  isPublic: boolean;
  availableSlots: number;
  isFull: boolean;
  isRegistrationOpen: boolean;
  requirements?: string[];
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  position?: string;
  specialRequests?: string;
  dietaryRestrictions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface EventRegistrationProps {
  event: Event;
  onSubmit: (registrationData: RegistrationData) => void;
  loading?: boolean;
  error?: string;
  onCancel?: () => void;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  event,
  onSubmit,
  loading = false,
  error,
  onCancel
}) => {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    specialRequests: '',
    dietaryRestrictions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [dietaryInput, setDietaryInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const addDietaryRestriction = () => {
    if (dietaryInput.trim() && !formData.dietaryRestrictions.includes(dietaryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, dietaryInput.trim()]
      }));
      setDietaryInput('');
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge className={getCategoryColor(event.category)}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
            <Badge variant={event.isRegistrationOpen ? "default" : "secondary"}>
              {event.isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <span>{event.venue}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.registeredCount} / {event.capacity} registered</span>
            </div>
          </div>

          {/* Capacity Warning */}
          {event.availableSlots <= 10 && event.availableSlots > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only {event.availableSlots} spots remaining! Register soon to secure your place.
              </AlertDescription>
            </Alert>
          )}

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Requirements:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {event.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Information</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={formErrors.firstName ? 'border-red-500' : ''}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={formErrors.phone ? 'border-red-500' : ''}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Position/Title</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    placeholder="e.g., Parent, Spouse, Friend"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={dietaryInput}
                      onChange={(e) => setDietaryInput(e.target.value)}
                      placeholder="Enter dietary restriction"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDietaryRestriction())}
                    />
                    <Button type="button" onClick={addDietaryRestriction} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.dietaryRestrictions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryRestrictions.map((restriction, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeDietaryRestriction(restriction)}
                        >
                          {restriction} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests or Comments</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special accommodations or requests..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading || !event.isRegistrationOpen}
                className="flex-1"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegistration;