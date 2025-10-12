'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function FuturisticHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  useEffect(() => {
    // Create particle system
    const container = containerRef.current;
    if (!container) return;

    const particleContainer = container.querySelector('.particle-container');
    if (!particleContainer) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 4}s`;
      particle.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 200}px`);
      particle.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 200}px`);
      particleContainer.appendChild(particle);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle System */}
      <div className="particle-container" />

      {/* Animated Background Orbs */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="absolute w-96 h-96 rounded-full holographic opacity-20 blur-3xl quantum-float" />
        <div className="absolute w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl quantum-float" style={{ animationDelay: '2s' }} />
        <div className="absolute w-72 h-72 rounded-full bg-cyan-500 opacity-20 blur-3xl quantum-float" style={{ animationDelay: '4s' }} />
      </motion.div>

      {/* Hero Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6 holographic-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            Welcome to the Future
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Experience education reimagined for the year 3000. Where innovation meets excellence.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quantum-btn text-lg px-10 py-4"
          >
            Explore Programs
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quantum-glass px-10 py-4 rounded-full text-lg font-semibold text-white border-2 border-white/20 hover:border-white/40 transition-all"
          >
            Virtual Tour
          </motion.button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          {[
            { value: '50K+', label: 'Students' },
            { value: '200+', label: 'Programs' },
            { value: '95%', label: 'Success Rate' },
            { value: '150+', label: 'Countries' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="neural-card text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="holographic-text text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
