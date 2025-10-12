'use client';

import { motion } from 'framer-motion';
import { BookOpen, Target, Heart, Lightbulb, Users, Award } from 'lucide-react';
import PremiumCard from '@/components/premium/PremiumCard';
import SVGLineDraw, { AnimatedIcon } from '@/components/animations/SVGLineDraw';

const values = [
  {
    icon: BookOpen,
    title: 'Education Excellence',
    description: 'Providing world-class education with cutting-edge curriculum and teaching methods.',
    color: 'blue',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Fostering creativity and innovative thinking to solve tomorrow\'s challenges.',
    color: 'indigo',
  },
  {
    icon: Users,
    title: 'Integrity',
    description: 'Building character and ethical leadership through transparent practices.',
    color: 'teal',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Striving for excellence in every aspect of academic and personal growth.',
    color: 'purple',
  },
  {
    icon: Heart,
    title: 'Community',
    description: 'Creating a supportive and inclusive environment for all students.',
    color: 'rose',
  },
  {
    icon: Award,
    title: 'Achievement',
    description: 'Celebrating success and empowering students to reach their full potential.',
    color: 'amber',
  },
];

export function MissionVisionValues() {
  return (
    <section className="py-24 px-4 relative bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-blue-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -25, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <div className="container mx-auto relative z-10">
        {/* Mission & Vision */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full text-emerald-700 font-medium text-sm mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Target className="w-4 h-4" />
            Our Foundation
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 px-4">
            Our Mission & <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Vision</span>
          </h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Guiding principles that shape our commitment to excellence in education
          </motion.p>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <PremiumCard className="p-6 sm:p-8 h-full">
                <AnimatedIcon 
                  icon={Target} 
                  size={48} 
                  className="text-blue-600 mb-4 mx-auto" 
                  duration={2}
                  delay={0.2}
                />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To provide accessible, high-quality education that empowers students with knowledge,
                  skills, and values to become responsible global citizens and leaders.
                </p>
              </PremiumCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <PremiumCard className="p-6 sm:p-8 h-full">
                <AnimatedIcon 
                  icon={Lightbulb} 
                  size={48} 
                  className="text-indigo-600 mb-4 mx-auto" 
                  duration={2}
                  delay={0.4}
                />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be a leading institution recognized for academic excellence, innovation,
                  and producing graduates who make meaningful contributions to society.
                </p>
              </PremiumCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Values */}
        <div>
          <motion.h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Core <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Values</span>
          </motion.h3>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The principles that drive everything we do
          </motion.p>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-14 h-14 mb-4 rounded-2xl bg-${value.color}-100 flex items-center justify-center`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <value.icon className={`w-7 h-7 text-${value.color}-600`} />
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">{value.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
