'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  stats: { label: string; value: string }[];
}

export function ProgramsShowcase() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const programs: Program[] = [
    {
      id: 'ai',
      title: 'Artificial Intelligence',
      description: 'Master the future of technology with quantum computing and neural networks',
      icon: '🤖',
      gradient: 'var(--neural-gradient-1)',
      stats: [
        { label: 'Duration', value: '4 Years' },
        { label: 'Students', value: '5,000+' },
      ],
    },
    {
      id: 'quantum',
      title: 'Quantum Physics',
      description: 'Explore the mysteries of the quantum realm and shape reality',
      icon: '⚛️',
      gradient: 'var(--neural-gradient-2)',
      stats: [
        { label: 'Duration', value: '4 Years' },
        { label: 'Students', value: '3,500+' },
      ],
    },
    {
      id: 'biotech',
      title: 'Biotechnology',
      description: 'Engineer life itself with genetic modification and synthetic biology',
      icon: '🧬',
      gradient: 'var(--neural-gradient-3)',
      stats: [
        { label: 'Duration', value: '4 Years' },
        { label: 'Students', value: '4,200+' },
      ],
    },
    {
      id: 'space',
      title: 'Space Engineering',
      description: 'Design spacecraft and habitats for interstellar colonization',
      icon: '🚀',
      gradient: 'var(--neural-gradient-4)',
      stats: [
        { label: 'Duration', value: '5 Years' },
        { label: 'Students', value: '2,800+' },
      ],
    },
    {
      id: 'neural',
      title: 'Neural Interface',
      description: 'Connect minds with machines through brain-computer interfaces',
      icon: '🧠',
      gradient: 'var(--neural-gradient-5)',
      stats: [
        { label: 'Duration', value: '4 Years' },
        { label: 'Students', value: '3,100+' },
      ],
    },
    {
      id: 'energy',
      title: 'Fusion Energy',
      description: 'Harness the power of stars to fuel civilization',
      icon: '⚡',
      gradient: 'var(--neural-gradient-1)',
      stats: [
        { label: 'Duration', value: '4 Years' },
        { label: 'Students', value: '2,500+' },
      ],
    },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto mb-20 text-center"
      >
        <h2 className="text-6xl md:text-7xl font-bold mb-6 holographic-text">
          Future-Ready Programs
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Cutting-edge education designed for the challenges and opportunities of tomorrow
        </p>
      </motion.div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(program.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group"
            >
              <div className="neural-card h-full relative overflow-hidden">
                {/* Gradient Background */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: program.gradient }}
                />

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: hoveredId === program.id ? 1.2 : 1,
                    rotate: hoveredId === program.id ? 360 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl mb-6"
                >
                  {program.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:holographic-text transition-all">
                  {program.title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {program.description}
                </p>

                {/* Stats */}
                <div className="flex gap-4 mb-6">
                  {program.stats.map((stat) => (
                    <div key={stat.label} className="quantum-glass rounded-lg px-4 py-2">
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <div className="text-sm font-semibold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full quantum-glass rounded-full py-3 text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-all"
                >
                  Learn More →
                </motion.button>

                {/* Holographic Border Effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  animate={{
                    opacity: hoveredId === program.id ? 1 : 0,
                  }}
                  style={{
                    background: `linear-gradient(90deg, transparent, ${program.gradient}, transparent)`,
                    filter: 'blur(20px)',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center mt-16"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="quantum-btn text-lg px-12 py-4"
        >
          View All Programs
        </motion.button>
      </motion.div>
    </section>
  );
}
