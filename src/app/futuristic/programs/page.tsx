'use client';

import {
  FuturisticNavigation,
  ProgramsShowcase,
  FuturisticFooter,
} from '@/components/futuristic';

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Neural Network Background */}
      <div className="neural-network-bg" />
      
      {/* Navigation */}
      <FuturisticNavigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-bold mb-8 holographic-text">
            Our Programs
          </h1>
          <p className="text-2xl text-gray-300 leading-relaxed">
            Explore cutting-edge programs designed for the challenges and opportunities of tomorrow
          </p>
        </div>
      </section>
      
      {/* Programs Showcase */}
      <ProgramsShowcase />
      
      {/* Footer */}
      <FuturisticFooter />
    </div>
  );
}
