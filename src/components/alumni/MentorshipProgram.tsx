'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  GraduationCap, Briefcase, Award, Users, 
  MessageCircle, CheckCircle, Clock, Star
} from 'lucide-react';
import { MentorProfile, Mentorship, MentorshipProgramProps } from './types';

const MentorshipProgram: React.FC<MentorshipProgramProps> = ({
  mentors,
  onRequestMentorship,
  userMentorships = [],
  loading = false
}) => {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter mentors based on search
  const filteredMentors = mentors.filter(mentor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      `${mentor.userId.firstName} ${mentor.userId.lastName}`.toLowerCase().includes(searchLower) ||
      mentor.currentPosition?.toLowerCase().includes(searchLower) ||
      mentor.currentCompany?.toLowerCase().includes(searchLower) ||
      mentor.industry?.toLowerCase().includes(searchLower) ||
      mentor.expertise.some(exp => exp.toLowerCase().includes(searchLower))
    );
  });

  // Check if user already has a mentorship with this mentor
  const hasMentorshipWith = (mentorId: string) => {
    return userMentorships.some(
      m => m.mentorId._id === mentorId && 
      (m.status === 'requested' || m.status === 'active')
    );
  };

  const handleRequestMentorship = (mentorId: string) => {
    if (!requestMessage.trim()) {
      alert('Please provide a message explaining why you want this mentorship.');
      return;
    }
    
    onRequestMentorship(mentorId, requestMessage);
    setSelectedMentor(null);
    setRequestMessage('');
  };

  const getMentorshipStatusBadge = (mentorId: string) => {
    const mentorship = userMentorships.find(
      m => m.mentorId._id === mentorId
    );
    
    if (!mentorship) return null;
    
    switch (mentorship.status) {
      case 'requested':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mentorship Program</h1>
        <p className="text-gray-600 mt-1">
          Connect with experienced alumni mentors to guide your career journey
        </p>
      </div>

      {/* Active Mentorships Summary */}
      {userMentorships.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Mentorships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userMentorships.filter(m => m.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {userMentorships.filter(m => m.status === 'requested').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userMentorships.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search mentors by name, expertise, industry, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4"
        />
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredMentors.length} available mentors
        </p>
      </div>

      {/* Mentor Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">
              Try adjusting your search or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => {
            const hasRequest = hasMentorshipWith(mentor._id);
            const isAvailable = mentor.isAvailable && mentor.currentMentees < mentor.maxMentees;
            const statusBadge = getMentorshipStatusBadge(mentor._id);
            
            return (
              <Card key={mentor._id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                      {mentor.userId.firstName[0]}{mentor.userId.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {mentor.userId.firstName} {mentor.userId.lastName}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Class of {mentor.graduationYear}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {statusBadge && (
                    <div className="mt-2">{statusBadge}</div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Position */}
                  {mentor.currentPosition && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Briefcase className="h-4 w-4" />
                        <span>{mentor.currentPosition}</span>
                      </div>
                      {mentor.currentCompany && (
                        <p className="text-sm text-gray-600 ml-6">{mentor.currentCompany}</p>
                      )}
                    </div>
                  )}

                  {/* Education */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{mentor.degree}</span>
                  </div>

                  {/* Industry */}
                  {mentor.industry && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{mentor.industry}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Expertise */}
                  {mentor.expertise.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Areas of Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((exp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.expertise.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mentee Level Preference */}
                  {mentor.preferredMenteeLevel.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>Preferred mentee level:</strong> {mentor.preferredMenteeLevel.join(', ')}
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mentees:</span>
                    <span className="font-medium">
                      {mentor.currentMentees} / {mentor.maxMentees}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  {isAvailable ? (
                    <Badge className="bg-green-100 text-green-800 w-full justify-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Not Available
                    </Badge>
                  )}

                  {/* Achievements */}
                  {mentor.achievements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Notable Achievements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {mentor.achievements.slice(0, 2).map((achievement, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex-col gap-3">
                  {selectedMentor === mentor._id ? (
                    <div className="w-full space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="message">Why do you want this mentorship?</Label>
                        <Textarea
                          id="message"
                          placeholder="Explain your goals and what you hope to learn..."
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRequestMentorship(mentor._id)}
                          className="flex-1"
                        >
                          Send Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMentor(null);
                            setRequestMessage('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setSelectedMentor(mentor._id)}
                      disabled={!isAvailable || hasRequest}
                      className="w-full"
                      variant={isAvailable && !hasRequest ? 'default' : 'secondary'}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {hasRequest ? 'Request Sent' : 
                       !isAvailable ? 'Not Available' : 
                       'Request Mentorship'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorshipProgram;
