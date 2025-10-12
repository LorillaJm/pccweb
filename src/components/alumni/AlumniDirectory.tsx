'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, Filter, MapPin, Briefcase, GraduationCap, 
  Calendar, Award, Linkedin, Facebook, Twitter, Globe,
  Mail, MessageCircle, Users
} from 'lucide-react';
import { AlumniProfile, AlumniFilters, AlumniDirectoryProps } from './types';

const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({
  alumni,
  searchFilters,
  onConnect,
  onFilterChange,
  loading = false,
  currentUserId
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Filter alumni based on current filters
  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = !searchFilters.search || 
      `${alumnus.userId.firstName} ${alumnus.userId.lastName}`.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      alumnus.currentCompany?.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      alumnus.currentPosition?.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      alumnus.industry?.toLowerCase().includes(searchFilters.search.toLowerCase());

    const matchesYear = !searchFilters.graduationYear || 
      alumnus.graduationYear.toString() === searchFilters.graduationYear;
    
    const matchesDegree = !searchFilters.degree || 
      alumnus.degree === searchFilters.degree;
    
    const matchesIndustry = !searchFilters.industry || 
      alumnus.industry === searchFilters.industry;
    
    const matchesLocation = !searchFilters.location || 
      alumnus.location?.toLowerCase().includes(searchFilters.location.toLowerCase());
    
    const matchesMentorship = !searchFilters.mentorshipAvailable || 
      alumnus.mentorshipAvailability.isAvailable;

    return matchesSearch && matchesYear && matchesDegree && 
           matchesIndustry && matchesLocation && matchesMentorship;
  });

  const handleFilterChange = (key: keyof AlumniFilters, value: string | boolean) => {
    onFilterChange({
      ...searchFilters,
      [key]: value
    });
  };

  const formatGraduationYear = (year: number) => {
    return `Class of ${year}`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
          <p className="text-gray-600 mt-1">
            Connect with fellow graduates and expand your professional network
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, company, position, or industry..."
            value={searchFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Select 
                    value={searchFilters.graduationYear} 
                    onValueChange={(value) => handleFilterChange('graduationYear', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree Program</Label>
                  <Select 
                    value={searchFilters.degree} 
                    onValueChange={(value) => handleFilterChange('degree', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Programs</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={searchFilters.industry} 
                    onValueChange={(value) => handleFilterChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City or Country"
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchFilters.mentorshipAvailable}
                      onChange={(e) => handleFilterChange('mentorshipAvailable', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Available for Mentorship</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAlumni.length} of {alumni.length} alumni
        </p>
        {(searchFilters.search || searchFilters.graduationYear || searchFilters.degree || 
          searchFilters.industry || searchFilters.location || searchFilters.mentorshipAvailable) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({
              search: '',
              graduationYear: '',
              degree: '',
              industry: '',
              location: '',
              mentorshipAvailable: false
            })}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Alumni Cards */}
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
      ) : filteredAlumni.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => {
            const isCurrentUser = currentUserId === alumnus.userId._id;
            
            return (
              <Card key={alumnus._id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {alumnus.userId.firstName[0]}{alumnus.userId.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {alumnus.userId.firstName} {alumnus.userId.lastName}
                        {alumnus.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {formatGraduationYear(alumnus.graduationYear)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Position */}
                  {alumnus.currentPosition && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Briefcase className="h-4 w-4" />
                        <span>{alumnus.currentPosition}</span>
                      </div>
                      {alumnus.currentCompany && (
                        <p className="text-sm text-gray-600 ml-6">{alumnus.currentCompany}</p>
                      )}
                    </div>
                  )}

                  {/* Education */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{alumnus.degree}{alumnus.major && ` - ${alumnus.major}`}</span>
                  </div>

                  {/* Industry */}
                  {alumnus.industry && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{alumnus.industry}</span>
                    </div>
                  )}

                  {/* Location */}
                  {alumnus.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{alumnus.location}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {alumnus.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {alumnus.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {alumnus.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {alumnus.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {alumnus.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{alumnus.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Badge */}
                  {alumnus.mentorshipAvailability.isAvailable && (
                    <Badge className="bg-green-100 text-green-800">
                      Available for Mentorship
                    </Badge>
                  )}

                  {/* Social Links */}
                  {(alumnus.socialLinks.linkedin || alumnus.socialLinks.facebook || 
                    alumnus.socialLinks.twitter || alumnus.socialLinks.website) && (
                    <div className="flex gap-2 pt-2">
                      {alumnus.socialLinks.linkedin && (
                        <a 
                          href={alumnus.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {alumnus.socialLinks.facebook && (
                        <a 
                          href={alumnus.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {alumnus.socialLinks.twitter && (
                        <a 
                          href={alumnus.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {alumnus.socialLinks.website && (
                        <a 
                          href={alumnus.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {!isCurrentUser && alumnus.privacySettings.allowDirectMessages && (
                    <Button
                      onClick={() => onConnect(alumnus._id)}
                      className="flex-1"
                      variant="default"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {!isCurrentUser && alumnus.privacySettings.showContactInfo && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `mailto:${alumnus.userId.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                  {isCurrentUser && (
                    <Button variant="outline" className="w-full" disabled>
                      Your Profile
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

export default AlumniDirectory;
