'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, DollarSign, CheckCircle, Download, User, GraduationCap, Users, Target, Award, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

const floatingIcons = [
  { Icon: FileText, delay: 0, x: '12%', y: '22%' },
  { Icon: GraduationCap, delay: 0.5, x: '88%', y: '18%' },
  { Icon: Users, delay: 1, x: '8%', y: '68%' },
  { Icon: Target, delay: 1.5, x: '92%', y: '72%' },
  { Icon: Award, delay: 2, x: '78%', y: '42%' },
  { Icon: CheckCircle, delay: 2.5, x: '18%', y: '48%' },
];

const admissionSteps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Complete and submit the online application form with required documents."
  },
  {
    step: 2,
    title: "Document Review",
    description: "Our admissions team will review your application and supporting documents."
  },
  {
    step: 3,
    title: "Entrance Examination",
    description: "Take the PCC entrance examination (if required for your program)."
  },
  {
    step: 4,
    title: "Interview",
    description: "Attend a personal interview with the admissions committee."
  },
  {
    step: 5,
    title: "Admission Decision",
    description: "Receive your admission decision via email and postal mail."
  },
  {
    step: 6,
    title: "Enrollment",
    description: "Complete enrollment process and pay required fees."
  }
];

const requirements = {
  freshmen: [
    "Senior High School Diploma or equivalent",
    "Official Transcript of Records",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Completed Application Form"
  ],
  transferees: [
    "Official Transcript of Records from previous school",
    "Certificate of Transfer Credential",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Completed Application Form"
  ],
  graduate: [
    "Bachelor's Degree Diploma",
    "Official Transcript of Records (Undergraduate)",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Letter of Recommendation (2 copies)",
    "Statement of Purpose"
  ]
};

const scholarships = [
  {
    name: "Academic Excellence Scholarship",
    coverage: "Full Tuition",
    criteria: "Valedictorian/Salutatorian with 95% average"
  },
  {
    name: "Dean's List Scholarship",
    coverage: "50% Tuition Discount",
    criteria: "Consistent Dean's List for 2 consecutive semesters"
  },
  {
    name: "Leadership Scholarship",
    coverage: "25% Tuition Discount",
    criteria: "Outstanding leadership in student organizations"
  },
  {
    name: "Financial Aid Grant",
    coverage: "Variable",
    criteria: "Based on financial need and academic merit"
  }
];

export default function Admissions() {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
        {/* Professional Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-100/30" />
          
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }} 
            />
          </div>

          <motion.div
            className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-blue-400/10 rounded-full blur-3xl"
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
            className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl"
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
              <Icon className="w-8 h-8 lg:w-12 lg:h-12 text-emerald-600/20" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full text-emerald-700 font-medium text-sm mb-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GraduationCap className="w-4 h-4" />
              Start Your Journey at PCC
            </motion.div>

            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 px-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Admissions
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join the PCC community and take the first step towards your future. 
              We make the admission process simple, transparent, and accessible to all qualified students.
            </motion.p>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { number: '6', label: 'Simple Steps' },
                { number: '3', label: 'Semesters/Year' },
                { number: '4', label: 'Scholarship Types' },
                { number: '100%', label: 'Support' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="#apply" 
                  className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold shadow-lg text-sm sm:text-base relative overflow-hidden group"
                >
                  <span className="relative z-10">Apply Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="#requirements" 
                  className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-200 text-emerald-700 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300 text-sm sm:text-base shadow-lg"
                >
                  View Requirements
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Application Deadlines */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
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
              Application <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Deadlines</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Important dates to remember for the upcoming academic year. Plan ahead to secure your spot at PCC.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: "First Semester",
                dates: [
                  { label: "Early Admission", date: "March 1", type: "early" },
                  { label: "Regular Admission", date: "May 15", type: "regular" },
                  { label: "Final Deadline", date: "June 30", type: "final" }
                ],
                color: "from-blue-500 to-blue-600",
                delay: 0.1
              },
              {
                icon: Calendar,
                title: "Second Semester",
                dates: [
                  { label: "Early Admission", date: "October 1", type: "early" },
                  { label: "Regular Admission", date: "November 15", type: "regular" },
                  { label: "Final Deadline", date: "December 15", type: "final" }
                ],
                color: "from-emerald-500 to-emerald-600",
                delay: 0.2
              },
              {
                icon: Calendar,
                title: "Summer Term",
                dates: [
                  { label: "Application Opens", date: "February 1", type: "early" },
                  { label: "Regular Admission", date: "March 15", type: "regular" },
                  { label: "Final Deadline", date: "April 15", type: "final" }
                ],
                color: "from-amber-500 to-amber-600",
                delay: 0.3
              },
              {
                icon: GraduationCap,
                title: "Graduate Programs",
                dates: [
                  { label: "First Semester", date: "April 30", type: "regular" },
                  { label: "Second Semester", date: "November 30", type: "regular" },
                  { label: "Rolling Admission", date: "Year-round", type: "special" }
                ],
                color: "from-purple-500 to-purple-600",
                delay: 0.4
              }
            ].map((deadline, index) => {
              const IconComponent = deadline.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: deadline.delay }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 text-center">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${deadline.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="font-bold text-lg mb-4 group-hover:text-emerald-600 transition-colors">
                      {deadline.title}
                    </h3>

                    <div className="space-y-2">
                      {deadline.dates.map((dateInfo, dateIndex) => (
                        <div key={dateIndex} className="text-sm">
                          <div className="font-medium text-gray-700">{dateInfo.label}</div>
                          <div className={`font-bold ${
                            dateInfo.type === 'final' ? 'text-red-600' :
                            dateInfo.type === 'special' ? 'text-emerald-600' :
                            'text-gray-600'
                          }`}>
                            {dateInfo.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Admission Process */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-teal-50/10 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Admission <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Process</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to complete your application and join the PCC community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admissionSteps.map((item, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-emerald-500 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold shadow-lg group-hover:shadow-xl"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        {item.step}
                      </motion.div>
                      <h3 className="text-xl font-bold ml-4 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Connection Line */}
                {index < admissionSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 transform -translate-y-1/2 z-20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Requirements */}
      <section id="requirements" className="py-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
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
              Admission <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Requirements</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Required documents for different student categories. Ensure you have all necessary documents before applying.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: User,
                title: "Freshmen",
                requirements: requirements.freshmen,
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                delay: 0.1
              },
              {
                icon: FileText,
                title: "Transferees",
                requirements: requirements.transferees,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100",
                delay: 0.2
              },
              {
                icon: GraduationCap,
                title: "Graduate Students",
                requirements: requirements.graduate,
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
                delay: 0.3
              }
            ].map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={categoryIndex}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-white/50 relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: category.delay }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className="h-10 w-10 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-center mb-8 group-hover:text-emerald-600 transition-colors">
                      {category.title}
                    </h3>

                    <ul className="space-y-4">
                      {category.requirements.map((req, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start group/item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: category.delay + index * 0.05 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <span className="text-gray-600 leading-relaxed group-hover/item:text-gray-800 transition-colors">
                            {req}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Tuition and Fees */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-teal-50/10 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tuition and <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Fees</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Affordable education with flexible payment options designed to make quality education accessible to all
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Undergraduate",
                amount: "₱25,000",
                period: "per semester",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                delay: 0.1
              },
              {
                title: "Graduate",
                amount: "₱35,000",
                period: "per semester",
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100",
                delay: 0.2
              },
              {
                title: "Engineering",
                amount: "₱30,000",
                period: "per semester",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
                delay: 0.3
              },
              {
                title: "Miscellaneous",
                amount: "₱5,000",
                period: "per semester",
                color: "from-amber-500 to-amber-600",
                bgColor: "from-amber-50 to-amber-100",
                delay: 0.4
              }
            ].map((fee, index) => (
              <motion.div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl border border-white/50 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: fee.delay }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${fee.bgColor}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${fee.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <DollarSign className="h-8 w-8 text-white" />
                  </motion.div>

                  <h3 className="font-bold text-lg mb-4 group-hover:text-emerald-600 transition-colors">
                    {fee.title}
                  </h3>
                  
                  <motion.div
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: fee.delay + 0.2 }}
                  >
                    {fee.amount}
                  </motion.div>
                  
                  <div className="text-gray-600 text-sm font-medium">{fee.period}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-gray-600 mb-6 text-lg">
              *Fees are subject to change. Financial aid and payment plans available.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/contact" 
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg group"
              >
                Contact Financial Aid Office
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
        </div>
      </section>

      {/* Enhanced Scholarships */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
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
              Scholarships & <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Financial Aid</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe education should be accessible to all qualified students. Explore our comprehensive scholarship programs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scholarships.map((scholarship, index) => (
              <motion.div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border-l-4 border-yellow-400 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-amber-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Award className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-xl lg:text-2xl font-bold mb-4 group-hover:text-emerald-600 transition-colors">
                    {scholarship.name}
                  </h3>
                  
                  <motion.div
                    className="mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold border border-yellow-200 shadow-sm">
                      {scholarship.coverage}
                    </span>
                  </motion.div>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">{scholarship.criteria}</p>
                  
                  <motion.button
                    className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors flex items-center group/btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                    <motion.div
                      className="ml-2"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Downloadable Forms */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-teal-50/10 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Downloadable <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Forms</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Download and complete these forms for your application. All forms are available in PDF format.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Application Form",
                description: "Complete application form for all programs",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                delay: 0.1
              },
              {
                title: "Medical Certificate Form",
                description: "Medical examination requirements",
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100",
                delay: 0.2
              },
              {
                title: "Scholarship Application",
                description: "Apply for financial assistance",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
                delay: 0.3
              }
            ].map((form, index) => (
              <motion.div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl border border-white/50 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: form.delay }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${form.bgColor}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${form.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Download className="h-8 w-8 text-white" />
                  </motion.div>

                  <h3 className="font-bold text-lg mb-4 group-hover:text-emerald-600 transition-colors">
                    {form.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {form.description}
                  </p>
                  
                  <motion.button
                    className={`bg-gradient-to-r ${form.color} text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 group/btn`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download PDF
                    <motion.div
                      className="inline-block ml-2"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Download className="h-4 w-4 inline" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section id="apply" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20" />
        
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
              Ready to Apply?
            </h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Take the next step in your educational journey. Our admissions team 
              is here to help you through every step of the process and make your dreams a reality.
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
                  href="/contact" 
                  className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-lg group"
                >
                  Start Your Application
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
                  className="inline-flex items-center border-2 border-white/80 text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-emerald-900 transition-all duration-300 backdrop-blur-sm"
                >
                  Contact Admissions Office
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
  );
}