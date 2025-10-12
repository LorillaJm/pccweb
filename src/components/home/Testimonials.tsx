'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Maria Santos',
    role: 'BS Computer Science Graduate',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    quote: 'PCC provided me with the skills and confidence to land my dream job at a top tech company. The faculty are incredibly supportive and the facilities are world-class.',
    company: 'Software Engineer at Google',
    rating: 5
  },
  {
    id: 2,
    name: 'Juan Dela Cruz',
    role: 'BS Business Administration Graduate',
    year: '2022',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    quote: 'The business program at PCC equipped me with practical knowledge and entrepreneurial mindset. I now run my own successful startup thanks to what I learned here.',
    company: 'CEO & Founder, TechStart PH',
    rating: 5
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    role: 'BS Education Graduate',
    year: '2021',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    quote: 'PCC shaped me into the educator I am today. The teaching methodologies and hands-on experience prepared me perfectly for my career in education.',
    company: 'Senior Teacher, International School',
    rating: 5
  },
  {
    id: 4,
    name: 'Miguel Rodriguez',
    role: 'BS Nursing Graduate',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    quote: 'The nursing program exceeded my expectations. The clinical training and compassionate faculty prepared me to serve patients with excellence and care.',
    company: 'Registered Nurse, St. Luke\'s Medical Center',
    rating: 5
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4 mr-2 fill-current" />
            <span className="font-semibold text-sm">SUCCESS STORIES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Student & Alumni Testimonials
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Hear from our graduates who are making a difference in their fields
          </p>
        </div>

        <div className="relative">
          {/* Main Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <Quote className="h-16 w-16 text-yellow-400 mb-6 opacity-50" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img 
                  src={current.image}
                  alt={current.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-xl"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-white mb-6 leading-relaxed italic">
                  "{current.quote}"
                </p>
                <div>
                  <h4 className="text-2xl font-bold text-yellow-400 mb-1">{current.name}</h4>
                  <p className="text-blue-200 font-semibold">{current.role} • Class of {current.year}</p>
                  <p className="text-blue-300 text-sm mt-2">{current.company}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/20">
              <button 
                onClick={prevTestimonial}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-yellow-400' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={nextTestimonial}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Thumbnail Preview */}
          <div className="hidden lg:flex justify-center gap-4 mt-8">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex 
                    ? 'opacity-100 scale-110' 
                    : 'opacity-50 hover:opacity-75 scale-100'
                }`}
              >
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
