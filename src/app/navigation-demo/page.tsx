'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Palette, 
  Zap, 
  Accessibility,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function NavigationDemoPage() {
  const [activeDemo, setActiveDemo] = useState('responsive');

  const demoSections = [
    {
      id: 'responsive',
      title: 'Responsive Design',
      icon: Smartphone,
      description: 'Seamlessly adapts to all screen sizes',
      features: [
        'Mobile-first approach',
        'Touch-friendly interactions',
        'Adaptive layouts',
        'Progressive enhancement'
      ]
    },
    {
      id: 'animations',
      title: 'Smooth Animations',
      icon: Zap,
      description: 'Framer Motion powered micro-interactions',
      features: [
        'Page transitions',
        'Hover effects',
        'Loading states',
        'Gesture support'
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility First',
      icon: Accessibility,
      description: 'WCAG compliant navigation system',
      features: [
        'Keyboard navigation',
        'Screen reader support',
        'Focus management',
        'High contrast mode'
      ]
    },
    {
      id: 'design',
      title: 'Modern Design',
      icon: Palette,
      description: 'Professional aesthetics with glassmorphism',
      features: [
        'Backdrop blur effects',
        'Gradient accents',
        'Typography hierarchy',
        'Visual feedback'
      ]
    }
  ];

  const deviceSizes = [
    { name: 'Mobile', icon: Smartphone, width: '375px', active: true },
    { name: 'Tablet', icon: Tablet, width: '768px', active: false },
    { name: 'Desktop', icon: Monitor, width: '1200px', active: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl">
                <Navigation className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Modern Navigation System
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience our completely redesigned navigation with smooth animations, 
              responsive design, and professional aesthetics that work seamlessly across all devices.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Interactive Demo
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600">
              Built with modern web standards and best practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeDemo === section.id
                      ? 'bg-blue-50 border-blue-200 shadow-lg'
                      : 'bg-white border-gray-200 hover:shadow-lg'
                  }`}
                  onClick={() => setActiveDemo(section.id)}
                >
                  <div className={`p-3 rounded-xl mb-4 ${
                    activeDemo === section.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {section.description}
                  </p>

                  <ul className="space-y-2">
                    {section.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Responsive Preview
            </h2>
            <p className="text-lg text-gray-600">
              See how the navigation adapts to different screen sizes
            </p>
          </div>

          {/* Device Size Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-2 rounded-2xl flex space-x-2">
              {deviceSizes.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.name}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      device.active
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{device.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Frame */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 p-4 rounded-3xl shadow-2xl"
              style={{ width: 'fit-content' }}
            >
              <div 
                className="bg-white rounded-2xl overflow-hidden shadow-lg"
                style={{ width: '375px', height: '600px' }}
              >
                <div className="h-full flex flex-col">
                  {/* Demo Navigation Bar */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                          <Navigation className="h-4 w-4 text-blue-900" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">PCC Portal</div>
                          <div className="text-xs text-blue-200">Excellence in Education</div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-lg">
                        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Demo Content */}
                  <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience the New Navigation?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Explore all the features and improvements in our live application
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>Go to Homepage</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                View Source Code
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}