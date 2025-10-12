'use client';

import { motion } from 'framer-motion';

export function MorphingBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Blob 1 - Elegant Blue */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 - Soft Purple */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 3 - Subtle Teal */}
      <motion.div
        className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-teal-400/15 to-blue-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
