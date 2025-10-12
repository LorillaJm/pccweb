'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Clock, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Facility {
  id: string;
  name: string;
  type: 'library' | 'laboratory' | 'classroom' | 'office' | 'gym' | 'cafeteria';
  location: string;
  capacity?: number;
  currentOccupancy: number;
  isActive: boolean;
  accessRequirements: {
    role: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
  };
  emergencyOverride: boolean;
  lastAccess?: string;
  totalAccessToday: number;
  deniedAccessToday: number;
}

interface AccessStats {
  totalAccess: number;
  successfulAccess: number;
  deniedAccess: number;
  uniqueUsers: number;
  peakHour: string;
  mostAccessedFacility: string;
}

interface FacilityManagementDashboardProps {
  facilities: Facility[];
  accessStats: AccessStats;
  onCreateFacility: () => void;
  onEditFacility: (facilityId: string) => void;
  onDeleteFacility: (facilityId: string) => void;
  onToggleFacility: (facilityId: string, isActive: boolean) => void;
  onEmergencyOverride: (facilityId: string, override: boolean) => void;
  onRefresh: () => void;
  className?: string;
}

export default function FacilityManagementDashboard({
  facilities,
  accessStats,
  onCreateFacility,
  onEditFacility,
  onDeleteFacility,
  onToggleFacility,
  onEmergencyOverride,
  onRefresh,
  className
}: FacilityManagementDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);

  // Filter facilities based on search and filters
  useEffect(() => {
    let filtered = [...facilities];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchLower) ||
        facility.location.toLowerCase().includes(searchLower) ||
        facility.type.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(facility => facility.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(facility => facility.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(facility => !facility.isActive);
      } else if (filterStatus === 'emergency') {
        filtered = filtered.filter(facility => facility.emergencyOverride);
      }
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchTerm, filterType, filterStatus]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const getFacilityTypeIcon = (type: string) => {
    switch (type) {
      case 'library': return '📚';
      case 'laboratory': return '🔬';
      case 'classroom': return '🏫';
      case 'office': return '🏢';
      case 'gym': return '🏋️';
      case 'cafeteria': return '🍽️';
      default: return '🏢';
    }
  };

  const getFacilityTypeColor = (type: string) => {
    switch (type) {
      case 'library': return 'bg-blue-100 text-blue-800';
      case 'laboratory': return 'bg-purple-100 text-purple-800';
      case 'classroom': return 'bg-green-100 text-green-800';
      case 'office': return 'bg-gray-100 text-gray-800';
      case 'gym': return 'bg-orange-100 text-orange-800';
      case 'cafeteria': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (current: number, capacity?: number) => {
    if (!capacity) return 'text-gray-600';
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const facilityTypes = Array.from(new Set(facilities.map(f => f.type)));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Access Today</p>
                <p className="text-2xl font-bold">{accessStats.totalAccess}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful Access</p>
                <p className="text-2xl font-bold text-green-600">{accessStats.successfulAccess}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Denied Access</p>
                <p className="text-2xl font-bold text-red-600">{accessStats.deniedAccess}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Facilities</p>
                <p className="text-2xl font-bold">{facilities.filter(f => f.isActive).length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Facility Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredFacilities.length} of {facilities.length} facilities
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCreateFacility} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Facility
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="emergency">Emergency Override</option>
            </select>

            {/* Export Button */}
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
              <p className="text-gray-600">
                {facilities.length === 0 
                  ? "No facilities have been added yet."
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <Card key={facility.id} className="relative">
                  <CardContent className="p-4">
                    {/* Emergency Override Indicator */}
                    {facility.emergencyOverride && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      </div>
                    )}

                    {/* Facility Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">{getFacilityTypeIcon(facility.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{facility.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{facility.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getFacilityTypeColor(facility.type)}>
                            {facility.type}
                          </Badge>
                          <Badge className={facility.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {facility.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Info */}
                    {facility.capacity && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Occupancy</span>
                          <span className={getOccupancyColor(facility.currentOccupancy, facility.capacity)}>
                            {facility.currentOccupancy}/{facility.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              facility.currentOccupancy / facility.capacity >= 0.9 ? "bg-red-500" :
                              facility.currentOccupancy / facility.capacity >= 0.7 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${Math.min((facility.currentOccupancy / facility.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Access Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Access Today:</span>
                        <p className="font-medium text-green-600">{facility.totalAccessToday}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Denied Today:</span>
                        <p className="font-medium text-red-600">{facility.deniedAccessToday}</p>
                      </div>
                    </div>

                    {/* Last Access */}
                    {facility.lastAccess && (
                      <div className="text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Last access: {new Date(facility.lastAccess).toLocaleString()}
                      </div>
                    )}

                    {/* Access Requirements */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Access Roles:</p>
                      <div className="flex flex-wrap gap-1">
                        {facility.accessRequirements.role.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditFacility(facility.id)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleFacility(facility.id, !facility.isActive)}
                        className={cn(
                          "flex-1",
                          facility.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                        )}
                      >
                        {facility.isActive ? (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEmergencyOverride(facility.id, !facility.emergencyOverride)}
                        className={cn(
                          facility.emergencyOverride ? "text-red-600 hover:text-red-700" : "text-orange-600 hover:text-orange-700"
                        )}
                      >
                        <Shield className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}