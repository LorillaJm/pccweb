'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Calendar, IdCard, Briefcase, Users, MessageSquare } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Events', href: '/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Digital ID', href: '/digital-id', icon: <IdCard className="w-5 h-5" /> },
    { label: 'Internships', href: '/internships', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Alumni', href: '/alumni', icon: <Users className="w-5 h-5" /> },
    { label: 'Chat', href: '/chatbot', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <nav
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-20 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium text-gray-700">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
