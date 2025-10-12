'use client';

import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Briefcase, Globe, Zap } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Accredited Programs',
    description: 'All programs are nationally accredited and recognized worldwide.',
  },
  {
    icon: Users,
    title: 'Expert Faculty',
    description: 'Learn from industry experts and renowned professors.',
  },
  {
    icon: BookOpen,
    title: 'Modern Curriculum',
    description: 'Updated courses aligned with industry standards.',
  },
  {
    icon: Briefcase,
    title: 'Career Support',
    description: 'Dedicated placement cell with 95% placement rate.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'International partnerships and exchange programs.',
  },
  {
    icon: Zap,
    title: 'Innovation Labs',
    description: 'State-of-the-art facilities for hands-on learning.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white">
      {/* Background Morphing Shapes */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full text-emerald-700 font-medium text-sm mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Award className="w-4 h-4" />
            Our Advantages
          </motion.div>
          
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Choose <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">PCC?</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover what makes us the preferred choice for thousands of students
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            
            return (
              <motion.div
                key={reason.title}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200 h-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    {/* Icon with Morph Effect */}
                    <motion.div
                      className="w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:shadow-xl"
                      whileHover={{ borderRadius: '50%', rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-emerald-600 transition-colors">{reason.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{reason.description}</p>
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
