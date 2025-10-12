'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ChatbotProvider } from './chatbot/ChatbotProvider';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show public navigation on portal routes
  const isPortalRoute = pathname.startsWith('/portal/') || pathname.startsWith('/auth/');
  
  if (isPortalRoute) {
    return (
      <ChatbotProvider enabled={true}>
        <main>{children}</main>
      </ChatbotProvider>
    );
  }

  return (
    <ChatbotProvider enabled={true}>
      <Navigation />
      <main className="with-fixed-nav">{children}</main>
      <Footer />
    </ChatbotProvider>
  );
}