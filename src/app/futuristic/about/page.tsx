'use client';

import {
  FuturisticNavigation,
  AboutSection,
  FuturisticFooter,
} from '@/components/futuristic';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Neural Network Background */}
      <div className="neural-network-bg" />
      
      {/* Navigation */}
      <FuturisticNavigation />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Footer */}
      <FuturisticFooter />
    </div>
  );
}
