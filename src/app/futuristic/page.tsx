'use client';

import {
  FuturisticNavigation,
  FuturisticHero,
  ProgramsShowcase,
  NewsEventsSection,
  TestimonialsSection,
  ContactSection,
  FuturisticFooter,
} from '@/components/futuristic';

export default function FuturisticPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Neural Network Background */}
      <div className="neural-network-bg" />
      
      {/* Navigation */}
      <FuturisticNavigation />
      
      {/* Hero Section */}
      <FuturisticHero />
      
      {/* Programs Showcase */}
      <ProgramsShowcase />
      
      {/* News & Events */}
      <NewsEventsSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <FuturisticFooter />
    </div>
  );
}
