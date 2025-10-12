'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    date: 'December 15, 2024',
    title: 'Spring 2025 Enrollment Now Open',
    excerpt: 'Registration for the Spring 2025 semester is now open. Secure your spot in your preferred program today.',
    category: 'Admissions',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop'
  },
  {
    id: 2,
    date: 'December 10, 2024',
    title: 'Annual Awards Ceremony 2024',
    excerpt: 'Join us in celebrating our outstanding students and faculty members at our Annual Awards Ceremony.',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=250&fit=crop'
  },
  {
    id: 3,
    date: 'December 5, 2024',
    title: 'New Computer Laboratory Opens',
    excerpt: 'State-of-the-art computer laboratory with the latest technology is now available for student use.',
    category: 'Facilities',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop'
  },
  {
    id: 4,
    date: 'December 1, 2024',
    title: 'International Partnership Program',
    excerpt: 'PCC announces new partnerships with universities in Asia and Europe for student exchange programs.',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop'
  }
];

export function LatestNews() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="font-semibold text-sm">LATEST UPDATES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            News & Announcements
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest news, events, and achievements at PCC
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {newsItems.map((item) => (
            <div 
              key={item.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3 text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {item.date}
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.excerpt}
                </p>
                <Link 
                  href={`/news/${item.id}`}
                  className="text-blue-600 font-semibold hover:text-blue-800 inline-flex items-center text-sm group-hover:translate-x-1 transition-transform"
                >
                  Read More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/news" 
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            View All News & Events
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
