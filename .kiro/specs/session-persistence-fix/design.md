# Design Document

## Overview

The session persistence fix addresses authentication reliability issues in the PCC Portal application. The current system uses Passport.js with session-based authentication stored in MongoDB, but lacks robust session validation, proper error handling, and reliable session persistence across browser sessions. This design implements comprehensive session management improvements on both frontend and backend.

## Architecture

### Current State Analysis
- **Frontend**: Uses AuthContext with session-based authentication via axios with `withCredentials: true`
- **Backend**: Express sessions with Passport.js, stored in MongoDB via connect-mongo
- **Session Storage**: MongoDB with 24-hour expiration
- **Issue**: 401 errors during `getCurrentUser` calls indicate session validation problems

### Proposed Architecture
- **Enhanced Session Validation**: Robust backend session checking with proper error responses
- **Improved Frontend Error Handling**: Graceful degradation and retry logic for authentication failures
- **Session Health Monitoring**: Proactive session validation and renewal
- **Consistent State Management**: Synchronized authentication state across application components

## Components and Interfaces

### Backend Components

#### 1. Enhanced Session Middleware
```javascript
// middleware/sessionValidator.js
const validateSession = (req, res, next) => {
  // Validate session existence and integrity
  // Handle corrupted or expired sessions gracefully
  // Provide consistent error responses
}
```

#### 2. Improved Authentication Route Handler
```javascript
// routes/auth-new.js - Enhanced /me endpoint
router.get('/me', sessionValidator, async (req, res) => {
  // Robust user lookup with error handling
  // Consistent response format
  // Proper session refresh logic
}
```

#### 3. Session Configuration Enhancement
```javascript
// server.js - Enhanced session config
app.use(session({
  // Improved session settings for reliability
  // Better cookie configuration
  // Enhanced error handling
}))
```

### Frontend Components

#### 1. Enhanced AuthContext
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  // Existing properties plus:
  sessionStatus: 'checking' | 'valid' | 'invalid' | 'error';
  retryAuth: () => Promise<void>;
  clearAuthError: () => void;
}
```

#### 2. Improved API Configuration
```typescript
// lib/api.ts
// Enhanced axios interceptors for session handling
// Improved error handling and retry logic
// Better session state synchronization
```

#### 3. Session Health Monitor
```typescript
// lib/sessionMonitor.ts
class SessionMonitor {
  // Periodic session validation
  // Proactive session renewal
  // Connection state monitoring
}
```

## Data Models

### Session State Model
```typescript
interface SessionState {
  isAuthenticated: boolean;
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  sessionStatus: 'checking' | 'valid' | 'invalid' | 'error';
  lastValidated: Date | null;
  retryCount: number;
  error: string | null;
}
```

### API Response Enhancement
```typescript
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profile: StudentProfile | FacultyProfile | null;
    sessionInfo: {
      expiresAt: string;
      isValid: boolean;
    };
  };
  sessionStatus?: 'valid' | 'expired' | 'invalid';
}
```

## Error Handling

### Backend Error Handling
1. **Session Validation Errors**
   - Corrupted session data → Clear session, return 401
   - Expired session → Clear session, return 401 with expiration message
   - Missing session → Return 401 with authentication required message
   - Database connection issues → Return 503 with retry-after header

2. **User Lookup Errors**
   - User not found → Clear session, return 401
   - User deactivated → Clear session, return 403 with specific message
   - Database errors → Return 500 with generic message

### Frontend Error Handling
1. **Network Errors**
   - Connection timeout → Retry with exponential backoff
   - Network unavailable → Show offline state
   - Server errors (5xx) → Show server error state with retry option

2. **Authentication Errors**
   - 401 Unauthorized → Clear auth state, redirect to login
   - 403 Forbidden → Show account status message
   - Session expired → Clear auth state, show session expired message

3. **Retry Logic**
   - Maximum 3 retry attempts for network errors
   - Exponential backoff: 300ms, 600ms, 1200ms
   - Rate limiting awareness (429 status)
   - Circuit breaker pattern for persistent failures

## Testing Strategy

### Backend Testing
1. **Session Validation Tests**
   - Valid session handling
   - Expired session cleanup
   - Corrupted session handling
   - Missing session responses

2. **Authentication Endpoint Tests**
   - Successful authentication flow
   - Various error conditions
   - Session persistence across requests
   - Concurrent session handling

3. **Integration Tests**
   - Full authentication flow
   - Session expiration scenarios
   - Database connection failures
   - Load testing for session handling

### Frontend Testing
1. **AuthContext Tests**
   - Authentication state management
   - Error handling scenarios
   - Retry logic validation
   - Session persistence

2. **API Integration Tests**
   - Axios interceptor behavior
   - Error response handling
   - Retry mechanism testing
   - Session synchronization

3. **User Experience Tests**
   - Loading states during auth check
   - Error message display
   - Graceful degradation
   - Session expiration handling

### End-to-End Testing
1. **Session Persistence Scenarios**
   - Login → Close browser → Reopen → Verify auth state
   - Session expiration during active use
   - Network interruption recovery
   - Multiple tab synchronization

2. **Error Recovery Scenarios**
   - Backend restart during active session
   - Database connection loss
   - Network connectivity issues
   - Invalid session data handling

## Implementation Phases

### Phase 1: Backend Session Reliability
- Enhance session validation middleware
- Improve `/auth/me` endpoint error handling
- Add session health indicators
- Implement consistent error responses

### Phase 2: Frontend Error Handling
- Enhance AuthContext with better error states
- Improve axios interceptors for session handling
- Add retry logic with exponential backoff
- Implement session status monitoring

### Phase 3: Session Monitoring
- Add proactive session validation
- Implement session renewal logic
- Add connection state monitoring
- Enhance user feedback for auth states

### Phase 4: Testing and Optimization
- Comprehensive test coverage
- Performance optimization
- Error scenario validation
- User experience refinement