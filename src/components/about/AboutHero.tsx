'use client';

import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Award, Globe, Lightbulb } from 'lucide-react';
import HeroMorph from '@/components/animations/HeroMorph';
import { useParallax } from '@/hooks/useParallax';

export function AboutHero() {
  const { y: scrollY } = useParallax({ intensity: 0.5 });
  
  const floatingIcons = [
    { Icon: GraduationCap, delay: 0, x: '10%', y: '20%' },
    { Icon: BookOpen, delay: 0.5, x: '80%', y: '15%' },
    { Icon: Users, delay: 1, x: '15%', y: '70%' },
    { Icon: Award, delay: 1.5, x: '85%', y: '75%' },
    { Icon: Globe, delay: 2, x: '70%', y: '40%' },
    { Icon: Lightbulb, delay: 2.5, x: '25%', y: '45%' },
  ];

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
      {/* Professional Educational Background with HeroMorph */}
      <div className="absolute inset-0 z-0">
        {/* HeroMorph Background */}
        <HeroMorph 
          className="absolute inset-0"
          colors={['#3B82F6', '#6366F1', '#8B5CF6', '#06B6D4']}
          intensity={0.3}
        />
        
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-indigo-100/40" />
        
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }} 
          />
        </div>

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-400/20 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-emerald-400/15 via-teal-400/10 to-blue-400/15 rounded-full blur-3xl"
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

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-gradient-to-r from-amber-400/10 via-orange-400/8 to-red-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating Educational Icons */}
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute hidden sm:block"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360],
            }}
            transition={{
              duration: 12 + index * 2,
              repeat: Infinity,
              delay: delay,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-8 h-8 lg:w-12 lg:h-12 text-blue-600/20" />
          </motion.div>
        ))}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath d='M0 0h1v1H0V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }} 
          />
        </div>
      </div>

      {/* Content with Parallax */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 text-center"
        style={{ y: scrollY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* College Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GraduationCap className="w-4 h-4" />
            Passi City College - Excellence in Education
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 px-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PCC Portal
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Empowering minds, shaping futures. We are committed to excellence in education,
            innovation, and creating leaders who will make a positive impact on our community and beyond.
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              { number: '70+', label: 'Years of Excellence' },
              { number: '10K+', label: 'Students Served' },
              { number: '500+', label: 'Faculty & Staff' },
              { number: '50+', label: 'Programs Offered' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg text-sm sm:text-base relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Explore Our Story</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
            <motion.button 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 text-sm sm:text-base shadow-lg"
              whileHover={{ scale: 1.05, borderColor: '#3B82F6' }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center bg-white/50 backdrop-blur-sm">
            <motion.div 
              className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
