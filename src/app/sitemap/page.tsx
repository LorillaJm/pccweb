import React from 'react';
import Link from 'next/link';

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Main Pages',
      links: [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'News & Announcements', href: '/news' },
      ]
    },
    {
      title: 'Authentication',
      links: [
        { name: 'Login', href: '/auth/login' },
        { name: 'Register', href: '/auth/register' },
        { name: 'Forgot Password', href: '/auth/forgot-password' },
      ]
    },
    {
      title: 'Student Portal',
      links: [
        { name: 'Dashboard', href: '/portal/student' },
        { name: 'My Courses', href: '/portal/student/courses' },
        { name: 'Grades', href: '/portal/student/grades' },
        { name: 'Schedule', href: '/portal/student/schedule' },
        { name: 'Assignments', href: '/portal/student/assignments' },
        { name: 'Profile', href: '/portal/student/profile' },
      ]
    },
    {
      title: 'Faculty Portal',
      links: [
        { name: 'Dashboard', href: '/portal/faculty' },
        { name: 'My Classes', href: '/portal/faculty/classes' },
        { name: 'Grade Management', href: '/portal/faculty/grades' },
        { name: 'Attendance', href: '/portal/faculty/attendance' },
        { name: 'Course Materials', href: '/portal/faculty/materials' },
      ]
    },
    {
      title: 'Admin Portal',
      links: [
        { name: 'Dashboard', href: '/admin' },
        { name: 'User Management', href: '/admin/users' },
        { name: 'Content Management', href: '/admin/content' },
        { name: 'System Settings', href: '/admin/settings' },
        { name: 'Reports', href: '/admin/reports' },
        { name: 'Job Postings', href: '/admin/jobs' },
      ]
    },
    {
      title: 'Events & Activities',
      links: [
        { name: 'Browse Events', href: '/events' },
        { name: 'My Registrations', href: '/events/my-registrations' },
        { name: 'Event Calendar', href: '/events/calendar' },
        { name: 'Past Events', href: '/events/past' },
        { name: 'Create Event (Admin)', href: '/events/create' },
      ]
    },
    {
      title: 'Campus Access',
      links: [
        { name: 'QR Code Scanner', href: '/campus-access/scanner' },
        { name: 'My Access Pass', href: '/campus-access/pass' },
        { name: 'Access History', href: '/campus-access/history' },
        { name: 'Request Access', href: '/campus-access/request' },
      ]
    },
    {
      title: 'Alumni Services',
      links: [
        { name: 'Alumni Portal', href: '/alumni' },
        { name: 'Job Board', href: '/alumni/jobs' },
        { name: 'Mentorship Program', href: '/alumni/mentorship' },
        { name: 'Alumni Directory', href: '/alumni/directory' },
        { name: 'Events & Reunions', href: '/alumni/events' },
      ]
    },
    {
      title: 'Career Services',
      links: [
        { name: 'Job Opportunities', href: '/careers/jobs' },
        { name: 'Internships', href: '/careers/internships' },
        { name: 'Career Counseling', href: '/careers/counseling' },
        { name: 'Resume Builder', href: '/careers/resume' },
        { name: 'Interview Preparation', href: '/careers/interview-prep' },
      ]
    },
    {
      title: 'Academic Resources',
      links: [
        { name: 'Library', href: '/resources/library' },
        { name: 'Course Catalog', href: '/resources/catalog' },
        { name: 'Academic Calendar', href: '/resources/calendar' },
        { name: 'Tutoring Services', href: '/resources/tutoring' },
        { name: 'Study Groups', href: '/resources/study-groups' },
      ]
    },
    {
      title: 'Support & Help',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'FAQs', href: '/help/faq' },
        { name: 'Chatbot Support', href: '/help/chatbot' },
        { name: 'Technical Support', href: '/help/technical' },
        { name: 'Submit a Ticket', href: '/help/ticket' },
      ]
    },
    {
      title: 'Notifications',
      links: [
        { name: 'All Notifications', href: '/notifications' },
        { name: 'Notification Settings', href: '/notifications/settings' },
        { name: 'Email Preferences', href: '/notifications/email' },
      ]
    },
    {
      title: 'Legal & Policies',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms-of-service' },
        { name: 'Accessibility Statement', href: '/accessibility' },
        { name: 'Cookie Policy', href: '/cookie-policy' },
        { name: 'Data Protection', href: '/data-protection' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sitemap</h1>
            <p className="text-lg text-gray-600">
              Navigate through all pages and features of our Campus Management System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapSections.map((section, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center group"
                      >
                        <span className="mr-2 text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help Finding Something?</h3>
              <p className="text-gray-700 mb-4">
                If you can't find what you're looking for, try using our search feature or contact support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Visit Help Center
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last Updated: October 2, 2025</p>
            <p className="mt-2">
              This sitemap is automatically updated as new features are added to the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
