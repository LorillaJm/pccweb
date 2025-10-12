'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, Filter, MapPin, Briefcase, DollarSign, 
  Calendar, Clock, Building2, Users, Eye
} from 'lucide-react';
import { JobPosting, JobFilters, JobBoardProps } from './types';

const JobBoard: React.FC<JobBoardProps> = ({
  jobs,
  onApply,
  onFilterChange,
  filters,
  userType,
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesWorkType = !filters.workType || job.workType === filters.workType;
    
    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesAudience = !filters.targetAudience || 
      job.targetAudience === filters.targetAudience || 
      job.targetAudience === 'both';
    
    const matchesSalary = !filters.minSalary || 
      (job.salaryRange && job.salaryRange.min >= parseInt(filters.minSalary));

    return matchesSearch && matchesWorkType && matchesLocation && 
           matchesAudience && matchesSalary && job.status === 'active';
  });

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'full_time': return 'bg-blue-100 text-blue-800';
      case 'part_time': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatWorkType = (workType: string) => {
    return workType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatSalary = (salaryRange?: { min: number; max: number; currency: string }) => {
    if (!salaryRange) return 'Salary not disclosed';
    const { min, max, currency } = salaryRange;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600 mt-1">
            Discover career opportunities from alumni and partner companies
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
            placeholder="Search jobs by title, company, or keywords..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workType">Work Type</Label>
                  <Select value={filters.workType} onValueChange={(value) => handleFilterChange('workType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City or Remote"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={filters.targetAudience} onValueChange={(value) => handleFilterChange('targetAudience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minSalary">Min Salary (₱)</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="0"
                    value={filters.minSalary}
                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} job postings
        </p>
        {(filters.search || filters.workType || filters.location || 
          filters.targetAudience || filters.minSalary) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({
              search: '',
              workType: '',
              location: '',
              targetAudience: '',
              minSalary: ''
            })}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const deadlinePassed = isDeadlinePassed(job.applicationDeadline);
            
            return (
              <Card key={job._id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getWorkTypeColor(job.workType)}>
                      {formatWorkType(job.workType)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {job.targetAudience === 'both' ? 'Students & Alumni' : 
                       job.targetAudience.charAt(0).toUpperCase() + job.targetAudience.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job.salaryRange)}</span>
                    </div>
                    
                    {job.applicationDeadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Apply by {formatDate(job.applicationDeadline)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{job.viewCount} views • {job.applicationCount} applications</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {job.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Posted By */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Posted by {job.posterId.firstName} {job.posterId.lastName} 
                    {job.posterType === 'alumni' && ' (Alumni)'}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => onApply(job._id)}
                    disabled={deadlinePassed}
                    className="w-full"
                    variant={deadlinePassed ? 'secondary' : 'default'}
                  >
                    {deadlinePassed ? 'Application Closed' : 'Apply Now'}
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

export default JobBoard;
