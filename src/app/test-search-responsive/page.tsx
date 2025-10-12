'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';
import { 
  Search, 
  Palette, 
  Smartphone, 
  Monitor, 
  Eye,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function TestSearchResponsivePage() {
  const [currentVariant, setCurrentVariant] = useState<'default' | 'light' | 'dark' | 'futuristic'>('light');
  const [currentContext, setCurrentContext] = useState<'navigation' | 'page' | 'modal'>('page');

  const variants = [
    { id: 'light', name: 'Light Theme', bg: 'bg-white', description: 'White background with dark text' },
    { id: 'dark', name: 'Dark Theme', bg: 'bg-gray-800', description: 'Dark background with light text' },
    { id: 'default', name: 'Navigation', bg: 'bg-gradient-to-r from-blue-900 to-indigo-900', description: 'Navigation style with backdrop blur' },
    { id: 'futuristic', name: 'Futuristic', bg: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900', description: 'Futuristic glassmorphism style' }
  ];

  const contexts = [
    { id: 'page', name: 'Page Context', description: 'For use in page content' },
    { id: 'navigation', name: 'Navigation Context', description: 'For use in navigation bars' },
    { id: 'modal', name: 'Modal Context', description: 'For use in modals and overlays' }
  ];

  const features = [
    {
      icon: Palette,
      title: 'Adaptive Text Colors',
      description: 'Text color automatically adapts to background for optimal contrast',
      status: 'implemented'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Touch-optimized with proper sizing and spacing on mobile devices',
      status: 'implemented'
    },
    {
      icon: Monitor,
      title: 'Cross-Device Support',
      description: 'Consistent experience across desktop, tablet, and mobile',
      status: 'implemented'
    },
    {
      icon: Eye,
      title: 'Accessibility Compliant',
      description: 'WCAG 2.1 AA compliant with keyboard navigation and screen reader support',
      status: 'implemented'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl">
                <Search className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Responsive Search Bar
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Test the enhanced search bar with adaptive text colors, responsive design, 
              and professional styling across different themes and contexts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Variant Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-blue-600" />
                Theme Variants
              </h3>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setCurrentVariant(variant.id as any)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      currentVariant === variant.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-sm opacity-75">{variant.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Context Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Context Settings
              </h3>
              <div className="space-y-3">
                {contexts.map((context) => (
                  <button
                    key={context.id}
                    onClick={() => setCurrentContext(context.id as any)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      currentContext === context.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{context.name}</div>
                    <div className="text-sm opacity-75">{context.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Demo */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Live Demo
            </h2>
            <p className="text-gray-600">
              Current: {variants.find(v => v.id === currentVariant)?.name} • {contexts.find(c => c.id === currentContext)?.name}
            </p>
          </motion.div>

          {/* Demo Container */}
          <motion.div
            key={`${currentVariant}-${currentContext}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden ${
              variants.find(v => v.id === currentVariant)?.bg
            }`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                   }} 
              />
            </div>

            {/* Search Bar */}
            <div className="relative z-10 max-w-2xl mx-auto">
              <SearchBar
                variant={currentVariant}
                context={currentContext}
                placeholder="Try searching for programs, news, events..."
                className="w-full"
              />
            </div>

            {/* Demo Info */}
            <div className={`mt-8 text-center text-sm ${
              currentVariant === 'light' ? 'text-gray-600' : 'text-white/70'
            }`}>
              <p>
                Type to see search functionality • Use arrow keys to navigate • Press Escape to close
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enhanced Features
            </h2>
            <p className="text-lg text-gray-600">
              Professional search experience with modern design and accessibility
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center"
                >
                  <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Implemented</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Technical Implementation
            </h2>
          </motion.div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Adaptive Styling
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Dynamic text color based on background</li>
                  <li>• Responsive font sizes and spacing</li>
                  <li>• Context-aware styling variants</li>
                  <li>• Smooth transitions and animations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Accessibility Features
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Keyboard navigation support</li>
                  <li>• Screen reader compatibility</li>
                  <li>• High contrast mode support</li>
                  <li>• Focus management and indicators</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}