'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Thompson',
    role: 'Computer Science Graduate',
    year: '2023',
    text: 'PCC provided me with the perfect blend of theoretical knowledge and practical skills. The faculty support and modern facilities helped me land my dream job at a top tech company.',
    rating: 5,
  },
  {
    name: 'Maria Garcia',
    role: 'Engineering Student',
    year: '2024',
    text: 'The innovation labs and research opportunities at PCC are exceptional. I\'ve been able to work on cutting-edge projects that have prepared me for a successful career.',
    rating: 5,
  },
  {
    name: 'Prof. John Davis',
    role: 'Faculty Member',
    year: '10 Years',
    text: 'Teaching at PCC has been incredibly rewarding. The institution\'s commitment to excellence and student success creates an inspiring environment for both educators and learners.',
    rating: 5,
  },
  {
    name: 'Sarah Kim',
    role: 'Business Administration Alumni',
    year: '2022',
    text: 'The networking opportunities and career guidance at PCC were invaluable. The alumni network continues to support my professional growth even after graduation.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto relative z-10">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-20 text-gray-900 px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          What Our Community Says
        </motion.h2>

        <div className="max-w-4xl mx-auto relative">
          {/* Testimonial Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="relative"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6 sm:p-8 md:p-12 rounded-3xl bg-gray-50 border border-gray-200 shadow-lg">
                {/* Quote Icon */}
                <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600/20 mb-4 sm:mb-6" />

                {/* Testimonial Text */}
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 sm:mb-8 italic">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Rating Stars */}
                <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-xl sm:text-2xl text-amber-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white flex-shrink-0">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm sm:text-base text-blue-600">{testimonials[currentIndex].role}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Class of {testimonials[currentIndex].year}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-blue-600 transition-all shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <motion.button
              className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-blue-600 transition-all shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
