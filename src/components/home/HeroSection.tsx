'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Play, GraduationCap, Users, BookOpen, Award } from 'lucide-react';
import { HeroMorph } from '@/components/animations/HeroMorph';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { premiumTheme } from '@/styles/theme';

export function HeroSection() {
  const [stats, setStats] = useState({
    students: 0,
    programs: 0,
    faculty: 0,
    years: 0
  });
  const [mounted, setMounted] = useState(false);

  // Only generate particles on client side
  const particles = useMemo(() => {
    if (!mounted) return [];
    return [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated counter effect
  useEffect(() => {
    const targets = { students: 2500, programs: 15, faculty: 150, years: 25 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        students: Math.floor(targets.students * progress),
        programs: Math.floor(targets.programs * progress),
        faculty: Math.floor(targets.faculty * progress),
        years: Math.floor(targets.years * progress)
      });

      if (currentStep >= steps) {
        setStats(targets);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #4338ca 100%)',
        marginTop: '0',
      }}
    >
      {/* HeroMorph animated background with parallax */}
      <HeroMorph 
        colors={premiumTheme.colors.gradients.hero}
        speed={1}
        parallaxIntensity={0.5}
        className="z-0"
      />
      
      {/* Modern gradient overlay with mesh effect */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(96, 165, 250, 0.3) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 text-center">
        {/* Main Content */}
        <div className="mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <Award className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Award-Winning Institution</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
          >
            Welcome to <br />
            <span className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              Passi City College
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 max-w-4xl mx-auto text-white/90"
          >
            Shaping Tomorrow's Leaders Through Excellence in Education
          </motion.p>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-blue-100"
          >
            Empowering students with world-class education, innovative learning, and global opportunities
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/admissions" 
                className="group relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-2xl hover:shadow-yellow-500/50"
              >
                <span className="relative z-10 flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Apply Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/programs" 
                className="group px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-xl"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Programs
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button 
                className="group px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-xl"
                onClick={() => {
                  const videoSection = document.getElementById('campus-tour');
                  videoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Campus Tour
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: Users, value: stats.students, label: 'Students', suffix: '+', desc: 'Enrolled Annually' },
            { icon: BookOpen, value: stats.programs, label: 'Programs', suffix: '+', desc: 'Academic Courses' },
            { icon: GraduationCap, value: stats.faculty, label: 'Faculty', suffix: '+', desc: 'Expert Educators' },
            { icon: Award, value: stats.years, label: 'Years', suffix: '+', desc: 'Of Excellence' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-yellow-400/20 group-hover:bg-yellow-400/30 transition-colors duration-300">
                  <stat.icon className="h-6 w-6 text-yellow-400" />
                </div>
              </div>

              {/* Value */}
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>

              {/* Label */}
              <div className="font-semibold text-lg text-white/90 mb-1">
                {stat.label}
              </div>

              {/* Description */}
              <div className="text-sm text-blue-200">
                {stat.desc}
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center cursor-pointer hover:border-white transition-colors"
          onClick={() => {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
