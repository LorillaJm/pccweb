# PCC Portal - Phase 5: Advanced Features

A comprehensive web portal for Philippine Christian College with complete academic services for students.

## 🚀 Features

### Phase 4: Student Services ✅

### Features Completed:
- **Student Dashboard:** Personalized academic overview with enrollment stats, GPA, payment balances, recent grades, and materials
- **Grades System:** Students can view detailed grades by semester, including prelim, midterm, finals, letter grades, and GPA history
- **Enrollment System:** Students can browse available subjects, enroll in classes (subject to approval), view current enrollments, and drop subjects with unit load management
- **Payment Tracking:** Students can view tuition and fee balances, payment history with transactions, and payment status with multiple payment methods
- **Learning Materials:** Students can download class handouts, assignments, and other resources, with filtering by subject and material type

## Phase 5: Advanced Features ✅

### Features Completed:
- **AI-Powered Chatbot:** Intelligent FAQ system with natural language processing, conversation history, and contextual responses for student support
- **Event Ticketing System:** QR-based event registration and ticketing with digital tickets, event management, and attendance tracking
- **Digital ID System:** QR-coded campus access control with digital identification cards, access logging, and security features
- **OJT & Internship Portal:** Comprehensive internship management with company partnerships, application tracking, and student placement
- **Alumni Portal:** Alumni directory, job board, mentorship programs, and networking opportunities with career services
- **Notifications System:** Real-time notifications for important updates, deadlines, and system alerts

### Phase 3: Admin Portal
- **Super Admin Dashboard** - Complete system overview with analytics
- **User Management** - Add, edit, delete students, faculty, and staff
- **Content Management System (CMS)** - Manage news, events, and announcements
- **Academic Management** - Create and manage subjects, courses, and class sections
- **Enrollment Control** - Track and approve student enrollments
- **Role-based Access Control** - Enhanced security with admin/super_admin roles

### Core Features
- User authentication and authorization with JWT
- Student and faculty portals with full academic services
- Course management system
- Announcements and news system
- Material sharing platform
- Responsive modern UI design

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with enhanced schemas for student services
- **Authentication**: JWT tokens with role-based access
- **Security**: Helmet, CORS, Rate limiting

## 📋 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pccweb
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Set up environment variables**
```bash
# Backend environment (create backend/.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pcc_portal
DB_USER=postgres
DB_PASS=your_password
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. **Set up the database**
```bash
cd backend

# Create the database
createdb pcc_portal

# Run the database schemas
psql -d pcc_portal -f database/admin-schema.sql
psql -d pcc_portal -f database/student-services-schema.sql
```

5. **Create a super admin user**
```bash
cd backend
node create-admin.js
```
This creates:
- Email: `admin@pcc.edu.ph`
- Password: `admin123`
- Role: `super_admin`

6. **Start the development servers**
```bash
# Start backend (from backend directory)
npm start
# or for development with auto-reload
npm run dev

# Start frontend (from root directory)
npm run dev
```

## 🏗 Project Structure

```
pccweb/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   │   ├── admin/         # Admin portal pages
│   │   │   ├── users/     # User management
│   │   │   ├── content/   # Content management
│   │   │   ├── academic/  # Academic management
│   │   │   └── enrollments/ # Enrollment control
│   │   ├── student/       # Student portal pages (NEW!)
│   │   │   ├── grades/    # Grade viewing and GPA tracking
│   │   │   ├── enrollment/ # Course registration
│   │   │   ├── payments/  # Payment tracking
│   │   │   └── materials/ # Learning materials
│   │   ├── auth/          # Authentication pages
│   │   └── dashboard/     # User dashboards
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (AuthContext)
│   └── lib/              # Utility libraries (API client)
├── backend/               # Backend source code
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware (enhanced auth)
│   ├── routes/           # API routes
│   │   ├── admin.js      # Admin portal routes
│   │   ├── student-services.js # Student services routes (NEW!)
│   │   ├── auth.js       # Authentication
│   │   ├── users.js      # User management
│   │   └── ...           # Other routes
│   ├── database/         # Database schemas
│   │   ├── admin-schema.sql # Enhanced admin tables
│   │   └── student-services-schema.sql # Student services tables (NEW!)
│   ├── create-admin.js   # Admin user creation script
│   ├── test-admin.js     # Admin portal test script
│   └── test-student-services.js # Student services test script (NEW!)
└── public/               # Static assets
```

## 🎓 Student Portal Access

### Accessing the Student Portal

1. **Login as Student**
   - Go to `/auth/login`
   - Use your student credentials

2. **Navigate to Student Portal**
   - After login, go to `/student`
   - Access all academic services from the sidebar

### Student Features

#### 1. Dashboard (`/student`)
- Academic performance overview
- Current enrollment statistics
- Payment balance summary
- Recent grades and materials
- Quick action buttons

#### 2. Grades System (`/student/grades`)
- View all grades by semester
- GPA tracking and calculation
- Academic performance history
- Grade breakdown (Prelim, Midterm, Finals)
- Letter grades and grade points

#### 3. Enrollment System (`/student/enrollment`)
- Browse available subjects/classes
- Register for courses (subject to approval)
- View current enrollments and schedule
- Drop subjects with reason
- Unit load management (max 24 units)

#### 4. Payment Tracking (`/student/payments`)
- View tuition and fee balances
- Payment history and transactions
- Multiple payment methods support
- Receipt tracking and verification
- Outstanding balance alerts

#### 5. Learning Materials (`/student/materials`)
- Download class handouts and resources
- Filter by subject and material type
- File management (PDF, DOC, PPT, etc.)
- Download tracking and statistics
- Faculty-uploaded content access

## 🔐 Admin Portal Access

### Accessing the Admin Portal

1. **Login as Super Admin**
   - Go to `/auth/login`
   - Use credentials: `admin@pcc.edu.ph` / `admin123`

2. **Navigate to Admin Portal**
   - After login, go to `/admin`
   - Or click "Admin Portal" in the navigation (if admin/super_admin)

### Admin Features

#### 1. Dashboard (`/admin`)
- User statistics by role
- Enrollment statistics
- Recent user registrations
- Recent announcements
- Quick action buttons

#### 2. User Management (`/admin/users`)
- View all users with filtering and search
- Create new students, faculty, and admin accounts
- Edit user information and roles
- Activate/deactivate user accounts
- Pagination and advanced filtering

#### 3. Content Management (`/admin/content`)
- Create and manage announcements, news, and events
- Set priority levels and target audiences
- Schedule events with dates and locations
- Publish/unpublish content
- Category-based organization

#### 4. Academic Management (`/admin/academic`)
- Create and manage subjects/courses
- Set prerequisites and year level requirements
- Create class sections with faculty assignment
- Manage enrollment capacity
- Track section utilization

#### 5. Enrollment Control (`/admin/enrollments`)
- View all student enrollments
- Approve or reject pending enrollments
- Track enrollment status with reasons
- Filter by status, student, or section
- Bulk enrollment management

## 🧪 Testing the Admin Portal

Run the admin portal test suite:

```bash
cd backend

# Create admin user (if not already created)
node create-admin.js

# Start the server
npm start

# In another terminal, run admin tests
node test-admin.js
```

### Student Services Testing (NEW!)

Run the student services test suite:

```bash
cd backend

# Make sure server is running
npm start

# In another terminal, run student services tests
node test-student-services.js
```

The student services test script will verify:
- Student authentication and access control
- Grades system functionality
- Enrollment system operations
- Payment tracking features
- Learning materials management
- Dashboard data integration
- Role-based access restrictions

## 📡 API Documentation

### Student Services Endpoints (NEW!)

All student services endpoints require authentication with appropriate roles.

#### Grades System
- `GET /api/student-services/grades` - View student grades (Student)
- `GET /api/student-services/grades/summary` - Grade summary/GPA (Student)
- `POST /api/student-services/grades` - Submit grades (Faculty)

#### Enrollment System
- `GET /api/student-services/enrollment/available-subjects` - Available subjects (Student)
- `GET /api/student-services/enrollment/my-enrollments` - Current enrollments (Student)
- `POST /api/student-services/enrollment/enroll` - Enroll in subject (Student)
- `DELETE /api/student-services/enrollment/:id` - Drop enrollment (Student)

#### Payment Tracking
- `GET /api/student-services/payments` - View payments (Student)
- `GET /api/student-services/payments/summary` - Payment summary (Student)
- `GET /api/student-services/payments/:id/transactions` - Payment history (Student)

#### Learning Materials
- `GET /api/student-services/materials` - View materials (Student/Faculty)
- `GET /api/student-services/materials/:id/download` - Download material (Student/Faculty)
- `POST /api/student-services/materials` - Upload material (Faculty)

### Admin Endpoints

All admin endpoints require authentication with `admin` or `super_admin` role.

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

#### Enrollment Control
- `GET /api/admin/enrollments` - List enrollments
- `PUT /api/admin/enrollments/:id/status` - Update enrollment status

### Core Endpoints
- Authentication (`/api/auth`)
- User profiles (`/api/users`)
- Announcements (`/api/announcements`)
- Subjects (`/api/subjects`)
- Materials (`/api/materials`)

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (student, faculty, admin, super_admin)
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🎯 User Roles

1. **Student** - Access to courses, materials, announcements
2. **Faculty** - Manage classes, upload materials, create announcements
3. **Admin** - Basic administrative functions
4. **Super Admin** - Full system control including user management

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DB_HOST=your-production-db-host
DB_NAME=pcc_portal_prod
JWT_SECRET=your-strong-secret-key
FRONTEND_URL=https://your-domain.com
```

### Database Migration
```bash
# Run on production database
psql -d pcc_portal_prod -f database/admin-schema.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` (if available)

---

**Phase 3 Complete!** 🎉 The admin portal provides comprehensive system management capabilities for college administrators.
