'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Tag, User, Newspaper, Megaphone, Star, Trophy } from "lucide-react";
import Link from "next/link";
import FacebookFeed from '@/components/news/FacebookFeed';

const floatingIcons = [
  { Icon: Newspaper, delay: 0, x: '14%', y: '24%' },
  { Icon: Megaphone, delay: 0.5, x: '86%', y: '19%' },
  { Icon: Calendar, delay: 1, x: '11%', y: '66%' },
  { Icon: Star, delay: 1.5, x: '89%', y: '71%' },
  { Icon: Trophy, delay: 2, x: '76%', y: '44%' },
  { Icon: Tag, delay: 2.5, x: '21%', y: '49%' },
];

const featuredNews = {
  title: "PCC Celebrates 25th Founding Anniversary",
  date: "December 20, 2024",
  category: "College News",
  excerpt: "Passi City College marks a significant milestone as it celebrates 25 years of excellence in education. The grand celebration featured various activities including cultural shows, academic competitions, and alumni homecoming.",
  image: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  content: "Full story content would be here..."
};

const newsArticles = [
  {
    id: 1,
    title: "Spring 2025 Enrollment Now Open",
    date: "December 15, 2024",
    category: "Admissions",
    excerpt: "Registration for the Spring 2025 semester is now open. Secure your spot in your preferred program today.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Admissions Office"
  },
  {
    id: 2,
    title: "Annual Awards Ceremony 2024",
    date: "December 10, 2024",
    category: "Events",
    excerpt: "Join us in celebrating our outstanding students and faculty members at our Annual Awards Ceremony.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Student Affairs"
  },
  {
    id: 3,
    title: "New Computer Laboratory Opens",
    date: "December 5, 2024",
    category: "Facilities",
    excerpt: "State-of-the-art computer laboratory with the latest technology is now available for student use.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "IT Department"
  },
  {
    id: 4,
    title: "PCC Students Excel in Regional Competition",
    date: "November 28, 2024",
    category: "Achievements",
    excerpt: "Computer Science students from PCC won first place in the Regional Programming Competition held in Iloilo City.",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Academic Affairs"
  },
  {
    id: 5,
    title: "Community Outreach Program Launched",
    date: "November 20, 2024",
    category: "Community",
    excerpt: "PCC launches comprehensive community outreach program focusing on education and health services for remote areas.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Extension Services"
  },
  {
    id: 6,
    title: "Faculty Development Workshop Series",
    date: "November 15, 2024",
    category: "Faculty",
    excerpt: "Monthly faculty development workshops focusing on modern teaching methodologies and research techniques.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Human Resources"
  }
];

const upcomingEvents = [
  {
    title: "Graduation Ceremony",
    date: "March 15, 2025",
    time: "9:00 AM",
    location: "PCC Gymnasium",
    description: "Commencement exercises for Class of 2025"
  },
  {
    title: "Research Conference",
    date: "February 20, 2025",
    time: "8:00 AM",
    location: "Conference Hall",
    description: "Annual student and faculty research presentation"
  },
  {
    title: "Sports Festival",
    date: "February 10-14, 2025",
    time: "All Day",
    location: "Campus Grounds",
    description: "Inter-college sports competition and activities"
  },
  {
    title: "Career Fair",
    date: "January 25, 2025",
    time: "10:00 AM",
    location: "Main Auditorium",
    description: "Job opportunities and career guidance for students"
  }
];

const categories = ["All", "College News", "Admissions", "Events", "Facilities", "Achievements", "Community", "Faculty"];

export default function News() {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-red-100/30" />
          
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }} 
            />
          </div>

          <motion.div
            className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-amber-400/20 via-orange-400/15 to-red-400/10 rounded-full blur-3xl"
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
            className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-red-400/15 via-pink-400/10 to-purple-400/15 rounded-full blur-3xl"
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
              <Icon className="w-8 h-8 lg:w-12 lg:h-12 text-amber-600/20" />
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full text-amber-700 font-medium text-sm mb-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Newspaper className="w-4 h-4" />
              Latest Updates from PCC
            </motion.div>

            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 px-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              News &{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Events
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Stay updated with the latest news, announcements, and upcoming events 
              at Passi City College. Discover what's happening in our vibrant campus community.
            </motion.p>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { number: '50+', label: 'News Articles' },
                { number: '25+', label: 'Events/Month' },
                { number: '8', label: 'Categories' },
                { number: '24/7', label: 'Updates' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600 mb-1">
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
              <motion.button 
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-semibold shadow-lg text-sm sm:text-base relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Latest News</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              <motion.button 
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-amber-200 text-amber-700 rounded-full font-semibold hover:bg-amber-50 transition-all duration-300 text-sm sm:text-base shadow-lg"
                whileHover={{ scale: 1.05, borderColor: '#D97706' }}
                whileTap={{ scale: 0.95 }}
              >
                View Events
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Featured News */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-orange-100/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Story</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Highlighting the most important news and achievements from our college community
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="lg:flex">
              <motion.div 
                className="lg:w-1/2 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={featuredNews.image} 
                  alt={featuredNews.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
              
              <div className="lg:w-1/2 p-8 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center mb-6">
                    <motion.span 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      {featuredNews.category}
                    </motion.span>
                    <div className="flex items-center ml-4 text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                      {featuredNews.date}
                    </div>
                  </div>

                  <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {featuredNews.title}
                  </h2>
                  
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {featuredNews.excerpt}
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/news/featured" 
                      className="inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-full font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg group"
                    >
                      Read Full Story
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
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="lg:flex lg:gap-12">
          {/* Enhanced Main Content */}
          <div className="lg:w-2/3">
            {/* Enhanced Category Filter */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Latest <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">News</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={index}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      category === "All" 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" 
                        : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-gray-200 shadow-sm"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Enhanced News Articles */}
            <div className="space-y-8">
              {newsArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-white/50 relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="md:flex relative z-10">
                    <motion.div 
                      className="md:w-1/3 relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                    
                    <div className="md:w-2/3 p-6 lg:p-8">
                      <div className="flex items-center mb-4">
                        <motion.span 
                          className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold border border-amber-200"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Tag className="h-3 w-3 mr-2 inline" />
                          {article.category}
                        </motion.span>
                        <div className="flex items-center ml-4 text-gray-500 text-sm">
                          <User className="h-4 w-4 mr-2 text-amber-500" />
                          {article.author}
                        </div>
                      </div>

                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors leading-tight">
                        {article.title}
                      </h3>
                      
                      <div className="flex items-center mb-4 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                        {article.date}
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {article.excerpt}
                      </p>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          href={`/news/${article.id}`} 
                          className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors group/link"
                        >
                          Read More
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
                </motion.article>
              ))}
            </div>

            {/* Facebook Feed Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <FacebookFeed limit={6} showHeader={true} />
            </motion.div>

            {/* Enhanced Pagination */}
            <motion.div
              className="mt-16 flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex space-x-3">
                {['Previous', '1', '2', '3', 'Next'].map((item, index) => (
                  <motion.button
                    key={index}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      item === '1' 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" 
                        : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-gray-200 shadow-sm"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:w-1/3 mt-12 lg:mt-0">
            {/* Enhanced Upcoming Events */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-amber-500" />
                Upcoming Events
              </h3>
              <div className="space-y-6">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    className="group relative p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-l-4 border-amber-500 hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {event.title}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="text-amber-500 mr-2">📍</span>
                        {event.location}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">{event.description}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/events" 
                  className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors group"
                >
                  View All Events
                  <motion.div
                    className="ml-2"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Enhanced Quick Links */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/50"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-2 text-amber-500" />
                Quick Links
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "Admission Guidelines", href: "/admissions" },
                  { label: "Academic Programs", href: "/programs" },
                  { label: "Contact Information", href: "/contact" },
                  { label: "About PCC", href: "/about" }
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href={link.href} 
                        className="flex items-center text-gray-600 hover:text-amber-600 transition-colors group p-2 rounded-lg hover:bg-amber-50"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Enhanced Newsletter Signup */}
            <motion.div
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 border border-amber-200 shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Megaphone className="h-6 w-6 mr-2 text-amber-500" />
                Stay Updated
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Subscribe to our newsletter to receive the latest news and announcements directly in your inbox.
              </p>
              <form className="space-y-4">
                <motion.input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe Now
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}