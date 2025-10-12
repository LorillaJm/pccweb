'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Calendar, Award, Building, Users, Rocket, Globe, Lightbulb, GraduationCap, BookOpen, Trophy } from 'lucide-react';

const milestones = [
  {
    year: '1950',
    title: 'Foundation',
    description: 'Passi City College was established with a vision to provide quality education to the community.',
    icon: Building,
    details: 'Started with just 100 students and 10 dedicated faculty members in a modest two-story building, focusing on basic education and vocational training.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    year: '1975',
    title: 'Campus Expansion',
    description: 'Major expansion with new departments and modern facilities across the campus.',
    icon: Rocket,
    details: 'Added engineering, science, and liberal arts departments. Constructed new library, laboratories, and dormitories. Student enrollment reached 1,000.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    year: '1990',
    title: 'National Recognition',
    description: 'Received national accreditation and recognition for academic excellence.',
    icon: Award,
    details: 'Achieved Level III accreditation status from AACCUP and ranked among the top colleges in Western Visayas region.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    year: '2005',
    title: 'Digital Revolution',
    description: 'Pioneered digital learning with online platforms and smart campus infrastructure.',
    icon: Globe,
    details: 'Launched comprehensive e-learning system, digital library with 50,000+ resources, and campus-wide high-speed internet connectivity.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    year: '2015',
    title: 'Research Excellence',
    description: 'Established world-class research centers and innovation laboratories.',
    icon: Lightbulb,
    details: 'Opened 5 specialized research centers focusing on AI, renewable energy, biotechnology, and sustainable agriculture with international partnerships.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    year: '2024',
    title: 'Excellence in Education',
    description: 'Modern era with cutting-edge facilities serving 10,000+ students globally.',
    icon: GraduationCap,
    details: 'Smart classrooms with AI integration, virtual reality labs, global exchange programs, and recognition as a Center of Excellence in multiple fields.',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
];

export function InteractiveTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      
      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Our History
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Our Journey Through{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Time
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From humble beginnings to becoming a beacon of excellence in education.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1">
            <div className="h-full w-full bg-gradient-to-b from-blue-200 via-purple-200 to-indigo-200 rounded-full" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full origin-top"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
          
          {/* Mobile Timeline Line */}
          <div className="lg:hidden absolute left-6 sm:left-8 top-0 bottom-0 w-1">
            <div className="h-full w-full bg-gradient-to-b from-blue-200 via-purple-200 to-indigo-200 rounded-full" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full origin-top"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>

          {/* Milestones */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isLeft = index % 2 === 0;
              const isActive = activeIndex === index;
              const isHovered = hoveredIndex === index;

              return (
                <motion.div
                  key={milestone.year}
                  className={`relative flex items-center ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } flex-row`}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setActiveIndex(isActive ? null : index)}
                >
                  {/* Content Card */}
                  <div className={`w-full lg:w-5/12 ${
                    isLeft ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'
                  } pl-14 sm:pl-16 lg:pl-0 text-left`}>
                    <motion.div
                      className={`p-4 sm:p-6 rounded-xl bg-white/90 backdrop-blur-sm border shadow-lg transition-all duration-300 cursor-pointer ${
                        milestone.borderColor
                      } ${isHovered || isActive ? 'shadow-xl scale-[1.02]' : ''}`}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Year Badge */}
                      <motion.div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 bg-gradient-to-r ${milestone.color} text-white font-bold text-sm shadow-md`}
                        whileHover={{ scale: 1.03 }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {milestone.year}
                      </motion.div>

                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">
                        {milestone.description}
                      </p>
                      
                      {/* Expandable Details */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={
                          isHovered || isActive
                            ? { height: 'auto', opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className={`pt-3 border-t ${milestone.borderColor}`}>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                            {milestone.details}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Center Icon - Desktop */}
                  <motion.div
                    className={`hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r ${milestone.color} items-center justify-center z-20 shadow-lg border-3 border-white`}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 180,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  {/* Left Icon - Mobile */}
                  <motion.div
                    className={`lg:hidden absolute left-6 sm:left-8 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${milestone.color} flex items-center justify-center z-20 shadow-md border-2 border-white`}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline End Marker */}
          <motion.div
            className="flex justify-center mt-8 lg:mt-12"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: milestones.length * 0.1 + 0.3 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md text-sm font-medium">
              <Trophy className="w-4 h-4" />
              <span>Excellence Continues</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
