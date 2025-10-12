import { render } from '@testing-library/react';
import { SVGLineDraw } from '../SVGLineDraw';
import { MotionProvider } from '@/components/motion/MotionProvider';

describe('SVGLineDraw', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MotionProvider>
        <SVGLineDraw path="M 10 10 L 90 90" />
      </MotionProvider>
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom stroke color', () => {
    const { container } = render(
      <MotionProvider>
        <SVGLineDraw path="M 10 10 L 90 90" strokeColor="#00D4FF" />
      </MotionProvider>
    );
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#00D4FF');
  });

  it('renders with custom viewBox', () => {
    const { container } = render(
      <MotionProvider>
        <SVGLineDraw path="M 10 10 L 90 90" viewBox="0 0 200 200" />
      </MotionProvider>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
  });
});
