'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Clock, DollarSign, Users, Building2, Filter, Search } from 'lucide-react';

// Types based on the design document
interface Internship {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    industry: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  duration: number; // in weeks
  stipend: number;
  location: string;
  workArrangement: 'onsite' | 'remote' | 'hybrid';
  slots: number;
  filledSlots: number;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'closed' | 'completed';
  targetPrograms: string[];
  yearLevelRequirement: number;
  createdAt: string;
}

interface FilterOptions {
  search: string;
  industry: string;
  workArrangement: string;
  minStipend: string;
  maxDuration: string;
  program: string;
}

interface InternshipBoardProps {
  internships: Internship[];
  filters: FilterOptions;
  onApply: (internshipId: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
  userProgram?: string;
  userYearLevel?: number;
}

const InternshipBoard: React.FC<InternshipBoardProps> = ({
  internships,
  filters,
  onApply,
  onFilterChange,
  loading = false,
  userProgram,
  userYearLevel
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Filter internships based on current filters
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = !filters.search || 
      internship.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      internship.companyId.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      internship.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesIndustry = !filters.industry || internship.companyId.industry === filters.industry;
    
    const matchesWorkArrangement = !filters.workArrangement || internship.workArrangement === filters.workArrangement;
    
    const matchesStipend = !filters.minStipend || internship.stipend >= parseInt(filters.minStipend);
    
    const matchesDuration = !filters.maxDuration || internship.duration <= parseInt(filters.maxDuration);
    
    const matchesProgram = !filters.program || internship.targetPrograms.includes(filters.program);

    return matchesSearch && matchesIndustry && matchesWorkArrangement && 
           matchesStipend && matchesDuration && matchesProgram;
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const getWorkArrangementColor = (arrangement: string) => {
    switch (arrangement) {
      case 'remote': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-blue-100 text-blue-800';
      case 'onsite': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isEligible = (internship: Internship) => {
    if (!userYearLevel || !userProgram) return true;
    
    const meetsYearLevel = userYearLevel >= internship.yearLevelRequirement;
    const meetsProgram = internship.targetPrograms.length === 0 || 
                        internship.targetPrograms.includes(userProgram);
    
    return meetsYearLevel && meetsProgram;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStipend = (amount: number) => {
    if (amount === 0) return 'Unpaid';
    return `₱${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internship Opportunities</h1>
          <p className="text-gray-600 mt-1">
            Discover and apply for internship positions from our partner companies
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
            placeholder="Search internships, companies, or keywords..."
            value={filters.search}
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
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={filters.industry} onValueChange={(value) => handleFilterChange('industry', value)}>
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
                  <Label htmlFor="workArrangement">Work Arrangement</Label>
                  <Select value={filters.workArrangement} onValueChange={(value) => handleFilterChange('workArrangement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Arrangements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Arrangements</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStipend">Minimum Stipend (₱)</Label>
                  <Input
                    id="minStipend"
                    type="number"
                    placeholder="0"
                    value={filters.minStipend}
                    onChange={(e) => handleFilterChange('minStipend', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max Duration (weeks)</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    placeholder="Any"
                    value={filters.maxDuration}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select value={filters.program} onValueChange={(value) => handleFilterChange('program', value)}>
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredInternships.length} of {internships.length} internships
        </p>
        {(filters.search || filters.industry || filters.workArrangement || filters.minStipend || filters.maxDuration || filters.program) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({
              search: '',
              industry: '',
              workArrangement: '',
              minStipend: '',
              maxDuration: '',
              program: ''
            })}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Internship Cards */}
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
      ) : filteredInternships.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => {
            const eligible = isEligible(internship);
            const slotsAvailable = internship.slots - internship.filledSlots;
            const isDeadlinePassed = new Date(internship.applicationDeadline) < new Date();
            
            return (
              <Card key={internship._id} className={`transition-all hover:shadow-lg ${!eligible ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{internship.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-4 w-4" />
                        {internship.companyId.name}
                        {internship.companyId.verificationStatus === 'verified' && (
                          <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getWorkArrangementColor(internship.workArrangement)}>
                      {internship.workArrangement}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {internship.companyId.industry}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {internship.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{internship.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{internship.duration} weeks</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatStipend(internship.stipend)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{slotsAvailable} of {internship.slots} slots available</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Apply by {formatDate(internship.applicationDeadline)}</span>
                    </div>
                  </div>

                  {internship.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {internship.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{internship.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {!eligible && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Eligibility:</strong> Requires year {internship.yearLevelRequirement}+ 
                        {internship.targetPrograms.length > 0 && ` in ${internship.targetPrograms.join(', ')}`}
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => onApply(internship._id)}
                    disabled={!eligible || slotsAvailable === 0 || isDeadlinePassed || internship.status !== 'published'}
                    className="w-full"
                    variant={eligible && slotsAvailable > 0 && !isDeadlinePassed ? 'default' : 'secondary'}
                  >
                    {!eligible ? 'Not Eligible' :
                     slotsAvailable === 0 ? 'No Slots Available' :
                     isDeadlinePassed ? 'Deadline Passed' :
                     internship.status !== 'published' ? 'Not Available' :
                     'Apply Now'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InternshipBoard;