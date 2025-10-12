'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Linkedin, Users } from 'lucide-react';

const team = [
  {
    name: 'Dr. Sarah Johnson',
    position: 'President',
    image: '/team/president.jpg',
    email: 'sarah.johnson@pcc.edu',
    linkedin: '#',
    bio: 'Leading PCC with 20+ years of experience in higher education.',
  },
  {
    name: 'Prof. Michael Chen',
    position: 'Dean of Engineering',
    image: '/team/dean-eng.jpg',
    email: 'michael.chen@pcc.edu',
    linkedin: '#',
    bio: 'Expert in robotics and AI with numerous research publications.',
  },
  {
    name: 'Dr. Emily Rodriguez',
    position: 'Dean of Sciences',
    image: '/team/dean-sci.jpg',
    email: 'emily.rodriguez@pcc.edu',
    linkedin: '#',
    bio: 'Pioneering research in biotechnology and environmental science.',
  },
  {
    name: 'Prof. David Williams',
    position: 'Dean of Arts',
    image: '/team/dean-arts.jpg',
    email: 'david.williams@pcc.edu',
    linkedin: '#',
    bio: 'Award-winning educator fostering creativity and innovation.',
  },
  {
    name: 'Dr. Lisa Anderson',
    position: 'Director of Research',
    image: '/team/research.jpg',
    email: 'lisa.anderson@pcc.edu',
    linkedin: '#',
    bio: 'Leading cutting-edge research initiatives and collaborations.',
  },
  {
    name: 'Prof. James Taylor',
    position: 'Head of Student Affairs',
    image: '/team/student-affairs.jpg',
    email: 'james.taylor@pcc.edu',
    linkedin: '#',
    bio: 'Dedicated to student success and campus life enhancement.',
  },
];

export function TeamSection() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 relative bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl"
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
      
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Users className="w-4 h-4" />
            Our Leaders
          </motion.div>
          
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meet Our Leadership <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Team</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Experienced educators and administrators dedicated to your success
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              className="relative h-80 sm:h-96 perspective-1000"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setFlippedCard(index)}
              onMouseLeave={() => setFlippedCard(null)}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: flippedCard === index ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 rounded-3xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Image Placeholder with Gradient */}
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl sm:text-6xl font-bold text-white">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{member.name}</h3>
                    <p className="text-sm sm:text-base text-blue-600 font-medium">{member.position}</p>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500 p-6 flex flex-col justify-center shadow-lg"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="text-sm sm:text-base text-white mb-4 sm:mb-6 leading-relaxed">{member.bio}</p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 sm:gap-3 text-blue-100 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{member.email}</span>
                    </a>
                    <a
                      href={member.linkedin}
                      className="flex items-center gap-2 sm:gap-3 text-blue-100 hover:text-white transition-colors"
                    >
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">LinkedIn Profile</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
