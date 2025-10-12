'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { PremiumButton } from '@/components/premium/PremiumButton';
import { premiumTheme } from '@/styles/theme';

export function CTASection() {
  return (
    <section 
      className="relative py-24 overflow-hidden"
      style={{
        backgroundColor: premiumTheme.colors.primary,
      }}
    >
      {/* Animated gradient background */}
      {/* Requirements: 8.1, 8.6 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${premiumTheme.colors.surface} 0%, ${premiumTheme.colors.primary} 50%, ${premiumTheme.colors.surface} 100%)`,
        }}
      />

      {/* Animated background elements with premium colors */}
      {/* Requirements: 8.1 */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full filter blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: premiumTheme.colors.accent }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full filter blur-3xl opacity-20 animate-pulse" 
          style={{ 
            backgroundColor: premiumTheme.colors.secondary,
            animationDelay: '1s',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Typography with premium font scales */}
          {/* Requirements: 8.1, 8.6 */}
          <h2 
            className="font-bold mb-6"
            style={{
              fontSize: premiumTheme.typography.sizes['5xl'],
              fontFamily: premiumTheme.typography.fonts.headline,
              fontWeight: premiumTheme.typography.weights.bold,
              letterSpacing: premiumTheme.typography.letterSpacing.tight,
              color: premiumTheme.colors.textLight,
              lineHeight: premiumTheme.typography.lineHeights.tight,
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p 
            className="mb-12 leading-relaxed"
            style={{
              fontSize: premiumTheme.typography.sizes['2xl'],
              fontFamily: premiumTheme.typography.fonts.body,
              color: premiumTheme.colors.textMuted,
              lineHeight: premiumTheme.typography.lineHeights.relaxed,
            }}
          >
            Take the first step towards your future. Join the PCC community and 
            unlock your potential with world-class education and endless opportunities.
          </p>
          
          {/* Premium Buttons with ripple effects */}
          {/* Requirements: 2.1, 2.2, 2.3, 2.6, 10.1, 10.2 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/admissions">
              <PremiumButton 
                variant="primary"
                size="lg"
                className="group inline-flex items-center justify-center"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </PremiumButton>
            </Link>
            <Link href="/contact">
              <PremiumButton 
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center"
              >
                Contact Us
              </PremiumButton>
            </Link>
          </div>

          {/* Contact Info with premium colors */}
          {/* Requirements: 8.1, 8.6 */}
          <div 
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            style={{ color: premiumTheme.colors.textLight }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="backdrop-blur-sm p-3 rounded-full"
                style={{ backgroundColor: `${premiumTheme.colors.surface}80` }}
              >
                <Phone className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div 
                  className="text-sm"
                  style={{ color: premiumTheme.colors.textMuted }}
                >
                  Call Us
                </div>
                <div 
                  className="font-semibold"
                  style={{ color: premiumTheme.colors.textLight }}
                >
                  (033) 396-XXXX
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="backdrop-blur-sm p-3 rounded-full"
                style={{ backgroundColor: `${premiumTheme.colors.surface}80` }}
              >
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div 
                  className="text-sm"
                  style={{ color: premiumTheme.colors.textMuted }}
                >
                  Email Us
                </div>
                <div 
                  className="font-semibold"
                  style={{ color: premiumTheme.colors.textLight }}
                >
                  info@passicitycollege.edu.ph
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
