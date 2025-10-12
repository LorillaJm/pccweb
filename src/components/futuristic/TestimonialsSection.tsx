'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Dr. Zara Chen',
      role: 'Quantum Physicist, Class of 2998',
      avatar: '👩‍🔬',
      quote: 'The quantum computing program transformed my understanding of reality itself. The faculty are pioneers, and the facilities are beyond anything on Earth.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'AI Engineer, Class of 2999',
      avatar: '👨‍💻',
      quote: 'Learning neural interface design here opened doors I never knew existed. Now I\'m building the future of human-AI collaboration.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Luna Nakamura',
      role: 'Biotech Researcher, Class of 2997',
      avatar: '👩‍🔬',
      quote: 'The biotechnology labs are equipped with technology from the future. I published my first paper on genetic modification in my second year.',
      rating: 5,
    },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full holographic opacity-10 blur-3xl quantum-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500 opacity-10 blur-3xl quantum-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 holographic-text">
            Student Voices
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hear from those who are shaping the future
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="neural-card text-center p-12 relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 holographic opacity-5" />

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-8xl mb-6 inline-block"
            >
              {testimonials[activeIndex].avatar}
            </motion.div>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed italic"
            >
              "{testimonials[activeIndex].quote}"
            </motion.p>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center gap-2 mb-6"
            >
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="text-3xl"
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>

            {/* Name & Role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h4 className="text-xl font-bold text-white mb-2">
                {testimonials[activeIndex].name}
              </h4>
              <p className="text-gray-400">
                {testimonials[activeIndex].role}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Testimonial Selector */}
        <div className="flex justify-center gap-4">
          {testimonials.map((testimonial, index) => (
            <motion.button
              key={testimonial.id}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative ${
                activeIndex === index ? 'w-16' : 'w-12'
              } h-12 rounded-full transition-all duration-300`}
            >
              <div className={`quantum-glass w-full h-full rounded-full flex items-center justify-center text-2xl ${
                activeIndex === index ? 'neural-glow-md' : ''
              }`}>
                {testimonial.avatar}
              </div>
              {activeIndex === index && (
                <motion.div
                  layoutId="activeTestimonial"
                  className="absolute inset-0 holographic rounded-full opacity-30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-6 mt-12">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
            className="quantum-glass w-14 h-14 rounded-full flex items-center justify-center text-white hover:neural-glow-sm transition-all"
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
            className="quantum-glass w-14 h-14 rounded-full flex items-center justify-center text-white hover:neural-glow-sm transition-all"
          >
            →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
