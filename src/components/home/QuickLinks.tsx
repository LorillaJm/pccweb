'use client';

import Link from 'next/link';
import { FileText, UserPlus, BookOpen, Laptop, Map, Calendar } from 'lucide-react';

const quickLinks = [
  {
    icon: FileText,
    title: 'Admission Requirements',
    description: 'View requirements and guidelines',
    href: '/admissions#requirements',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: UserPlus,
    title: 'Enrollment Portal',
    description: 'Apply and enroll online',
    href: '/admissions',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: BookOpen,
    title: 'Student Handbook',
    description: 'Policies and guidelines',
    href: '/student-handbook',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Laptop,
    title: 'E-Learning Portal',
    description: 'Access online classes',
    href: '/portal/student',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Map,
    title: 'Campus Map',
    description: 'Navigate our campus',
    href: '/campus-map',
    color: 'from-teal-500 to-teal-600'
  },
  {
    icon: Calendar,
    title: 'Academic Calendar',
    description: 'Important dates and deadlines',
    href: '/calendar',
    color: 'from-pink-500 to-pink-600'
  }
];

export function QuickLinks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quick Access
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need, just a click away
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
              >
                <div className={`bg-gradient-to-br ${link.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
