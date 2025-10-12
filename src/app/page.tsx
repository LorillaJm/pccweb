import { HeroSection } from "@/components/home/HeroSection";
import { MissionVisionValues } from "@/components/home/MissionVisionValues";
import { LatestNews } from "@/components/home/LatestNews";
import { ProgramsHighlight } from "@/components/home/ProgramsHighlight";
import { EventsCalendar } from "@/components/home/EventsCalendar";
import { Testimonials } from "@/components/home/Testimonials";
import { CampusTour } from "@/components/home/CampusTour";
import { QuickLinks } from "@/components/home/QuickLinks";
import { CTASection } from "@/components/home/CTASection";
import { PageTransition } from "@/components/animations/PageTransition";

export default function Home() {
  return (
    <PageTransition pageKey="home">
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
        {/* Hero Section with Animated Stats */}
        <HeroSection />
        
        {/* Mission, Vision & Core Values */}
        <MissionVisionValues />
        
        {/* Programs Highlight */}
        <ProgramsHighlight />
        
        {/* Latest News & Announcements */}
        <LatestNews />
        
        {/* Events Calendar Preview */}
        <EventsCalendar />
        
        {/* Student & Alumni Testimonials */}
        <Testimonials />
        
        {/* Campus Tour Video */}
        <CampusTour />
        
        {/* Quick Links Section */}
        <QuickLinks />
        
        {/* Call to Action */}
        <CTASection />
      </div>
    </PageTransition>
  );
}
