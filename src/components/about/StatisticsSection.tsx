'use client';

import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Users, BookOpen, Award, GraduationCap } from 'lucide-react';

const stats = [
  { icon: Users, value: 10000, suffix: '+', label: 'Active Students', color: 'blue' },
  { icon: BookOpen, value: 50, suffix: '+', label: 'Programs Offered', color: 'indigo' },
  { icon: Award, value: 100, suffix: '+', label: 'Expert Faculty', color: 'teal' },
  { icon: GraduationCap, value: 25000, suffix: '+', label: 'Alumni Network', color: 'purple' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const displayValue = useMotionValue('0');

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      displayValue.set(Math.floor(latest).toLocaleString());
    });
  }, [springValue, displayValue]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

export function StatisticsSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-1/4 right-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Award className="w-4 h-4" />
            Our Impact
          </motion.div>
          
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Achievements in <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Numbers</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Measurable excellence across all dimensions of education
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.label}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200 text-center shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </motion.div>

                    {/* Animated Number */}
                    <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-700 bg-clip-text text-transparent`}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>

                    {/* Label */}
                    <p className="text-gray-600 text-base sm:text-lg font-medium group-hover:text-gray-800 transition-colors">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
