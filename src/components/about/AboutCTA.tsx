'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function AboutCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      {/* Morphing Blobs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 px-4">
            Ready to Join PCC?
          </h2>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed px-4">
            Start your journey towards excellence. Be part of a community that shapes the future.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <motion.button
              className="w-full sm:w-auto group px-8 sm:px-10 py-4 sm:py-5 bg-white text-blue-600 rounded-full font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              Apply Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
            </motion.button>

            <motion.button
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 border-2 border-white text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Visit
            </motion.button>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-white/90 text-sm sm:text-base px-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">✓</span>
              <span>No Application Fee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">✓</span>
              <span>Scholarships Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">✓</span>
              <span>Rolling Admissions</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
