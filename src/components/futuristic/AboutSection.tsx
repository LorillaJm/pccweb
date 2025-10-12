'use client';

import { motion } from 'framer-motion';

export function AboutSection() {
  const values = [
    {
      icon: '🎯',
      title: 'Innovation',
      description: 'Pushing boundaries of what\'s possible in education and technology',
      gradient: 'var(--neural-gradient-1)',
    },
    {
      icon: '🌟',
      title: 'Excellence',
      description: 'Maintaining the highest standards across all dimensions',
      gradient: 'var(--neural-gradient-2)',
    },
    {
      icon: '🤝',
      title: 'Collaboration',
      description: 'Building bridges between minds across the cosmos',
      gradient: 'var(--neural-gradient-3)',
    },
    {
      icon: '🌍',
      title: 'Sustainability',
      description: 'Ensuring a thriving future for all civilizations',
      gradient: 'var(--neural-gradient-4)',
    },
  ];

  const timeline = [
    { year: '2500', event: 'University Founded on Earth' },
    { year: '2750', event: 'First Quantum Computing Program' },
    { year: '2850', event: 'Mars Campus Established' },
    { year: '2950', event: 'Neural Interface Department Created' },
    { year: '3000', event: 'Interstellar Education Network Launched' },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full holographic opacity-10 blur-3xl quantum-float" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl quantum-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-32"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-8 holographic-text">
            About University 3000
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            For 500 years, we've been pioneering the future of education. From our humble beginnings on Earth to our expanding network across the galaxy, we remain committed to excellence, innovation, and the advancement of all sentient beings.
          </p>
          
          <div className="neural-card max-w-5xl mx-auto p-12">
            <h3 className="text-3xl font-bold mb-6 text-white">Our Mission</h3>
            <p className="text-xl text-gray-300 leading-relaxed">
              To empower the next generation of innovators, thinkers, and leaders through cutting-edge education that transcends planetary boundaries and prepares students for the challenges and opportunities of an interstellar civilization.
            </p>
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h3 className="text-5xl font-bold mb-16 text-center holographic-text">
            Core Values
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="neural-card text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl mb-6"
                >
                  {value.icon}
                </motion.div>
                
                <h4 className="text-2xl font-bold mb-4 text-white group-hover:holographic-text transition-all">
                  {value.title}
                </h4>
                
                <p className="text-gray-400 leading-relaxed">
                  {value.description}
                </p>

                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: value.gradient,
                    filter: 'blur(30px)',
                    zIndex: -1,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h3 className="text-5xl font-bold mb-16 text-center holographic-text">
            Our Journey
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full holographic-divider" />
            
            <div className="space-y-16">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="neural-card inline-block">
                      <div className="holographic-text text-3xl font-bold mb-2">
                        {item.year}
                      </div>
                      <p className="text-gray-300 text-lg">
                        {item.event}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    className="w-16 h-16 rounded-full quantum-glass flex items-center justify-center neural-glow-md relative z-10"
                  >
                    <div className="w-8 h-8 rounded-full holographic" />
                  </motion.div>
                  
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="neural-card p-12"
        >
          <h3 className="text-4xl font-bold mb-12 text-center holographic-text">
            By the Numbers
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Years of Excellence' },
              { value: '50K+', label: 'Active Students' },
              { value: '200+', label: 'Programs Offered' },
              { value: '150+', label: 'Countries Represented' },
              { value: '5', label: 'Planetary Campuses' },
              { value: '95%', label: 'Graduate Success Rate' },
              { value: '10K+', label: 'Faculty Members' },
              { value: '1M+', label: 'Alumni Network' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="text-center quantum-glass rounded-2xl p-6"
              >
                <div className="holographic-text text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20"
        >
          <h3 className="text-3xl font-bold mb-6 text-white">
            Ready to Join Our Legacy?
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Be part of the next chapter in our 500-year journey of innovation and excellence
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="quantum-btn text-lg px-12 py-4"
          >
            Apply Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
