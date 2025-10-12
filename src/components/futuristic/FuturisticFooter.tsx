'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function FuturisticFooter() {
  const footerSections = [
    {
      title: 'About',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Mission & Vision', href: '/mission' },
        { label: 'Leadership', href: '/leadership' },
        { label: 'Accreditation', href: '/accreditation' },
      ],
    },
    {
      title: 'Programs',
      links: [
        { label: 'Undergraduate', href: '/programs/undergraduate' },
        { label: 'Graduate', href: '/programs/graduate' },
        { label: 'Research', href: '/programs/research' },
        { label: 'Online Learning', href: '/programs/online' },
      ],
    },
    {
      title: 'Admissions',
      links: [
        { label: 'Apply Now', href: '/admissions/apply' },
        { label: 'Requirements', href: '/admissions/requirements' },
        { label: 'Scholarships', href: '/admissions/scholarships' },
        { label: 'Visit Campus', href: '/admissions/visit' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Student Portal', href: '/portal/student' },
        { label: 'Library', href: '/library' },
        { label: 'Career Services', href: '/careers' },
        { label: 'Support', href: '/support' },
      ],
    },
  ];

  return (
    <footer className="relative py-20 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-1 holographic-divider" />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full holographic opacity-5 blur-3xl" />
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-purple-500 opacity-5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="flex items-center space-x-3 mb-6 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full holographic flex items-center justify-center neural-glow-md"
                >
                  <span className="text-white font-bold text-2xl">U</span>
                </motion.div>
                <span className="holographic-text text-3xl font-bold">
                  University 3000
                </span>
              </Link>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Pioneering education for the next millennium. Where innovation meets excellence across the cosmos.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {['🌐', '📱', '💬', '📺', '🎮'].map((icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 quantum-glass rounded-full flex items-center justify-center text-xl hover:neural-glow-sm transition-all"
                  >
                    {icon}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:holographic-text transition-all inline-block"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="neural-card p-8 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Connected
              </h3>
              <p className="text-gray-400">
                Get the latest updates from across the quantum realm
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 quantum-glass rounded-full px-6 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:neural-glow-sm transition-all outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="quantum-btn px-8"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © 3000 University 3000. All rights reserved across all dimensions.
            </p>
            
            <div className="flex gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Quantum Signature */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-600 holographic-shimmer">
              Powered by Quantum Computing • Secured by Neural Encryption
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
