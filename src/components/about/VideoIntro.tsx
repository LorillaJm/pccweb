'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export function VideoIntro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section ref={ref} className="py-24 px-4 relative bg-white">
      <div className="container mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-20 text-gray-900 px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Experience PCC Campus
        </motion.h2>

        <motion.div
          className="relative max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Video Placeholder with Gradient */}
          <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-indigo-700">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
              animate={{ opacity: isPlaying ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center group shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
                ) : (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 ml-1 sm:ml-2" />
                )}
              </motion.button>
            </motion.div>

            {/* Video Content Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <motion.div
                  className="text-5xl sm:text-6xl md:text-8xl mb-2 sm:mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎓
                </motion.div>
                <p className="text-lg sm:text-xl md:text-2xl text-white font-semibold">Campus Tour Video</p>
                <p className="text-sm sm:text-base text-blue-100 mt-1 sm:mt-2">Click play to watch</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Description */}
        <motion.div
          className="mt-8 sm:mt-12 text-center max-w-3xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            Take a virtual tour of our beautiful campus, explore our state-of-the-art facilities,
            and see what makes PCC the perfect place for your educational journey.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
