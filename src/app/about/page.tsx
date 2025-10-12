'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/animations/PageTransition';
import { AboutHero } from '@/components/about/AboutHero';
import { MissionVisionValues } from '@/components/about/MissionVisionValues';
import { InteractiveTimeline } from '@/components/about/InteractiveTimeline';
import { TeamSection } from '@/components/about/TeamSection';
import { StatisticsSection } from '@/components/about/StatisticsSection';
import { WhyChooseUs } from '@/components/about/WhyChooseUs';
import { CampusGallery } from '@/components/about/CampusGallery';
import { VideoIntro } from '@/components/about/VideoIntro';
import { TestimonialsSection } from '@/components/about/TestimonialsSection';
import { AboutCTA } from '@/components/about/AboutCTA';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <AboutHero />
        <MissionVisionValues />
        <InteractiveTimeline />
        <StatisticsSection />
        <TeamSection />
        <WhyChooseUs />
        <VideoIntro />
        <CampusGallery />
        <TestimonialsSection />
        <AboutCTA />
      </div>
    </PageTransition>
  );
}
