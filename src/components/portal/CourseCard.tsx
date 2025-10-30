'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ClassSection } from '@/lib/api';
import { BookOpen, Clock, Users, MapPin, TrendingUp, FileText, Award } from 'lucide-react';
import { timing, easing } from '@/lib/animations';
import Link from 'next/link';

interface CourseCardProps {
  subject: ClassSection;
  viewType: 'grid' | 'list';
  index: number;
}

export function CourseCard({ subject, viewType, index }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  // Calculate progress (mock data - replace with real attendance/completion data)
  const progress = Math.floor(Math.random() * 40) + 60; // 60-100%
  const attendance = Math.floor(Math.random() * 20) + 80; // 80-100%

  // Progress ring calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-green-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-red-600',
  ];
  const gradient = gradients[index % gradients.length];

  if (viewType === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{
          scale: 1.01,
          x: 8,
          boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
          transition: { duration: timing.fast, ease: easing.smooth },
        }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer"
      >
        <Link href={`/portal/student/subjects/${subject.sectionId}`}>
          <div className="flex items-center gap-6">
            {/* Icon */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: timing.slow, ease: easing.smooth }}
              className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <BookOpen className="h-8 w-8 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{subject.subjectCode}</h3>
              <p className="text-gray-600 mb-3 truncate">{subject.subjectName}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{subject.facultyName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{subject.schedule || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{subject.room || 'TBA'}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{subject.units}</div>
                <div className="text-xs text-gray-500">Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendance}%</div>
                <div className="text-xs text-gray-500">Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progress}%</div>
                <div className="text-xs text-gray-500">Progress</div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid View with 3D Tilt
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.05,
        transition: { duration: timing.fast, ease: easing.smooth },
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
    >
      <Link href={`/portal/student/subjects/${subject.sectionId}`}>
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
          {/* Gradient Header */}
          <div className={`relative h-32 bg-gradient-to-br ${gradient} p-6`}>
            {/* Floating Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            {/* Progress Ring */}
            <motion.div
              className="absolute top-4 right-4"
              style={{ transform: 'translateZ(20px)' }}
              animate={isHovered ? { scale: 1.1, rotate: 360 } : { scale: 1, rotate: 0 }}
              transition={{ duration: timing.slow }}
            >
              <svg width="90" height="90" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: easing.smooth }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
                {/* Center text */}
                <text
                  x="45"
                  y="45"
                  textAnchor="middle"
                  dy="7"
                  className="text-xl font-bold fill-white"
                  style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}
                >
                  {progress}%
                </text>
              </svg>
            </motion.div>

            {/* Subject Code */}
            <motion.div
              style={{ transform: 'translateZ(30px)' }}
              className="relative z-10"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: timing.slow, ease: easing.smooth }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2"
              >
                <BookOpen className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-white">{subject.subjectCode}</h3>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Subject Name */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                {subject.subjectName}
              </h4>
              {subject.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="space-y-2">
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: timing.fast }}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Users className="h-4 w-4 text-blue-500" />
                <span className="truncate">{subject.facultyName || 'TBA'}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: timing.fast }}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Clock className="h-4 w-4 text-green-500" />
                <span className="truncate">{subject.schedule || 'TBA'}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: timing.fast }}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="truncate">{subject.room || 'TBA'}</span>
              </motion.div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-lg"
              >
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">{subject.units} Units</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-lg"
              >
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">{attendance}%</span>
              </motion.div>
              {subject.materialCount && subject.materialCount > 0 && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-lg"
                >
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">{subject.materialCount}</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"
          />
        </div>
      </Link>
    </motion.div>
  );
}
