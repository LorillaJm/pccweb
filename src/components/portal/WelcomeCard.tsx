'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface WelcomeCardProps {
  firstName: string;
  program?: string;
  yearLevel?: number;
  semester?: number;
}

const motivationalQuotes = [
  "Every expert was once a beginner.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Education is the passport to the future.",
  "Your only limit is you."
];

export function WelcomeCard({ firstName, program, yearLevel, semester }: WelcomeCardProps) {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl sm:rounded-3xl shadow-2xl"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.8) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.8) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.8) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.8) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 space-y-6">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="flex-shrink-0"
                >
                  <span className="text-3xl sm:text-4xl">👋</span>
                </motion.div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white break-words">
                  Welcome back, <span className="text-yellow-300">{firstName}</span>!
                </h1>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium">{today}</p>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 flex-shrink-0 mt-1" />
              <p className="text-white/90 italic text-sm sm:text-base lg:text-lg break-words">"{quote}"</p>
            </motion.div>

            {/* Student Info Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 sm:gap-3"
            >
              {program && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-white font-semibold text-sm sm:text-base whitespace-nowrap">{program}</span>
                </div>
              )}
              {yearLevel && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-white font-semibold text-sm sm:text-base whitespace-nowrap">Year {yearLevel}</span>
                </div>
              )}
              {semester && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-white font-semibold text-sm sm:text-base whitespace-nowrap">Semester {semester}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Animated Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl" />
              <div className="relative w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
