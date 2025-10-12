'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';

export function FuturisticNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'programs', label: 'Programs', href: '/programs' },
    { id: 'admissions', label: 'Admissions', href: '/admissions' },
    { id: 'news', label: 'News & Events', href: '/news' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Neural Network Background */}
      <div className="neural-network-bg" />
      
      <motion.nav
        style={{ opacity: navOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="quantum-glass-intense rounded-full px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full holographic flex items-center justify-center neural-glow-md"
              >
                <span className="text-white font-bold text-xl">U</span>
              </motion.div>
              <span className="holographic-text text-2xl font-bold hidden md:block">
                University 3000
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setActiveSection(item.id)}
                    className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 holographic rounded-full"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="hidden md:block quantum-glass rounded-full p-3 neural-glow-sm"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </motion.button>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="quantum-btn hidden md:block"
            >
              Apply Now
            </motion.button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden quantum-glass rounded-full p-3 neural-glow-sm"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Desktop Search Bar */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <SearchBar 
                variant="futuristic"
                placeholder="Search programs, news, events..."
                onClose={() => setShowSearch(false)}
              />
            </motion.div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 px-6 pb-6"
          >
            <div className="quantum-glass-intense rounded-2xl p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="pt-4 border-t border-white/10">
                <SearchBar 
                  variant="futuristic"
                  placeholder="Search..."
                  className="w-full"
                />
              </div>

              {/* Mobile CTA */}
              <button className="w-full quantum-btn mt-4">
                Apply Now
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}
