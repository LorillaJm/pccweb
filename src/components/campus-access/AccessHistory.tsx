'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  facilityId: string;
  facilityName: string;
  accessTime: string;
  accessResult: 'granted' | 'denied';
  denialReason?: string;
  deviceInfo?: {
    deviceId: string;
    location: string;
    ipAddress: string;
  };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface AccessHistoryProps {
  userId?: string;
  facilityId?: string;
  accessLogs: AccessLog[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  className?: string;
  showUserColumn?: boolean;
  showFacilityColumn?: boolean;
}

interface FilterOptions {
  result: 'all' | 'granted' | 'denied';
  facility: string;
  dateRange: DateRange;
  searchTerm: string;
}

export default function AccessHistory({ 
  userId,
  facilityId,
  accessLogs, 
  dateRange, 
  onDateRangeChange,
  onRefresh,
  className,
  showUserColumn = true,
  showFacilityColumn = true
}: AccessHistoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    result: 'all',
    facility: 'all',
    dateRange,
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>(accessLogs);

  // Update filtered logs when accessLogs or filters change
  useEffect(() => {
    let filtered = [...accessLogs];

    // Filter by result
    if (filters.result !== 'all') {
      filtered = filtered.filter(log => log.accessResult === filters.result);
    }

    // Filter by facility
    if (filters.facility !== 'all') {
      filtered = filtered.filter(log => log.facilityId === filters.facility);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchLower) ||
        log.facilityName.toLowerCase().includes(searchLower) ||
        log.userRole.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    const startDate = new Date(filters.dateRange.startDate);
    const endDate = new Date(filters.dateRange.endDate);
    filtered = filtered.filter(log => {
      const logDate = new Date(log.accessTime);
      return logDate >= startDate && logDate <= endDate;
    });

    setFilteredLogs(filtered);
  }, [accessLogs, filters]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Time', 'User', 'Role', 'Facility', 'Result', 'Reason'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.accessTime).toLocaleDateString(),
        new Date(log.accessTime).toLocaleTimeString(),
        log.userName,
        log.userRole,
        log.facilityName,
        log.accessResult,
        log.denialReason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getResultColor = (result: string) => {
    return result === 'granted' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueFacilities = Array.from(new Set(accessLogs.map(log => log.facilityId)));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Access History</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredLogs.length} of {accessLogs.length} records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={cn(
                "h-4 w-4 ml-2 transition-transform",
                showFilters && "rotate-180"
              )} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, facilities..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
              </div>

              {/* Result Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Result</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.result}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    result: e.target.value as 'all' | 'granted' | 'denied' 
                  }))}
                >
                  <option value="all">All Results</option>
                  <option value="granted">Granted</option>
                  <option value="denied">Denied</option>
                </select>
              </div>

              {/* Facility Filter */}
              {showFacilityColumn && (
                <div>
                  <label className="block text-sm font-medium mb-1">Facility</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={filters.facility}
                    onChange={(e) => setFilters(prev => ({ ...prev, facility: e.target.value }))}
                  >
                    <option value="all">All Facilities</option>
                    {uniqueFacilities.map(facilityId => {
                      const facility = accessLogs.find(log => log.facilityId === facilityId);
                      return (
                        <option key={facilityId} value={facilityId}>
                          {facility?.facilityName || facilityId}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    value={filters.dateRange.startDate}
                    onChange={(e) => {
                      const newRange = { ...filters.dateRange, startDate: e.target.value };
                      setFilters(prev => ({ ...prev, dateRange: newRange }));
                      onDateRangeChange(newRange);
                    }}
                  />
                  <input
                    type="date"
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    value={filters.dateRange.endDate}
                    onChange={(e) => {
                      const newRange = { ...filters.dateRange, endDate: e.target.value };
                      setFilters(prev => ({ ...prev, dateRange: newRange }));
                      onDateRangeChange(newRange);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No access records found</h3>
            <p className="text-gray-600">
              {accessLogs.length === 0 
                ? "No access attempts have been recorded yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {log.accessResult === 'granted' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {showUserColumn && (
                            <span className="font-medium text-gray-900 truncate">
                              {log.userName}
                            </span>
                          )}
                          <Badge className={getRoleColor(log.userRole)}>
                            {log.userRole}
                          </Badge>
                          <Badge className={getResultColor(log.accessResult)}>
                            {log.accessResult}
                          </Badge>
                        </div>
                        
                        {showFacilityColumn && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{log.facilityName}</span>
                          </div>
                        )}
                        
                        {log.accessResult === 'denied' && log.denialReason && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {log.denialReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(log.accessTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(log.accessTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Device Info (if available) */}
                {log.deviceInfo && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Device:</strong> {log.deviceInfo.deviceId}</p>
                      <p><strong>Location:</strong> {log.deviceInfo.location}</p>
                      <p><strong>IP:</strong> {log.deviceInfo.ipAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredLogs.length > 0 && filteredLogs.length < accessLogs.length && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Records
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}