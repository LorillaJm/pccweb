'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

export function NewsEventsSection() {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');

  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Breakthrough in Quantum Computing Research',
      category: 'Research',
      date: 'Oct 1, 3000',
      image: '🔬',
      excerpt: 'Our researchers achieved quantum supremacy with a 1000-qubit processor',
    },
    {
      id: '2',
      title: 'New Mars Campus Opening 3001',
      category: 'Campus',
      date: 'Sep 28, 3000',
      image: '🏛️',
      excerpt: 'Expanding education beyond Earth with our first interplanetary campus',
    },
    {
      id: '3',
      title: 'AI Ethics Summit Highlights',
      category: 'Events',
      date: 'Sep 25, 3000',
      image: '🤝',
      excerpt: 'Leading minds discuss the future of artificial consciousness',
    },
  ];

  const events: NewsItem[] = [
    {
      id: '1',
      title: 'Annual Tech Innovation Fair',
      category: 'Fair',
      date: 'Oct 15, 3000',
      image: '🎪',
      excerpt: 'Showcase your projects to industry leaders and investors',
    },
    {
      id: '2',
      title: 'Holographic Guest Lecture Series',
      category: 'Lecture',
      date: 'Oct 20, 3000',
      image: '👨‍🏫',
      excerpt: 'Nobel laureates beam in from across the galaxy',
    },
    {
      id: '3',
      title: 'Interstellar Sports Championship',
      category: 'Sports',
      date: 'Nov 5, 3000',
      image: '🏆',
      excerpt: 'Zero-gravity competitions with universities across star systems',
    },
  ];

  const items = activeTab === 'news' ? newsItems : events;

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 holographic-text">
            News & Events
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay connected with the latest happenings across our quantum campus
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="quantum-glass rounded-full p-2 flex gap-2">
            {(['news', 'events'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 holographic rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="neural-card group cursor-pointer"
            >
              {/* Image/Icon */}
              <div className="w-full h-48 rounded-2xl quantum-glass mb-6 flex items-center justify-center text-7xl overflow-hidden relative">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  {item.image}
                </motion.div>
                <div className="absolute inset-0 holographic opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </div>

              {/* Category & Date */}
              <div className="flex items-center gap-3 mb-4">
                <span className="quantum-glass px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">
                  {item.category}
                </span>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 text-white group-hover:holographic-text transition-all">
                {item.title}
              </h3>

              {/* Excerpt */}
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {item.excerpt}
              </p>

              {/* Read More */}
              <motion.div
                className="flex items-center gap-2 text-cyan-400 font-semibold text-sm group-hover:gap-4 transition-all"
                whileHover={{ x: 5 }}
              >
                <span>Read More</span>
                <span>→</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quantum-btn text-lg px-12 py-4"
          >
            View All {activeTab === 'news' ? 'News' : 'Events'}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
