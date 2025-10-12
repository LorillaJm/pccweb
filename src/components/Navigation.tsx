'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, User, Search, ChevronDown, Globe, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from './home/LanguageSwitcher';
import { SearchBar } from './ui/SearchBar';
import { AnnouncementsTicker } from './home/AnnouncementsTicker';

const navigationItems = [
  { 
    name: 'Home', 
    href: '/',
    description: 'Welcome to our campus'
  },
  { 
    name: 'About', 
    href: '/about',
    description: 'Learn about our institution'
  },
  { 
    name: 'Programs', 
    href: '/programs',
    description: 'Academic programs & courses',
    submenu: [
      { name: 'Undergraduate', href: '/programs#undergraduate' },
      { name: 'Graduate', href: '/programs#graduate' },
      { name: 'Online Programs', href: '/programs#online' },
      { name: 'Continuing Education', href: '/programs#continuing' }
    ]
  },
  { 
    name: 'Admissions', 
    href: '/admissions',
    description: 'Join our community'
  },
  { 
    name: 'News & Events', 
    href: '/news',
    description: 'Latest updates & activities'
  },
  { 
    name: 'Contact', 
    href: '/contact',
    description: 'Get in touch with us'
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // Increased threshold for more obvious transition
      setIsScrolled(scrolled);
      // Debug log (remove in production)
      console.log('Scroll Y:', window.scrollY, 'Is Scrolled:', scrolled);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSubmenu && !(event.target as Element).closest('.submenu-container')) {
        setActiveSubmenu(null);
      }
    };

    // Set initial scroll state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeSubmenu]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Combined Navigation Container */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        {/* Top Bar */}
        <div className={`bg-slate-800 text-slate-300 py-2 hidden lg:block transition-all duration-500 relative z-[200] ${
          isScrolled ? 'opacity-0 -translate-y-full h-0 overflow-hidden' : 'opacity-100 translate-y-0'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+63 33 396 2291</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@passicitycollege.edu.ph</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Passi City, Iloilo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: isScrolled ? 0 : 0 }}
          style={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(20px)' : 'none',
            color: isScrolled ? '#0f172a' : '#ffffff',
            position: isScrolled ? 'fixed' : 'relative',
            top: isScrolled ? 0 : 'auto'
          }}
          className={`transition-all duration-700 ease-in-out search-parent-container shadow-xl w-full relative z-[150] ${
            isScrolled 
              ? 'shadow-slate-900/20' 
              : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900'
          }`}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative p-2 rounded-2xl ${
                    isScrolled 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                      : 'bg-yellow-400/20 backdrop-blur-sm'
                  }`}
                >
                  <GraduationCap className={`h-10 w-10 ${
                    isScrolled ? 'text-white' : 'text-yellow-400'
                  }`} />
                  {!isScrolled && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-xl"></div>
                  )}
                </motion.div>
                <div className="hidden sm:block">
                  <div className={`font-bold text-xl transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-slate-900 group-hover:text-blue-600' 
                      : 'text-white group-hover:text-yellow-400'
                  }`}>
                    Passi City College
                  </div>
                  <div className={`text-sm font-medium ${
                    isScrolled ? 'text-slate-600' : 'text-blue-200'
                  }`}>
                    Excellence in Education
                  </div>
                </div>
              </Link>
            </motion.div>
          
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <div key={item.name} className="relative submenu-container">
                  {item.submenu ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                      className={`flex items-center space-x-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative group ${
                        isActiveRoute(item.href)
                          ? isScrolled 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-yellow-400 bg-white/10'
                          : isScrolled
                            ? 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                            : 'text-white hover:text-yellow-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{item.name}</span>
                      <motion.div
                        animate={{ rotate: activeSubmenu === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                      
                      {/* Active indicator */}
                      {isActiveRoute(item.href) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${
                            isScrolled ? 'bg-blue-600' : 'bg-yellow-400'
                          }`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  ) : (
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Link
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative group ${
                          isActiveRoute(item.href)
                            ? isScrolled 
                              ? 'text-blue-600 bg-blue-50' 
                              : 'text-yellow-400 bg-white/10'
                            : isScrolled
                              ? 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                              : 'text-white hover:text-yellow-400 hover:bg-white/10'
                        }`}
                      >
                        {item.name}
                        
                        {/* Active indicator */}
                        {isActiveRoute(item.href) && (
                          <motion.div
                            layoutId="activeIndicator"
                            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${
                              isScrolled ? 'bg-blue-600' : 'bg-yellow-400'
                            }`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )}

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.submenu && activeSubmenu === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[55]"
                      >
                        <div className="p-2">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200 font-medium"
                              onClick={() => setActiveSubmenu(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  showSearch 
                    ? isScrolled
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-yellow-400 bg-white/20'
                    : isScrolled
                      ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      : 'text-white hover:text-yellow-400 hover:bg-white/10'
                }`}
                aria-label="Search"
                aria-expanded={showSearch}
              >
                <motion.div
                  animate={{ rotate: showSearch ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>
              </motion.button>
              
              {/* Portal Access */}
              {isAuthenticated && user ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={`/portal/${user.role}`}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isScrolled
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Portal</span>
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/auth/login"
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isScrolled
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  showSearch 
                    ? isScrolled
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-yellow-400 bg-white/20'
                    : isScrolled
                      ? 'text-slate-600 hover:text-blue-600'
                      : 'text-white hover:text-yellow-400'
                }`}
                aria-label="Search"
                aria-expanded={showSearch}
              >
                <motion.div
                  animate={{ rotate: showSearch ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-colors duration-200 ${
                  isScrolled
                    ? 'text-slate-600 hover:text-blue-600'
                    : 'text-white hover:text-yellow-400'
                }`}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <AnimatePresence mode="wait">
            {showSearch && (
              <motion.div
                initial={{ 
                  opacity: 0, 
                  scaleY: 0,
                  y: -20
                }}
                animate={{ 
                  opacity: 1, 
                  scaleY: 1,
                  y: 0
                }}
                exit={{ 
                  opacity: 0, 
                  scaleY: 0,
                  y: -20
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth easing
                  opacity: { duration: 0.3 },
                  scaleY: { duration: 0.4 },
                  y: { duration: 0.3 }
                }}
                style={{ 
                  transformOrigin: 'top',
                  overflow: 'hidden'
                }}
                className="border-t border-white/10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ 
                    delay: 0.1,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className="py-4"
                >
                  <SearchBar 
                    variant={isScrolled ? "light" : "default"}
                    context="navigation"
                    placeholder="Search programs, news, events..."
                    onClose={() => setShowSearch(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scaleY: 0,
                y: -10
              }}
              animate={{ 
                opacity: 1, 
                scaleY: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scaleY: 0,
                y: -10
              }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.3 },
                scaleY: { duration: 0.4 },
                y: { duration: 0.3 }
              }}
              style={{ 
                transformOrigin: 'top',
                overflow: 'hidden'
              }}
              className="lg:hidden border-t border-white/10"
            >
              <div className={`px-4 py-6 space-y-2 ${
                isScrolled ? 'bg-white' : 'bg-gradient-to-b from-blue-800 to-indigo-800'
              }`}>
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            isScrolled
                              ? 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-white hover:text-yellow-400 hover:bg-white/10'
                          }`}
                        >
                          <span>{item.name}</span>
                          <motion.div
                            animate={{ rotate: activeSubmenu === item.name ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {activeSubmenu === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-2 space-y-1"
                            >
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                    isScrolled
                                      ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                      : 'text-blue-200 hover:text-yellow-400 hover:bg-white/5'
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          isActiveRoute(item.href)
                            ? isScrolled 
                              ? 'text-blue-600 bg-blue-50' 
                              : 'text-yellow-400 bg-white/10'
                            : isScrolled
                              ? 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-white hover:text-yellow-400 hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
                
                {/* Mobile Search */}
                <AnimatePresence mode="wait">
                  {showSearch && (
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        scaleY: 0,
                        y: -10
                      }}
                      animate={{ 
                        opacity: 1, 
                        scaleY: 1,
                        y: 0
                      }}
                      exit={{ 
                        opacity: 0, 
                        scaleY: 0,
                        y: -10
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                        opacity: { duration: 0.3 },
                        scaleY: { duration: 0.4 },
                        y: { duration: 0.3 }
                      }}
                      style={{ 
                        transformOrigin: 'top',
                        overflow: 'hidden'
                      }}
                      className="pt-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ 
                          delay: 0.1,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                      >
                        <SearchBar 
                          variant={isScrolled ? "light" : "default"}
                          context="navigation"
                          placeholder="Search..."
                          className="w-full"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Mobile Portal Access */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-white/10"
                >
                  {isAuthenticated && user ? (
                    <Link
                      href={`/portal/${user.role}`}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isScrolled
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Portal ({user.role})</span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isScrolled
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Login / Portal</span>
                    </Link>
                  )}
                </motion.div>

                {/* Mobile Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`pt-4 space-y-2 text-sm ${
                    isScrolled ? 'text-slate-600' : 'text-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>+63 33 396 2291</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>info@passicitycollege.edu.ph</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.nav>

        {/* Announcement Ticker - Part of Nav Container */}
        <AnnouncementsTicker />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}