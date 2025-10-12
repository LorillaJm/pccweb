'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Award, ChevronRight, GraduationCap, Lightbulb, Target, Star } from "lucide-react";
import Link from "next/link";
import PageTransition from '@/components/animations/PageTransition';
import HeroMorph from '@/components/animations/HeroMorph';
import PremiumCard from '@/components/premium/PremiumCard';
import PremiumButton from '@/components/premium/PremiumButton';
import { useParallax } from '@/hooks/useParallax';

const floatingIcons = [
  { Icon: BookOpen, delay: 0, x: '15%', y: '25%' },
  { Icon: GraduationCap, delay: 0.5, x: '85%', y: '20%' },
  { Icon: Lightbulb, delay: 1, x: '10%', y: '65%' },
  { Icon: Target, delay: 1.5, x: '90%', y: '70%' },
  { Icon: Star, delay: 2, x: '75%', y: '45%' },
  { Icon: Award, delay: 2.5, x: '20%', y: '50%' },
];

const programs = [
  {
    category: "Business & Management",
    programs: [
      {
        title: "Bachelor of Science in Business Administration",
        major: "Management",
        duration: "4 years",
        units: "120 units",
        description: "Develops strategic thinking and leadership skills for modern business environments."
      },
      {
        title: "Bachelor of Science in Business Administration",
        major: "Marketing",
        duration: "4 years",
        units: "120 units",
        description: "Focuses on consumer behavior, digital marketing, and brand management."
      },
      {
        title: "Bachelor of Science in Accountancy",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Prepares students for CPA licensure and careers in accounting and finance."
      }
    ]
  },
  {
    category: "Information Technology",
    programs: [
      {
        title: "Bachelor of Science in Information Technology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Covers software development, network administration, and cybersecurity."
      },
      {
        title: "Bachelor of Science in Computer Science",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Emphasizes programming, algorithms, and system design."
      }
    ]
  },
  {
    category: "Engineering",
    programs: [
      {
        title: "Bachelor of Science in Civil Engineering",
        major: "",
        duration: "5 years",
        units: "150 units",
        description: "Focuses on infrastructure design, construction, and project management."
      },
      {
        title: "Bachelor of Science in Electrical Engineering",
        major: "",
        duration: "5 years",
        units: "150 units",
        description: "Covers power systems, electronics, and telecommunications."
      }
    ]
  },
  {
    category: "Education",
    programs: [
      {
        title: "Bachelor of Elementary Education",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Prepares teachers for elementary education with modern pedagogical approaches."
      },
      {
        title: "Bachelor of Secondary Education",
        major: "Various Specializations",
        duration: "4 years",
        units: "120 units",
        description: "Specializations in Mathematics, English, Science, and Social Studies."
      }
    ]
  },
  {
    category: "Health Sciences",
    programs: [
      {
        title: "Bachelor of Science in Nursing",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Comprehensive nursing education with clinical experience."
      },
      {
        title: "Bachelor of Science in Medical Technology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Laboratory medicine and diagnostic procedures."
      }
    ]
  },
  {
    category: "Liberal Arts",
    programs: [
      {
        title: "Bachelor of Arts in Communication",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Media studies, journalism, and corporate communication."
      },
      {
        title: "Bachelor of Arts in Psychology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Human behavior, counseling, and psychological assessment."
      }
    ]
  }
];

const graduatePrograms = [
  {
    title: "Master of Business Administration (MBA)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced business management with leadership development."
  },
  {
    title: "Master of Arts in Education (MAEd)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced educational theory and administration."
  },
  {
    title: "Master of Science in Information Technology (MSIT)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced IT concepts and emerging technologies."
  }
];

export default function Programs() {
  const { y: scrollY } = useParallax({ intensity: 0.3 });
  
  return (
    <PageTransition>
      <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
        {/* Professional Educational Background with HeroMorph */}
        <div className="absolute inset-0 z-0">
          {/* HeroMorph Background */}
          <HeroMorph 
            className="absolute inset-0"
            colors={['#4F46E5', '#3B82F6', '#8B5CF6', '#06B6D4']}
            intensity={0.25}
          />
          
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-purple-100/40" />
          
          {/* Geometric Patterns */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }} 
            />
          </div>

          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-indigo-400/20 via-blue-400/15 to-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-emerald-400/15 via-teal-400/10 to-blue-400/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -25, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating Educational Icons */}
          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute hidden sm:block"
              style={{ left: x, top: y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: 12 + index * 2,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut',
              }}
            >
              <Icon className="w-8 h-8 lg:w-12 lg:h-12 text-indigo-600/20" />
            </motion.div>
          ))}
        </div>

        {/* Content with Parallax */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 text-center"
          style={{ y: scrollY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* College Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-full text-indigo-700 font-medium text-sm mb-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <BookOpen className="w-4 h-4" />
              Academic Excellence at PCC
            </motion.div>

            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 px-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Academic{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Programs
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover our comprehensive range of undergraduate and graduate programs 
              designed to prepare you for success in your chosen career and make a meaningful impact in the world.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { number: '18+', label: 'Programs' },
                { number: '150+', label: 'Faculty' },
                { number: '95%', label: 'Employment Rate' },
                { number: '5K+', label: 'Graduates' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href="#undergraduate"
                  className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-300 overflow-hidden min-w-[200px] sm:min-w-[220px]"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Explore Programs</span>
                  </span>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <button
                  onClick={() => {
                    // Create and trigger download of a sample brochure
                    const link = document.createElement('a');
                    link.href = '/brochure/pcc-programs-brochure.pdf';
                    link.download = 'PCC-Programs-Brochure.pdf';
                    link.click();
                  }}
                  className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-indigo-700 bg-white/90 backdrop-blur-sm border-2 border-indigo-200 hover:border-indigo-300 rounded-2xl shadow-2xl shadow-gray-900/10 hover:shadow-gray-900/20 transition-all duration-300 overflow-hidden min-w-[200px] sm:min-w-[220px]"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center space-x-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </motion.div>
                    <span>Download Brochure</span>
                  </span>
                  
                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Program Overview */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Program <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Overview</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive statistics about our academic excellence and student success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, number: "18+", label: "Undergraduate Programs", color: "from-blue-500 to-blue-600", delay: 0.1 },
              { icon: Award, number: "3", label: "Graduate Programs", color: "from-emerald-500 to-emerald-600", delay: 0.2 },
              { icon: Users, number: "150+", label: "Qualified Faculty", color: "from-purple-500 to-purple-600", delay: 0.3 },
              { icon: Clock, number: "95%", label: "Employment Rate", color: "from-amber-500 to-amber-600", delay: 0.4 }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: stat.delay }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="h-10 w-10 text-white" />
                  </motion.div>
                  <motion.div
                    className="text-4xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: stat.delay + 0.2 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Undergraduate Programs */}
      <section id="undergraduate" className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Undergraduate <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our diverse selection of four-year bachelor's degree programs designed to prepare you for success in your chosen field
            </p>
          </motion.div>

          <div className="space-y-16">
            {programs.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <motion.div
                  className="flex items-center mb-8"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 + 0.2 }}
                >
                  <div className="flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {category.category}
                    </h3>
                    <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.programs.map((program, programIndex) => (
                    <motion.div
                      key={programIndex}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: programIndex * 0.1 }}
                    >
                      <PremiumCard className="p-6 h-full"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <motion.div
                            className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.1 }}
                          >
                            <ChevronRight className="h-4 w-4 text-indigo-600" />
                          </motion.div>
                        </div>

                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {program.title}
                        </h4>
                        
                        {program.major && (
                          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-3">
                            Major in {program.major}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {program.duration}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {program.units}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{program.description}</p>
                        
                        <Link 
                          href="/admissions" 
                          className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group/link"
                        >
                          Learn More
                          <motion.div
                            className="ml-1"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </Link>
                      </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Graduate Programs */}
      <section id="graduate" className="py-16 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-indigo-100/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Graduate <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advance your career with our comprehensive master's degree programs designed for working professionals and academic excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {graduatePrograms.map((program, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Award className="h-10 w-10 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-purple-600 transition-colors">
                    {program.title}
                  </h3>

                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      {program.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
                      {program.units}
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mb-8 leading-relaxed">{program.description}</p>
                  
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href="/admissions" 
                        className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg group/btn"
                      >
                        Apply Now
                        <motion.div
                          className="ml-2"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Special Features */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-purple-50/10 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PCC Programs?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our programs are designed with your success in mind, combining academic excellence with practical experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Industry-Relevant Curriculum",
                description: "Our programs are regularly updated to meet current industry standards and emerging market demands.",
                color: "from-blue-500 to-blue-600",
                delay: 0.1
              },
              {
                icon: Award,
                title: "Experienced Faculty",
                description: "Learn from qualified professors with advanced degrees and extensive professional experience.",
                color: "from-emerald-500 to-emerald-600",
                delay: 0.2
              },
              {
                icon: Lightbulb,
                title: "Modern Facilities",
                description: "State-of-the-art laboratories, libraries, and learning spaces equipped with the latest technology.",
                color: "from-purple-500 to-purple-600",
                delay: 0.3
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className="h-10 w-10 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Online Programs Section */}
      <section id="online" className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Online <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Flexible online learning options that allow you to earn your degree while maintaining your work and life commitments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Bachelor of Science in Information Technology",
                duration: "4 years",
                format: "100% Online",
                description: "Complete your IT degree entirely online with interactive virtual labs and real-world projects."
              },
              {
                title: "Bachelor of Science in Business Administration",
                duration: "4 years", 
                format: "Hybrid Available",
                description: "Flexible business program with online coursework and optional in-person workshops."
              },
              {
                title: "Master of Business Administration (MBA)",
                duration: "2 years",
                format: "Evening & Online",
                description: "Executive MBA program designed for working professionals with weekend and online classes."
              }
            ].map((program, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BookOpen className="h-10 w-10 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors">
                    {program.title}
                  </h3>

                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      {program.duration}
                    </div>
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {program.format}
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mb-8 leading-relaxed">{program.description}</p>
                  
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href="/admissions" 
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg group/btn"
                      >
                        Learn More
                        <motion.div
                          className="ml-2"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Continuing Education Section */}
      <section id="continuing" className="py-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Continuing <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Education</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional development courses, certifications, and lifelong learning opportunities for career advancement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Professional Certificates",
                description: "Industry-recognized certifications in various fields",
                icon: Award,
                color: "from-emerald-500 to-emerald-600"
              },
              {
                title: "Skills Development",
                description: "Short courses to enhance your professional skills",
                icon: Target,
                color: "from-teal-500 to-teal-600"
              },
              {
                title: "Executive Training",
                description: "Leadership and management development programs",
                icon: Users,
                color: "from-cyan-500 to-cyan-600"
              },
              {
                title: "Workshops & Seminars",
                description: "Regular workshops on emerging trends and technologies",
                icon: Lightbulb,
                color: "from-blue-500 to-blue-600"
              }
            ].map((program, index) => {
              const IconComponent = program.icon;
              return (
                <motion.div
                  key={index}
                  className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-r ${program.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className="h-10 w-10 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {program.description}
                    </p>
                    
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors group/link"
                    >
                      Learn More
                      <motion.div
                        className="ml-1"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA for Continuing Education */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Advance Your Career?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact our continuing education team to learn about upcoming programs and enrollment opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    href="/contact"
                    className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-2xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 overflow-hidden min-w-[180px] sm:min-w-[200px]"
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                    
                    {/* Button content */}
                    <span className="relative z-10 flex items-center space-x-2">
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </motion.div>
                      <span>Contact Us</span>
                    </span>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <button
                    onClick={() => {
                      // Scroll to a schedule section or open a modal
                      const scheduleSection = document.getElementById('schedule');
                      if (scheduleSection) {
                        scheduleSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // Fallback: show alert or redirect to schedule page
                        alert('Schedule information will be available soon. Please contact us for current course schedules.');
                      }
                    }}
                    className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-emerald-700 bg-white/90 backdrop-blur-sm border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl shadow-2xl shadow-gray-900/10 hover:shadow-gray-900/20 transition-all duration-300 overflow-hidden min-w-[180px] sm:min-w-[200px]"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                    
                    {/* Button content */}
                    <span className="relative z-10 flex items-center space-x-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </motion.div>
                      <span>View Schedule</span>
                    </span>
                    
                    {/* Border glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
        
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -25, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your Academic Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Explore our admission requirements and take the first step towards 
              your future career. Join thousands of successful graduates who started their journey at PCC.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/admissions" 
                  className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-lg group"
                >
                  View Admission Requirements
                  <motion.div
                    className="ml-2"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/contact" 
                  className="inline-flex items-center border-2 border-white/80 text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-indigo-900 transition-all duration-300 backdrop-blur-sm"
                >
                  Schedule a Campus Tour
                  <motion.div
                    className="ml-2"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </div>
    </PageTransition>
  );
}