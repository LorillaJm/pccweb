/**
 * Premium Design System Theme Configuration
 * 
 * This file contains all color tokens, typography scales, and design system
 * configurations for the premium frontend animations feature.
 */

export const premiumTheme = {
  colors: {
    // Primary colors
    primary: '#0B132B',      // Very dark navy - main background
    accent: '#FF5A5F',       // Vibrant coral - CTA buttons
    secondary: '#00D4FF',    // Electric cyan - secondary accent
    surface: '#0F1724',      // Dark surface - cards and elevated elements
    
    // Text colors
    textLight: '#F8FAFC',    // Near white - primary text
    textMuted: '#9AA4B2',    // Muted text - secondary text
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Gradient colors for animations
    gradients: {
      hero: ['#FF5A5F', '#00D4FF'],
      card: ['#0F1724', '#1A2332'],
      accent: ['#FF5A5F', '#FF8A8F'],
      secondary: ['#00D4FF', '#00A8CC'],
    },
  },
  
  typography: {
    // Font families
    fonts: {
      headline: 'var(--font-headline, var(--font-poppins, "Poppins", sans-serif))',
      body: 'var(--font-body, var(--font-inter, "Inter", sans-serif))',
      mono: 'var(--font-mono, "Space Grotesk", monospace)',
    },
    
    // Font weights
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    // Font sizes (in pixels)
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
    },
    
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    
    // Letter spacing
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    },
    
    // Typography presets
    presets: {
      h1: {
        fontSize: '48px',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-headline)',
      },
      h2: {
        fontSize: '28px',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-headline)',
      },
      h3: {
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        fontFamily: 'var(--font-headline)',
      },
      body: {
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0',
        fontFamily: 'var(--font-body)',
      },
      bodyLarge: {
        fontSize: '18px',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0',
        fontFamily: 'var(--font-body)',
      },
      bodySmall: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0',
        fontFamily: 'var(--font-body)',
      },
      cta: {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        textTransform: 'uppercase' as const,
        fontFamily: 'var(--font-body)',
      },
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    
    // Premium shadows with color
    premium: {
      accent: '0 20px 40px rgba(255, 90, 95, 0.3)',
      secondary: '0 20px 40px rgba(0, 212, 255, 0.3)',
      card: '0 20px 40px rgba(0, 0, 0, 0.3)',
    },
  },
  
  transitions: {
    // Duration presets
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    // Easing curves
    easing: {
      smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    loadingMask: 9999,
  },
} as const;

// Type exports for TypeScript
export type PremiumTheme = typeof premiumTheme;
export type ThemeColors = typeof premiumTheme.colors;
export type ThemeTypography = typeof premiumTheme.typography;
export type ThemeSpacing = typeof premiumTheme.spacing;

// Helper function to get CSS custom property
export const getCSSVar = (value: string): string => {
  return `var(${value})`;
};

// Helper function to create gradient string
export const createGradient = (colors: string[], direction = 'to right'): string => {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
};

// Export default theme
export default premiumTheme;
