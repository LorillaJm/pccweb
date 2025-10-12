'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      value: 'admissions@university3000.edu',
      gradient: 'var(--neural-gradient-1)',
    },
    {
      icon: '📞',
      title: 'Holophone',
      value: '+1 (555) 3000-UNIV',
      gradient: 'var(--neural-gradient-2)',
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'Quantum Campus, Earth & Mars',
      gradient: 'var(--neural-gradient-3)',
    },
    {
      icon: '🌐',
      title: 'Virtual Portal',
      value: 'portal.university3000.edu',
      gradient: 'var(--neural-gradient-4)',
    },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full holographic opacity-10 blur-3xl quantum-float" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-cyan-500 opacity-10 blur-3xl quantum-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 holographic-text">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to join the future? Reach out across space and time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="neural-card p-8">
              <h3 className="text-3xl font-bold mb-8 text-white">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full quantum-glass rounded-xl px-6 py-4 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:neural-glow-sm transition-all outline-none"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full quantum-glass rounded-xl px-6 py-4 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:neural-glow-sm transition-all outline-none"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full quantum-glass rounded-xl px-6 py-4 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:neural-glow-sm transition-all outline-none"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full quantum-glass rounded-xl px-6 py-4 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:neural-glow-sm transition-all outline-none resize-none"
                    placeholder="Tell us more..."
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full quantum-btn py-4 text-lg"
                >
                  Send Message
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="neural-card p-8">
              <h3 className="text-3xl font-bold mb-8 text-white">Contact Information</h3>
              
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-4 p-4 quantum-glass rounded-xl cursor-pointer group"
                  >
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="text-4xl"
                    >
                      {method.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-400 mb-1">
                        {method.title}
                      </h4>
                      <p className="text-white font-medium group-hover:holographic-text transition-all">
                        {method.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="neural-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Connect With Us</h3>
              
              <div className="flex gap-4">
                {['🌐', '📱', '💬', '📺'].map((icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 quantum-glass rounded-full flex items-center justify-center text-2xl hover:neural-glow-sm transition-all"
                  >
                    {icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="neural-card p-8 h-64 flex items-center justify-center relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 holographic opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="text-center relative z-10">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-400">Interactive Quantum Map</p>
                <p className="text-sm text-gray-500 mt-2">Click to explore our campuses</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
