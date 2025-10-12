'use client';

import Link from 'next/link';
import { Code, GraduationCap, Briefcase, Heart, Calculator, Globe, ChevronRight } from 'lucide-react';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { PremiumButton } from '@/components/premium/PremiumButton';
import { premiumTheme } from '@/styles/theme';

const programs = [
  {
    icon: Code,
    title: 'Information Technology',
    description: 'Master cutting-edge technologies and software development',
    gradient: [premiumTheme.colors.secondary, premiumTheme.colors.accent],
    courses: ['BS Computer Science', 'BS Information Technology']
  },
  {
    icon: GraduationCap,
    title: 'Education',
    description: 'Shape the future through quality teaching and learning',
    gradient: [premiumTheme.colors.accent, premiumTheme.colors.secondary],
    courses: ['BS Elementary Education', 'BS Secondary Education']
  },
  {
    icon: Briefcase,
    title: 'Business Administration',
    description: 'Develop leadership and entrepreneurial skills',
    gradient: [premiumTheme.colors.secondary, premiumTheme.colors.accent],
    courses: ['BS Business Administration', 'BS Accountancy']
  },
  {
    icon: Heart,
    title: 'Healthcare',
    description: 'Provide compassionate care and medical excellence',
    gradient: [premiumTheme.colors.accent, premiumTheme.colors.secondary],
    courses: ['BS Nursing', 'BS Medical Technology']
  },
  {
    icon: Calculator,
    title: 'Engineering',
    description: 'Build innovative solutions for tomorrow challenges',
    gradient: [premiumTheme.colors.secondary, premiumTheme.colors.accent],
    courses: ['BS Civil Engineering', 'BS Electrical Engineering']
  },
  {
    icon: Globe,
    title: 'Hospitality & Tourism',
    description: 'Excel in the global hospitality industry',
    gradient: [premiumTheme.colors.accent, premiumTheme.colors.secondary],
    courses: ['BS Tourism Management', 'BS Hotel Management']
  }
];

export function ProgramsHighlight() {
  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${premiumTheme.colors.primary} 0%, ${premiumTheme.colors.surface} 50%, ${premiumTheme.colors.primary} 100%)`,
      }}
    >
      {/* Background decoration with premium colors */}
      {/* Requirements: 8.1, 8.6 */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full filter blur-3xl"
          style={{ backgroundColor: premiumTheme.colors.secondary }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl"
          style={{ backgroundColor: premiumTheme.colors.accent }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Typography with premium font scales */}
          {/* Requirements: 8.1, 8.6 */}
          <h2 
            className="font-bold mb-4"
            style={{
              fontSize: premiumTheme.typography.sizes['5xl'],
              fontFamily: premiumTheme.typography.fonts.headline,
              fontWeight: premiumTheme.typography.weights.bold,
              letterSpacing: premiumTheme.typography.letterSpacing.tight,
              color: premiumTheme.colors.textLight,
              lineHeight: premiumTheme.typography.lineHeights.tight,
            }}
          >
            Academic Programs
          </h2>
          <p 
            className="max-w-3xl mx-auto"
            style={{
              fontSize: premiumTheme.typography.sizes.xl,
              fontFamily: premiumTheme.typography.fonts.body,
              color: premiumTheme.colors.textMuted,
              lineHeight: premiumTheme.typography.lineHeights.relaxed,
            }}
          >
            Discover world-class programs designed to prepare you for success in your chosen field
          </p>
        </div>

        {/* Program cards with PremiumCard and hover morph animations */}
        {/* Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.6, 10.1, 10.2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <PremiumCard
                key={index}
                className="group backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300"
                style={{
                  backgroundColor: `${premiumTheme.colors.surface}40`,
                  borderColor: `${premiumTheme.colors.textLight}10`,
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${program.gradient[0]}, ${program.gradient[1]})`,
                  }}
                >
                  <Icon 
                    className="h-8 w-8"
                    style={{ color: premiumTheme.colors.textLight }}
                  />
                </div>
                <h3 
                  className="text-2xl font-bold mb-3 transition-colors"
                  style={{
                    color: premiumTheme.colors.textLight,
                    fontFamily: premiumTheme.typography.fonts.headline,
                  }}
                >
                  {program.title}
                </h3>
                <p 
                  className="mb-4"
                  style={{
                    color: premiumTheme.colors.textMuted,
                    fontFamily: premiumTheme.typography.fonts.body,
                  }}
                >
                  {program.description}
                </p>
                <div className="space-y-2 mb-6">
                  {program.courses.map((course, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm flex items-center"
                      style={{ color: premiumTheme.colors.textMuted }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full mr-2"
                        style={{ backgroundColor: premiumTheme.colors.accent }}
                      />
                      {course}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/programs#${program.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform"
                  style={{ color: premiumTheme.colors.accent }}
                >
                  Learn More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </PremiumCard>
            );
          })}
        </div>

        {/* Premium Button for CTA */}
        {/* Requirements: 8.1, 8.6, 10.1, 10.2 */}
        <div className="text-center">
          <Link href="/programs">
            <PremiumButton 
              variant="primary"
              size="lg"
              className="inline-flex items-center"
            >
              View All Programs
              <ChevronRight className="ml-2 h-5 w-5" />
            </PremiumButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
