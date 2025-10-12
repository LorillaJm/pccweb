# Alumni Portal Components

This directory contains all frontend components for the Alumni Portal feature of the PCC Portal system.

## Components Overview

### 1. AlumniDirectory
**File:** `AlumniDirectory.tsx`

A comprehensive directory component for browsing and connecting with alumni.

**Features:**
- Search alumni by name, company, position, or industry
- Advanced filtering (graduation year, degree, industry, location, mentorship availability)
- Display alumni profiles with career information
- Connect with alumni via messaging or email
- Social media links integration
- Verified alumni badges
- Mentorship availability indicators

**Props:**
```typescript
interface AlumniDirectoryProps {
  alumni: AlumniProfile[];
  searchFilters: AlumniFilters;
  onConnect: (alumniId: string) => void;
  onFilterChange: (filters: AlumniFilters) => void;
  loading?: boolean;
  currentUserId?: string;
}
```

**Usage:**
```tsx
import { AlumniDirectory } from '@/components/alumni';

<AlumniDirectory
  alumni={alumniData}
  searchFilters={filters}
  onConnect={handleConnect}
  onFilterChange={setFilters}
  currentUserId={user.id}
/>
```

### 2. JobBoard
**File:** `JobBoard.tsx`

A job board component for displaying and applying to job opportunities posted by alumni and companies.

**Features:**
- Search jobs by title, company, or keywords
- Filter by work type, location, target audience, and salary
- Display job details with requirements and skills
- Apply for jobs with one click
- View application statistics
- Deadline tracking
- Salary range display

**Props:**
```typescript
interface JobBoardProps {
  jobs: JobPosting[];
  onApply: (jobId: string) => void;
  onFilterChange: (filters: JobFilters) => void;
  filters: JobFilters;
  userType: 'student' | 'alumni';
  loading?: boolean;
}
```

**Usage:**
```tsx
import { JobBoard } from '@/components/alumni';

<JobBoard
  jobs={jobPostings}
  onApply={handleApply}
  onFilterChange={setFilters}
  filters={jobFilters}
  userType="student"
/>
```

### 3. MentorshipProgram
**File:** `MentorshipProgram.tsx`

A mentorship program component for connecting students with alumni mentors.

**Features:**
- Search mentors by name, expertise, or industry
- View mentor profiles with expertise and achievements
- Check mentor availability and current mentee count
- Request mentorship with personalized messages
- View mentorship statistics (active, pending, completed)
- Mentor expertise badges
- Availability indicators

**Props:**
```typescript
interface MentorshipProgramProps {
  mentors: MentorProfile[];
  onRequestMentorship: (mentorId: string, message: string) => void;
  userMentorships?: Mentorship[];
  loading?: boolean;
}
```

**Usage:**
```tsx
import { MentorshipProgram } from '@/components/alumni';

<MentorshipProgram
  mentors={mentorData}
  onRequestMentorship={handleRequest}
  userMentorships={myMentorships}
/>
```

### 4. AlumniEvents
**File:** `AlumniEvents.tsx`

An events component specifically for alumni-related events with integration to the main event system.

**Features:**
- Search events by title, description, or venue
- Filter by category and target audience
- View event details with date, time, and location
- Registration progress and capacity tracking
- Register for events with one click
- Target audience badges (Alumni Only, Students Only, Open to All)
- Event status indicators

**Props:**
```typescript
interface AlumniEventsProps {
  events: AlumniEvent[];
  onRegister: (eventId: string) => void;
  loading?: boolean;
  userType: 'student' | 'alumni';
}
```

**Usage:**
```tsx
import { AlumniEvents } from '@/components/alumni';

<AlumniEvents
  events={alumniEvents}
  onRegister={handleRegister}
  userType="alumni"
/>
```

## Type Definitions

All TypeScript types are defined in `types.ts`:

- `AlumniProfile` - Alumni user profile data
- `JobPosting` - Job opportunity data
- `MentorProfile` - Mentor profile data
- `Mentorship` - Mentorship relationship data
- `AlumniEvent` - Alumni event data
- `AlumniFilters` - Alumni directory filter options
- `JobFilters` - Job board filter options

## Responsive Design

All components are fully responsive and follow a mobile-first approach:

- **Mobile (< 768px):** Single column layout
- **Tablet (768px - 1024px):** Two column grid
- **Desktop (> 1024px):** Three column grid (where applicable)

## Styling

Components use:
- Tailwind CSS for styling
- shadcn/ui components for consistent UI elements
- Lucide React for icons
- Custom color schemes matching the PCC Portal design

## Testing

Manual test component available in `AlumniComponents.test.tsx`:

```tsx
import { AlumniComponentsTest } from '@/components/alumni/AlumniComponents.test';

// Render in a test page
<AlumniComponentsTest />
```

The test component provides:
- Interactive testing interface
- All components in tabbed layout
- Mock data for testing
- Console logging for event handlers

## Integration Guide

### 1. Backend API Integration

Connect components to your backend API:

```typescript
// Example API service
const alumniService = {
  getAlumni: async (filters: AlumniFilters) => {
    const response = await fetch('/api/alumni', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    return response.json();
  },
  
  connectWithAlumni: async (alumniId: string) => {
    const response = await fetch(`/api/alumni/${alumniId}/connect`, {
      method: 'POST'
    });
    return response.json();
  }
};
```

### 2. State Management

Use React hooks or state management library:

```typescript
const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
const [filters, setFilters] = useState<AlumniFilters>({
  search: '',
  graduationYear: '',
  degree: '',
  industry: '',
  location: '',
  mentorshipAvailable: false
});

useEffect(() => {
  alumniService.getAlumni(filters).then(setAlumni);
}, [filters]);
```

### 3. Authentication

Ensure user authentication before accessing components:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const AlumniPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <AlumniDirectory ... />;
};
```

## Requirements Coverage

This implementation covers the following requirements from the design document:

- **Requirement 5.1:** Alumni registration, verification, and profile management
- **Requirement 5.2:** Job postings and application tracking
- **Requirement 5.3:** Alumni networking and search features
- **Requirement 5.4:** Mentorship matching and program management
- **Requirement 5.6:** Job application tracking
- **Requirement 5.7:** Alumni event integration
- **Requirement 6.1:** Responsive interface for all devices
- **Requirement 6.2:** Mobile-optimized interactions

## Performance Considerations

- Components use React.memo for optimization (where needed)
- Lazy loading for images and heavy content
- Efficient filtering with useMemo hooks
- Debounced search inputs
- Pagination support (can be added)

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:
- Real-time chat integration
- Video call scheduling for mentorship
- Advanced analytics dashboard
- Alumni success stories section
- Career progression tracking
- Alumni donation portal
- Event live streaming integration

## Support

For issues or questions:
1. Check the design document: `.kiro/specs/advanced-modern-features/design.md`
2. Review requirements: `.kiro/specs/advanced-modern-features/requirements.md`
3. Contact the development team

## License

Part of the PCC Portal System - Internal Use Only
