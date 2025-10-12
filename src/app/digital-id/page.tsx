'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeroMorph from '@/components/animations/HeroMorph';
import PageTransition from '@/components/animations/PageTransition';
import { 
  CreditCard, QrCode, Download, Shield, Clock, MapPin, 
  CheckCircle, XCircle, User, Calendar, TrendingUp, Award,
  Smartphone, Printer, AlertCircle, Info
} from 'lucide-react';

interface DigitalId {
  id: number;
  id_number: string;
  qr_code_url: string;
  expiry_date: string;
  scan_count: number;
  last_scanned?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  student_id?: string;
  program?: string;
  year_level?: number;
  employee_id?: string;
  department?: string;
}

interface AccessLog {
  location: string;
  access_type: string;
  access_granted: boolean;
  access_time: string;
  notes?: string;
}

export default function DigitalIdPage() {
  const { user, token } = useAuth();
  const [digitalId, setDigitalId] = useState<DigitalId | null>(null);
  const [accessHistory, setAccessHistory] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'id' | 'history'>('id');

  useEffect(() => {
    fetchDigitalId();
    fetchAccessHistory();
  }, []);

  const fetchDigitalId = async () => {
    try {
      const response = await fetch('/api/advanced/digital-id', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDigitalId(data);
      }
    } catch (error) {
      console.error('Error fetching digital ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessHistory = async () => {
    try {
      const response = await fetch('/api/advanced/digital-id/access-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAccessHistory(data);
      }
    } catch (error) {
      console.error('Error fetching access history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'student': 'bg-blue-50 text-blue-700 border-blue-200',
      'faculty': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'admin': 'bg-purple-50 text-purple-700 border-purple-200',
      'super_admin': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const downloadQRCode = () => {
    if (digitalId?.qr_code_url) {
      const link = document.createElement('a');
      link.href = digitalId.qr_code_url;
      link.download = `PCC-Digital-ID-${digitalId.id_number}.png`;
      link.click();
    }
  };

  const daysUntilExpiry = digitalId ? Math.ceil((new Date(digitalId.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading digital ID...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20">

        {/* Hero Section with Morph and Floating ID Cards */}
        <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
          <div className="absolute inset-0 z-0">
            <HeroMorph 
              className="absolute inset-0"
              colors={['#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6']}
              intensity={0.25}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-cyan-50/60 to-blue-100/40" />

            {/* Floating ID Cards - Interactive Background Elements (Hidden on mobile) */}
            <div className="absolute inset-0 overflow-visible hidden lg:block">
              {/* Student ID Card - Top Left */}
              <motion.div
                className="absolute top-20 left-12 w-64 h-40 opacity-40"
                animate={{
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                  rotate: [-6, -3, -6],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <CreditCard className="w-6 h-6 text-white/80" />
                      <QrCode className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">STUDENT ID</div>
                    <div className="text-white font-bold text-base mb-1">2024-12345</div>
                    <div className="text-white/80 text-xs">John Doe</div>
                    <div className="text-white/60 text-xs">BS Computer Science</div>
                  </div>
                </div>
              </motion.div>

              {/* Faculty ID Card - Top Right */}
              <motion.div
                className="absolute top-24 right-12 w-64 h-40 opacity-40"
                animate={{
                  y: [0, 35, 0],
                  x: [0, -20, 0],
                  rotate: [6, 9, 6],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Shield className="w-6 h-6 text-white/80" />
                      <Award className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">FACULTY ID</div>
                    <div className="text-white font-bold text-base mb-1">FAC-2024-789</div>
                    <div className="text-white/80 text-xs">Dr. Jane Smith</div>
                    <div className="text-white/60 text-xs">Computer Science Dept.</div>
                  </div>
                </div>
              </motion.div>

              {/* Admin ID Card - Bottom Left */}
              <motion.div
                className="absolute bottom-20 left-16 w-64 h-40 opacity-40"
                animate={{
                  y: [0, -28, 0],
                  x: [0, 18, 0],
                  rotate: [-5, -8, -5],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <User className="w-6 h-6 text-white/80" />
                      <CheckCircle className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">ADMIN ID</div>
                    <div className="text-white font-bold text-base mb-1">ADM-2024-456</div>
                    <div className="text-white/80 text-xs">Admin User</div>
                    <div className="text-white/60 text-xs">Administration Office</div>
                  </div>
                </div>
              </motion.div>

              {/* Additional Card - Bottom Right */}
              <motion.div
                className="absolute bottom-24 right-16 w-64 h-40 opacity-40"
                animate={{
                  y: [0, 32, 0],
                  x: [0, -18, 0],
                  rotate: [5, 7, 5],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                whileHover={{ scale: 1.15, opacity: 0.7, rotate: 0 }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mb-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Calendar className="w-6 h-6 text-white/80" />
                      <TrendingUp className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="text-white/90 text-xs font-medium mb-1">VISITOR ID</div>
                    <div className="text-white font-bold text-base mb-1">VIS-2024-321</div>
                    <div className="text-white/80 text-xs">Guest User</div>
                    <div className="text-white/60 text-xs">Temporary Access</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Icons - More Interactive */}
              {[
                { Icon: Smartphone, x: '8%', y: '50%', delay: 0 },
                { Icon: QrCode, x: '92%', y: '55%', delay: 1 },
                { Icon: Shield, x: '5%', y: '75%', delay: 2 },
                { Icon: CreditCard, x: '95%', y: '80%', delay: 1.5 },
              ].map(({ Icon, x, y, delay }, index) => (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{ left: x, top: y }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, index % 2 === 0 ? 10 : -10, 0],
                    rotate: [0, 360],
                    opacity: [0.05, 0.2, 0.05],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 12 + index * 2,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-10 h-10 text-cyan-600/30" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-full text-cyan-700 font-medium text-sm mb-6 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                Secure Campus Access
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Digital ID
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Your secure digital identification for seamless campus access and verification.
                One ID, unlimited possibilities.
              </motion.p>

              {digitalId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                  {[
                    { number: digitalId.scan_count, label: 'Total Scans', icon: QrCode },
                    { number: daysUntilExpiry, label: 'Days Valid', icon: Calendar },
                    { number: accessHistory.length, label: 'Access Logs', icon: Shield },
                    { number: '100%', label: 'Secure', icon: CheckCircle },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg"
                    >
                      <stat.icon className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {stat.number}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Modern Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50 inline-flex">
              {[
                { id: 'id', label: 'My Digital ID', icon: CreditCard },
                { id: 'history', label: 'Access History', icon: Clock }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabDigitalId"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'id' && digitalId && (
              <motion.div
                key="id"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Digital ID Card Content */}
                <div className="text-center py-12">
                  <p className="text-gray-600">Digital ID content will be displayed here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}