import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock events data for testing
    const mockEvents = [
      {
        _id: '1',
        title: 'Test Event 1',
        description: 'This is a test event to verify the API is working',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        venue: 'Test Venue',
        capacity: 100,
        registeredCount: 0,
        organizer: {
          firstName: 'Test',
          lastName: 'Organizer'
        },
        status: 'published',
        isPublic: true,
        availableSlots: 100,
        isFull: false,
        isRegistrationOpen: true
      },
      {
        _id: '2',
        title: 'Test Event 2',
        description: 'Another test event for API verification',
        category: 'cultural',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        venue: 'Cultural Center',
        capacity: 200,
        registeredCount: 50,
        organizer: {
          firstName: 'Cultural',
          lastName: 'Director'
        },
        status: 'published',
        isPublic: true,
        availableSlots: 150,
        isFull: false,
        isRegistrationOpen: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockEvents,
      message: 'Test events retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Events test API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve test events',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Test API received data:', body);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'startDate', 'endDate', 'venue', 'capacity'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: `Missing fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Mock event creation
    const newEvent = {
      _id: Date.now().toString(),
      ...body,
      registeredCount: 0,
      organizer: {
        firstName: 'Test',
        lastName: 'User'
      },
      status: 'published',
      availableSlots: body.capacity || 100,
      isFull: false,
      isRegistrationOpen: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: 'Test event created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Events test API POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test event',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}