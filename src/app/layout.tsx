import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OnlineStatus from "@/components/pwa/OnlineStatus";
import PWAInitializer from "@/components/pwa/PWAInitializer";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import SkipToContent from "@/components/accessibility/SkipToContent";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { KeyboardNavigationInit } from "@/components/accessibility/KeyboardNavigationInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Premium fonts for animations
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Passi City College - Excellence in Education",
  description: "Premier educational institution in Passi City, Iloilo, Philippines. Offering quality education with modern facilities and dedicated faculty.",
  manifest: "/manifest.json",
  themeColor: "#1e40af",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PCC Portal",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "PCC Portal",
    title: "Passi City College - Excellence in Education",
    description: "Premier educational institution in Passi City, Iloilo, Philippines.",
  },
  twitter: {
    card: "summary",
    title: "Passi City College - Excellence in Education",
    description: "Premier educational institution in Passi City, Iloilo, Philippines.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PCC Portal" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <SettingsProvider>
              <AuthProvider>
                <MotionProvider>
                  <KeyboardNavigationInit />
                  <SkipLink />
                  <SkipToContent />
                  <PWAInitializer />
                  <PerformanceMonitor />
                  <LayoutWrapper>
                    <main id="main-content">
                      {children}
                    </main>
                  </LayoutWrapper>
                  <InstallPrompt />
                  <OnlineStatus />
                </MotionProvider>
              </AuthProvider>
            </SettingsProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
