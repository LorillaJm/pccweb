'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Home, 
  User, 
  BookOpen, 
  Bell, 
  LogOut,
  Settings,
  FileText,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotProvider } from './chatbot/ChatbotProvider';

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PortalLayout({ children, title }: PortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/portal/${user?.role}`, icon: Home },
      { name: 'Profile', href: `/portal/${user?.role}/profile`, icon: User },
      { name: 'Announcements', href: `/portal/${user?.role}/announcements`, icon: Bell },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        { name: 'My Subjects', href: '/portal/student/subjects', icon: BookOpen },
      ];
    } else if (user?.role === 'faculty') {
      return [
        ...baseItems,
        { name: 'My Classes', href: '/portal/faculty/classes', icon: BookOpen },
        { name: 'Materials', href: '/portal/faculty/materials', icon: FileText },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <ChatbotProvider enabled={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 relative overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-indigo-600/2 to-purple-600/3"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"></div>
        </div>
        
        {/* Ambient lighting effects */}
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-radial from-blue-400/8 via-blue-400/4 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-radial from-indigo-400/6 via-purple-400/3 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-slate-400/2 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl lg:hidden"
          >
        
        {/* Mobile Logo */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <Link href={`/portal/${user?.role}`} className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-white">PCC Portal</div>
              <div className="text-sm text-blue-100 capitalize">{user?.role}</div>
            </div>
          </Link>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

            {/* Mobile Navigation */}
            <nav className="px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50'
                            : 'text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <motion.div 
                          className={`p-2 rounded-lg mr-3 transition-colors ${
                            isActive 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                        >
                          <Icon className="h-5 w-5 transition-colors" />
                        </motion.div>
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen">
        {/* Premium Header with Navigation */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="relative bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-xl shadow-gray-900/5"
        >
          {/* Header accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          <div className="max-w-8xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              
              {/* Left Side - Premium Logo & Navigation */}
              <div className="flex items-center space-x-12">
                {/* Premium Logo */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link href={`/portal/${user?.role}`} className="group flex items-center space-x-4">
                    <motion.div 
                      className="relative"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-all duration-300">
                        <GraduationCap className="h-10 w-10 text-white" />
                      </div>
                    </motion.div>
                    <div className="hidden sm:block">
                      <div className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        PCC Portal
                      </div>
                      <div className="text-sm font-medium text-gray-500 capitalize tracking-wide">
                        {user?.role} Dashboard
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Premium Desktop Navigation */}
                <nav className="hidden xl:flex items-center space-x-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Link
                          href={item.href}
                          className={`group relative flex items-center px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 ${
                            isActive 
                              ? 'text-blue-700 bg-blue-50' 
                              : 'text-gray-700 hover:text-blue-700'
                          }`}
                        >
                          {/* Hover background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Icon */}
                          <motion.div 
                            className={`relative p-2 rounded-xl mr-3 transition-all duration-300 ${
                              isActive 
                                ? 'bg-blue-100/80 text-blue-600' 
                                : 'bg-gray-100/80 group-hover:bg-blue-100/80 group-hover:text-blue-600'
                            }`}
                            whileHover={{ rotate: 5 }}
                          >
                            <Icon className="h-4 w-4 transition-colors duration-300" />
                          </motion.div>
                          
                          {/* Text */}
                          <span className="relative">{item.name}</span>
                          
                          {/* Active indicator */}
                          {isActive ? (
                            <motion.div
                              layoutId="activePortalNav"
                              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          ) : (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-8 transition-all duration-300"></div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Right Side - Premium User Actions */}
              <div className="flex items-center space-x-3">
                {/* Mobile menu button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="xl:hidden relative p-3 text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10"
                >
                  <Menu className="h-6 w-6" />
                </motion.button>

                {/* Premium Notifications */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href={`/portal/${user?.role}/announcements`}
                    className="group relative p-3 text-gray-600 hover:text-blue-700 bg-white/80 hover:bg-white rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-blue-600/10"
                  >
                    <motion.div whileHover={{ rotate: 15 }}>
                      <Bell className="h-6 w-6 transition-transform duration-300" />
                    </motion.div>
                    {/* Premium notification badge */}
                    <motion.div 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                    {/* Pulse animation */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </Link>
                </motion.div>

                {/* Premium User Profile */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href={`/portal/${user?.role}/profile`}
                    className="group flex items-center space-x-3 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl px-5 py-3 transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10"
                  >
                    <motion.div 
                      className="relative"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </motion.div>
                    <div className="hidden sm:block">
                      <div className="font-semibold text-gray-900">{user?.firstName}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </Link>
                </motion.div>

                {/* Premium Settings & Actions */}
                <div className="hidden lg:flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/portal/${user?.role}/settings`}
                      className="group p-3 text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10"
                    >
                      <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                        <Settings className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="group p-3 text-gray-600 hover:text-red-600 bg-white/80 hover:bg-red-50 rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-red-600/10"
                  >
                    <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                      <LogOut className="h-5 w-5" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Premium Page Title Section */}
        <section className="relative bg-gradient-to-r from-white/70 via-white/60 to-white/70 backdrop-blur-xl border-b border-gray-200/40">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/2 via-transparent to-indigo-600/2"></div>
          
          <div className="relative max-w-8xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {title || 'Dashboard'}
                  </h1>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Welcome back, <span className="text-blue-700 font-semibold">{user?.firstName}</span>! 
                  <span className="text-gray-500 ml-1">Here's your academic overview</span>
                </p>
                
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="capitalize">{user?.role}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-blue-600 font-medium">{title || 'Dashboard'}</span>
                </div>
              </div>
              
              {/* Premium Quick Actions */}
              <div className="flex items-center space-x-3">
                <Link 
                  href="/"
                  className="group flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white backdrop-blur-sm rounded-2xl py-3 px-6 transition-all duration-300 border border-gray-200/60 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Main Website
                </Link>
                
                {/* Time display */}
                <div className="hidden xl:flex items-center text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl py-3 px-4 border border-gray-200/40">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Page Content */}
        <main className="relative max-w-8xl mx-auto px-6 lg:px-8 py-12">
          <div className="relative">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      </div>
    </ChatbotProvider>
  );
}