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
  ChevronRight,
  Shield,
  Briefcase,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotProvider } from './chatbot/ChatbotProvider';
import { FloatingNotification } from './FloatingNotification';

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PortalLayout({ children, title }: PortalLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
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

  const isActiveRoute = (href: string) => {
    return pathname === href;
  };

  return (
    <ChatbotProvider enabled={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Floating Notification - will fetch real data */}
        <FloatingNotification 
          userRole={user?.role}
          autoShowInterval={10000}
        />

        {/* Fixed Navigation Container */}
        <div className="fixed top-0 left-0 right-0 z-50">
          {/* Main Navigation Bar */}
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-white/98 backdrop-blur-xl border-b-2 border-gray-200 shadow-lg"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 lg:h-20">
                {/* Logo */}
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center">
                  <Link href={`/portal/${user?.role}`} className="flex items-center space-x-3 group">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative p-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600"
                    >
                      <GraduationCap className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-xl"></div>
                    </motion.div>
                    <div className="hidden sm:block">
                      <div className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                        PCC Portal
                      </div>
                      <div className="text-sm font-medium text-slate-600 capitalize">
                        {user?.role} Dashboard
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Mobile Portal Title - Shows between logo and menu button */}
                <div className="flex-1 sm:hidden flex justify-center">
                  <div className="flex items-center gap-2">
                    {user?.role === 'student' && (
                      <UserCircle className="h-4 w-4 text-blue-600" />
                    )}
                    {user?.role === 'faculty' && (
                      <Briefcase className="h-4 w-4 text-green-600" />
                    )}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <Shield className="h-4 w-4 text-purple-600" />
                    )}
                    <div className="font-semibold text-sm text-slate-900 capitalize">
                      {user?.role === 'super_admin' ? 'Admin' : user?.role} Portal
                    </div>
                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);
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
                          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative group ${
                            isActive
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full bg-blue-600"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex items-center space-x-3">

                  {/* User Profile */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={`/portal/${user?.role}/profile`}
                      className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-300"
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm">{user?.firstName}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                      </div>
                    </Link>
                  </motion.div>

                  {/* Settings */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/portal/${user?.role}/settings`}
                      className="p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-300"
                    >
                      <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                        <Settings className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Logout */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>

                {/* Mobile menu button */}
                <div className="lg:hidden flex items-center space-x-3">
                  {/* Mobile Menu Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <motion.div
                      animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.nav>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0, y: -10 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'top' }}
              className="fixed top-16 lg:top-20 left-0 right-0 z-40 lg:hidden border-b border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="bg-white px-4 py-6 space-y-2 shadow-xl">
                {/* Navigation Items */}
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500 font-medium">Account</span>
                  </div>
                </div>

                {/* User Profile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.1 }}
                >
                  <Link
                    href={`/portal/${user?.role}/profile`}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-slate-500 capitalize">{user?.role} Account</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>

                {/* Settings */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.2 }}
                >
                  <Link
                    href={`/portal/${user?.role}/settings`}
                    className="flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span className="font-semibold">Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>

                {/* Logout */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.3 }}
                >
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 rounded-xl font-semibold transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>

                {/* Back to Main Website */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.4 }}
                  className="pt-4 border-t border-gray-200"
                >
                  <Link
                    href="/"
                    className="flex items-center justify-center space-x-2 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Main Website</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content - Added extra padding to prevent nav overlap */}
        <main className="pb-12" style={{ paddingTop: '5.5rem' }}>
          {/* Page Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Modern Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              {/* Icon */}
              <div className="pt-8 pb-4 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Sign Out?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to sign out of your account?
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 p-4 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmLogout}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Sign Out
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ChatbotProvider>
  );
}
