'use client';

import { motion } from 'framer-motion';

/**
 * Simple test component to verify Framer Motion is working
 */
export default function FramerMotionTest() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-blue-500 text-white rounded-lg"
    >
      ✓ Framer Motion is working!
    </motion.div>
  );
}
