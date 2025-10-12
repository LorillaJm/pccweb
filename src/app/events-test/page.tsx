'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';

export default function EventsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-green-800 font-medium">Events Page Test</h3>
                <p className="text-green-600 text-sm">
                  This page loads successfully! The issue with /events is likely authentication-related.
                </p>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Events System Test</h1>
          <p className="text-gray-600 mt-2">Testing if the events page can load without authentication issues</p>
        </div>

        {/* Test Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-blue-100 text-blue-800">Academic</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>
              </div>
              <CardTitle className="text-lg">Test Event 1</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">This is a test event to verify the page loads correctly.</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Dec 25, 2024</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Test Venue</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>0 / 100 registered</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-0"></div>
              </div>

              <div className="pt-2">
                <Button className="w-full" onClick={() => alert('This is just a test!')}>
                  Test Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Information */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnostic Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> /events-test</p>
            <p><strong>Page Status:</strong> ✅ Loading Successfully</p>
            <p><strong>Components:</strong> ✅ UI Components Working</p>
            <p><strong>Authentication:</strong> ❌ Not Required (This page works without auth)</p>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>If this page loads but /events doesn't, the issue is authentication</li>
              <li>Try logging in first, then visit /events</li>
              <li>Check browser console for error messages</li>
              <li>Verify your session is valid</li>
            </ol>
          </div>

          <div className="mt-4 flex gap-4">
            <Button 
              onClick={() => window.location.href = '/events'}
              variant="outline"
            >
              Try /events Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              variant="outline"
            >
              Go to Login
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/events/demo'}
            >
              Try Events Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}