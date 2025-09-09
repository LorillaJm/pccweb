# Passi City College Website

A modern, responsive website for Passi City College built with Next.js and Tailwind CSS.

## 🎯 Project Overview

This is the Phase 1 implementation of the Passi City College website, focusing on the public-facing pages that showcase the college online.

### ✅ Completed Features (Phase 1)

- **Landing Page / Home Page**
  - College logo, mission, vision, hero banner
  - Latest announcements and news
  - Call-to-action sections

- **About Page**
  - College history and milestones
  - Mission, vision, and core values
  - Leadership team profiles
  - Accreditation information

- **Academic Programs Page**
  - Comprehensive list of undergraduate programs
  - Graduate program offerings
  - Program details with duration and units
  - Department categorization

- **Admissions Page**
  - Application process and deadlines
  - Admission requirements by student type
  - Tuition and fees information
  - Scholarship opportunities
  - Downloadable forms

- **News & Events Page**
  - Featured news articles
  - Latest announcements
  - Upcoming events calendar
  - News categorization and filtering

- **Contact Us Page**
  - Contact information and office hours
  - Department-specific contacts
  - Interactive contact form
  - Campus location and directions

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Headless UI
- **Language**: TypeScript
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager

### Installation & Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd C:\Users\pc1\Downloads\pccweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or use the provided start script
   ./start.ps1  # Windows PowerShell
   ./start.sh   # Linux/Mac
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
pccweb/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/page.tsx     # About page
│   │   ├── admissions/page.tsx # Admissions page
│   │   ├── contact/page.tsx   # Contact page
│   │   ├── news/page.tsx      # News & Events page
│   │   ├── programs/page.tsx  # Academic Programs page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   └── components/
│       ├── Navigation.tsx     # Main navigation component
│       └── Footer.tsx         # Footer component
├── public/                    # Static assets
├── start.ps1                 # Windows start script
├── start.sh                  # Unix start script
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Blue**: `blue-900` (#1e3a8a)
- **Secondary Blue**: `blue-600` (#2563eb)
- **Accent Yellow**: `yellow-400` (#facc15)
- **Gray Scale**: `gray-50` to `gray-900`

### Typography
- **Font**: Geist Sans (Primary), Geist Mono (Code)
- **Headings**: Bold, responsive sizing
- **Body**: Regular weight, good contrast

### Components
- Responsive navigation with mobile menu
- Card-based layouts
- Consistent button styles
- Form components with validation
- Icon integration throughout

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🔍 SEO Optimizations

- Semantic HTML structure
- Meta descriptions and titles
- Proper heading hierarchy
- Alt text for images
- Fast loading times

## 📋 Future Enhancements (Phase 2+)

- Student portal integration
- Online application system
- Faculty portal
- Student information system
- Content management system
- Payment gateway integration
- Live chat support
- Multi-language support

## 🐛 Known Issues

- Google Maps integration placeholder (requires API key)
- Form submissions are simulated (needs backend integration)
- Newsletter signup needs backend connection

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For technical support or questions about the website:
- Email: info@passicitycollege.edu.ph
- Phone: (033) 396-1234

## 📄 License

This project is proprietary to Passi City College.

---

**Generated with [Memex](https://memex.tech)**
**Co-Authored-By: Memex <noreply@memex.tech>**
