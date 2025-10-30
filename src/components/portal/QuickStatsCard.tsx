'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { timing, easing, hoverLift, hoverScale } from '@/lib/animations';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  delay = 0,
}: QuickStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ 
        y: hoverLift.prominent, 
        scale: hoverScale.subtle,
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
        transition: { duration: timing.fast, ease: easing.smooth } 
      }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-pointer"
    >
      {/* Main Card */}
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:border-gray-300">
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Floating Background Icons */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: delay + 0.5 }}
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-2 right-2"
          >
            <Icon className="h-8 w-8 text-gray-400" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              x: [0, -10, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-2 left-2"
          >
            <Icon className="h-6 w-6 text-gray-300" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="relative">
          {/* Icon and Trend Row */}
          <div className="flex items-center justify-between mb-2">
            <motion.div 
              className={`p-2 bg-gradient-to-br ${gradient} rounded-lg`}
              whileHover={{ 
                rotate: 360, 
                scale: 1.1,
                transition: { duration: timing.slow, ease: easing.smooth }
              }}
            >
              <Icon className="h-4 w-4 text-white" />
            </motion.div>
            
            {/* Trend Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 rounded-md"
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: easing.smooth }}
              >
                <TrendingUp className="h-2.5 w-2.5 text-green-600" />
              </motion.div>
              <span className="text-[10px] font-semibold text-green-600">+12%</span>
            </motion.div>
          </div>

          {/* Value */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1 }}
            className="mb-1.5"
          >
            <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </div>
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.15 }}
          >
            <h3 className="text-xs font-semibold text-gray-900 mb-0.5 leading-tight">
              {title}
            </h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
