'use client';

import { Play, X } from 'lucide-react';
import { useState } from 'react';

export function CampusTour() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section id="campus-tour" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Experience Our Campus
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Take a virtual tour of our state-of-the-art facilities and vibrant campus life
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setIsVideoOpen(true)}>
          {/* Thumbnail */}
          <div className="relative h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&fit=crop"
              alt="Campus Tour"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Play className="h-12 w-12 text-blue-900 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Text Overlay */}
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl font-bold mb-2">Virtual Campus Tour</h3>
              <p className="text-lg text-gray-200">Click to explore our beautiful campus</p>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsVideoOpen(false)}>
            <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-yellow-400 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Campus Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Campus Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { title: 'Modern Classrooms', count: '50+' },
            { title: 'Computer Labs', count: '10+' },
            { title: 'Library Books', count: '20K+' },
            { title: 'Sports Facilities', count: '5+' }
          ].map((item, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{item.count}</div>
              <div className="text-gray-300">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
