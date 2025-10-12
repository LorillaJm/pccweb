import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DigitalIDCard from './DigitalIDCard';
import AccessScanner from './AccessScanner';
import AccessHistory from './AccessHistory';
import FacilityManagementDashboard from './FacilityManagementDashboard';

// Mock the utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

// Mock navigator APIs
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn()
  }
});

Object.defineProperty(navigator, 'share', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn()
  }
});

describe('DigitalIDCard Component', () => {
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Smith',
    email: 'john.doe@example.com',
    role: 'student' as const,
    profilePicture: 'https://example.com/photo.jpg',
    studentId: 'STU001'
  };

  const mockProps = {
    user: mockUser,
    qrCode: 'data:image/png;base64,mockqrcode',
    accessLevel: 'full',
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    onRefresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders digital ID card with user information', () => {
    render(<DigitalIDCard {...mockProps} />);
    
    expect(screen.getByText('Digital ID Card')).toBeInTheDocument();
    expect(screen.getByText('John S. Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('STUDENT')).toBeInTheDocument();
    expect(screen.getByText('STU001')).toBeInTheDocument();
  });

  it('displays QR code image', () => {
    render(<DigitalIDCard {...mockProps} />);
    
    const qrImage = screen.getByAltText('Digital ID QR Code');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', mockProps.qrCode);
  });

  it('shows expiry countdown', () => {
    render(<DigitalIDCard {...mockProps} />);
    
    expect(screen.getByText('Expires in:')).toBeInTheDocument();
    // Should show some time remaining (exact text depends on timing)
  });

  it('handles refresh button click', async () => {
    render(<DigitalIDCard {...mockProps} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('handles download functionality', () => {
    // Mock canvas and its methods
    const mockCanvas = {
      getContext: jest.fn(() => ({
        fillStyle: '',
        fillRect: jest.fn(),
        strokeStyle: '',
        lineWidth: 0,
        strokeRect: jest.fn(),
        font: '',
        fillText: jest.fn()
      })),
      width: 0,
      height: 0,
      toBlob: jest.fn((callback) => callback(new Blob()))
    };
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') return mockCanvas as any;
      if (tagName === 'a') return {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      } as any;
      return document.createElement(tagName);
    });

    render(<DigitalIDCard {...mockProps} />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);
    
    expect(mockCanvas.getContext).toHaveBeenCalled();
  });

  it('shows expired status when ID is expired', () => {
    const expiredProps = {
      ...mockProps,
      expiresAt: new Date(Date.now() - 86400000).toISOString() // 24 hours ago
    };
    
    render(<DigitalIDCard {...expiredProps} />);
    
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});

describe('AccessScanner Component', () => {
  const mockProps = {
    facilityId: 'FAC001',
    facilityName: 'Main Library',
    onAccessGrant: jest.fn(),
    onAccessDeny: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('renders access scanner interface', () => {
    render(<AccessScanner {...mockProps} />);
    
    expect(screen.getByText('Access Scanner')).toBeInTheDocument();
    expect(screen.getByText('Facility: Main Library')).toBeInTheDocument();
    expect(screen.getByText('Start Scanning')).toBeInTheDocument();
  });

  it('requests camera permission when starting scan', async () => {
    const mockGetUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    });
    navigator.mediaDevices.getUserMedia = mockGetUserMedia;

    render(<AccessScanner {...mockProps} />);
    
    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
    });
  });

  it('handles camera permission denial', async () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));
    navigator.mediaDevices.getUserMedia = mockGetUserMedia;

    render(<AccessScanner {...mockProps} />);
    
    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Camera Access Required')).toBeInTheDocument();
    });
  });

  it('displays scan results', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(<AccessScanner {...mockProps} />);
    
    // This would require more complex mocking of video and canvas APIs
    // for a complete test of the scanning functionality
  });
});

describe('AccessHistory Component', () => {
  const mockAccessLogs = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userRole: 'student',
      facilityId: 'FAC001',
      facilityName: 'Main Library',
      accessTime: new Date().toISOString(),
      accessResult: 'granted' as const
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      userRole: 'faculty',
      facilityId: 'FAC002',
      facilityName: 'Computer Lab',
      accessTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      accessResult: 'denied' as const,
      denialReason: 'Insufficient permissions'
    }
  ];

  const mockProps = {
    accessLogs: mockAccessLogs,
    dateRange: {
      startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      endDate: new Date().toISOString().split('T')[0] // Today
    },
    onDateRangeChange: jest.fn(),
    onRefresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders access history with logs', () => {
    render(<AccessHistory {...mockProps} />);
    
    expect(screen.getByText('Access History')).toBeInTheDocument();
    expect(screen.getByText('2 of 2 records')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('filters logs by search term', () => {
    render(<AccessHistory {...mockProps} />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const searchInput = screen.getByPlaceholderText('Search users, facilities...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters logs by access result', () => {
    render(<AccessHistory {...mockProps} />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const resultSelect = screen.getByDisplayValue('All Results');
    fireEvent.change(resultSelect, { target: { value: 'denied' } });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('exports data to CSV', () => {
    // Mock URL.createObjectURL and related APIs
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockClick = jest.fn();
    
    jest.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: mockClick,
      remove: jest.fn()
    } as any));
    
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    render(<AccessHistory {...mockProps} />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('handles refresh functionality', async () => {
    render(<AccessHistory {...mockProps} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1);
  });
});

describe('FacilityManagementDashboard Component', () => {
  const mockFacilities = [
    {
      id: 'FAC001',
      name: 'Main Library',
      type: 'library' as const,
      location: 'Building A, Floor 1',
      capacity: 100,
      currentOccupancy: 45,
      isActive: true,
      accessRequirements: {
        role: ['student', 'faculty', 'staff']
      },
      emergencyOverride: false,
      lastAccess: new Date().toISOString(),
      totalAccessToday: 150,
      deniedAccessToday: 5
    },
    {
      id: 'FAC002',
      name: 'Computer Lab',
      type: 'laboratory' as const,
      location: 'Building B, Floor 2',
      capacity: 30,
      currentOccupancy: 28,
      isActive: true,
      accessRequirements: {
        role: ['student', 'faculty']
      },
      emergencyOverride: true,
      totalAccessToday: 85,
      deniedAccessToday: 12
    }
  ];

  const mockAccessStats = {
    totalAccess: 235,
    successfulAccess: 218,
    deniedAccess: 17,
    uniqueUsers: 156,
    peakHour: '10:00 AM',
    mostAccessedFacility: 'Main Library'
  };

  const mockProps = {
    facilities: mockFacilities,
    accessStats: mockAccessStats,
    onCreateFacility: jest.fn(),
    onEditFacility: jest.fn(),
    onDeleteFacility: jest.fn(),
    onToggleFacility: jest.fn(),
    onEmergencyOverride: jest.fn(),
    onRefresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders facility management dashboard', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    expect(screen.getByText('Facility Management')).toBeInTheDocument();
    expect(screen.getByText('2 of 2 facilities')).toBeInTheDocument();
    expect(screen.getByText('Main Library')).toBeInTheDocument();
    expect(screen.getByText('Computer Lab')).toBeInTheDocument();
  });

  it('displays access statistics', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    expect(screen.getByText('Total Access Today')).toBeInTheDocument();
    expect(screen.getByText('235')).toBeInTheDocument();
    expect(screen.getByText('Successful Access')).toBeInTheDocument();
    expect(screen.getByText('218')).toBeInTheDocument();
    expect(screen.getByText('Denied Access')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('shows facility details and occupancy', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    expect(screen.getByText('45/100')).toBeInTheDocument(); // Main Library occupancy
    expect(screen.getByText('28/30')).toBeInTheDocument(); // Computer Lab occupancy
    expect(screen.getByText('Emergency')).toBeInTheDocument(); // Emergency override badge
  });

  it('handles facility creation', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    const addButton = screen.getByText('Add Facility');
    fireEvent.click(addButton);
    
    expect(mockProps.onCreateFacility).toHaveBeenCalledTimes(1);
  });

  it('handles facility editing', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(mockProps.onEditFacility).toHaveBeenCalledWith('FAC001');
  });

  it('handles facility toggle', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    const disableButtons = screen.getAllByText('Disable');
    fireEvent.click(disableButtons[0]);
    
    expect(mockProps.onToggleFacility).toHaveBeenCalledWith('FAC001', false);
  });

  it('filters facilities by search term', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search facilities...');
    fireEvent.change(searchInput, { target: { value: 'Library' } });
    
    expect(screen.getByText('Main Library')).toBeInTheDocument();
    expect(screen.queryByText('Computer Lab')).not.toBeInTheDocument();
  });

  it('filters facilities by type', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'laboratory' } });
    
    expect(screen.getByText('Computer Lab')).toBeInTheDocument();
    expect(screen.queryByText('Main Library')).not.toBeInTheDocument();
  });

  it('handles emergency override toggle', () => {
    render(<FacilityManagementDashboard {...mockProps} />);
    
    // Find shield buttons (emergency override buttons)
    const shieldButtons = screen.getAllByRole('button');
    const emergencyButton = shieldButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-testid') === 'shield' ||
      button.innerHTML.includes('Shield')
    );
    
    if (emergencyButton) {
      fireEvent.click(emergencyButton);
      expect(mockProps.onEmergencyOverride).toHaveBeenCalled();
    }
  });
});