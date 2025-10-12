/**
 * Tests for core animation components
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { LoadingMask } from '../LoadingMask';
import { PageTransition, SharedElement } from '../PageTransition';
import { HeroMorph } from '../HeroMorph';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
    stop: ({ children, ...props }: any) => <stop {...props}>{children}</stop>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
}));

describe('LoadingMask', () => {
  it('renders when isLoading is true', () => {
    render(
      <MotionProvider>
        <LoadingMask isLoading={true} />
      </MotionProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render when isLoading is false', () => {
    render(
      <MotionProvider>
        <LoadingMask isLoading={false} />
      </MotionProvider>
    );
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MotionProvider>
        <LoadingMask isLoading={true} className="custom-class" />
      </MotionProvider>
    );
    
    const loadingMask = container.querySelector('.custom-class');
    expect(loadingMask).toBeInTheDocument();
  });
});

describe('PageTransition', () => {
  it('renders children correctly', () => {
    render(
      <MotionProvider>
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      </MotionProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MotionProvider>
        <PageTransition className="page-wrapper">
          <div>Test Content</div>
        </PageTransition>
      </MotionProvider>
    );
    
    const wrapper = container.querySelector('.page-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('accepts pageKey prop', () => {
    render(
      <MotionProvider>
        <PageTransition pageKey="home">
          <div>Home Page</div>
        </PageTransition>
      </MotionProvider>
    );
    
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

describe('SharedElement', () => {
  it('renders children with layoutId', () => {
    render(
      <MotionProvider>
        <SharedElement layoutId="test-element">
          <div>Shared Content</div>
        </SharedElement>
      </MotionProvider>
    );
    
    expect(screen.getByText('Shared Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MotionProvider>
        <SharedElement layoutId="test-element" className="shared-class">
          <div>Shared Content</div>
        </SharedElement>
      </MotionProvider>
    );
    
    const element = container.querySelector('.shared-class');
    expect(element).toBeInTheDocument();
  });
});

describe('HeroMorph', () => {
  it('renders SVG blob', () => {
    const { container } = render(
      <MotionProvider>
        <HeroMorph />
      </MotionProvider>
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts custom colors', () => {
    const { container } = render(
      <MotionProvider>
        <HeroMorph colors={['#FF0000', '#0000FF']} />
      </MotionProvider>
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MotionProvider>
        <HeroMorph className="hero-custom" />
      </MotionProvider>
    );
    
    const wrapper = container.querySelector('.hero-custom');
    expect(wrapper).toBeInTheDocument();
  });

  it('accepts speed and parallaxIntensity props', () => {
    const { container } = render(
      <MotionProvider>
        <HeroMorph speed={2} parallaxIntensity={0.8} />
      </MotionProvider>
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
