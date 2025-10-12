'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';

const urgentAnnouncements = [
  "🎓 Spring 2025 Enrollment is NOW OPEN - Apply Today!",
  "📅 Annual Awards Ceremony - December 20, 2024",
  "🏆 PCC wins Regional Academic Excellence Award",
  "💻 New Computer Laboratory now available for students",
  "📚 Library extended hours during finals week"
];

export function AnnouncementsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [direction, setDirection] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % urgentAnnouncements.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + urgentAnnouncements.length) % urgentAnnouncements.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % urgentAnnouncements.length);
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: 1,
        height: 'auto'
      }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 py-3 px-4 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Bell Icon */}
        <div className="flex-shrink-0 bg-blue-900 rounded-full p-2">
          <motion.div
            animate={{ rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bell className="h-4 w-4 text-yellow-400" />
          </motion.div>
        </div>

        {/* Navigation Button - Previous */}
        <button
          onClick={handlePrevious}
          className="hidden sm:flex flex-shrink-0 hover:bg-yellow-600 rounded-full p-1.5 transition-all duration-200"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Announcement Text with Animation */}
        <div className="flex-1 overflow-hidden relative h-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ 
                x: direction > 0 ? 100 : -100,
                opacity: 0,
              }}
              animate={{ 
                x: 0,
                opacity: 1,
              }}
              exit={{ 
                x: direction > 0 ? -100 : 100,
                opacity: 0,
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="font-semibold text-sm md:text-base text-center px-4">
                {urgentAnnouncements[currentIndex]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Button - Next */}
        <button
          onClick={handleNext}
          className="hidden sm:flex flex-shrink-0 hover:bg-yellow-600 rounded-full p-1.5 transition-all duration-200"
          aria-label="Next announcement"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Indicator Dots */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {urgentAnnouncements.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-900 w-6' 
                  : 'bg-blue-900/40 hover:bg-blue-900/60'
              }`}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>

        {/* Close Button */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:bg-yellow-600 rounded-full p-1.5 transition-colors duration-200 flex-shrink-0"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
