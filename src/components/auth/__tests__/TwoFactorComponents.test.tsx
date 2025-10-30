/**
 * Basic tests for 2FA components
 * 
 * These tests verify that the components render without errors
 * and have the expected structure.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TwoFactorInput } from '../TwoFactorInput';
import { TwoFactorBackupCodes } from '../TwoFactorBackupCodes';

describe('TwoFactorInput', () => {
  it('renders 6 input fields by default', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(
      <TwoFactorInput onComplete={mockOnComplete} />
    );
    
    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs).toHaveLength(6);
  });

  it('calls onComplete when all fields are filled', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(
      <TwoFactorInput onComplete={mockOnComplete} />
    );
    
    const inputs = container.querySelectorAll('input[type="text"]');
    
    // Fill all inputs
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });
    
    // Should call onComplete with the complete code
    expect(mockOnComplete).toHaveBeenCalledWith('123456');
  });

  it('displays error message when provided', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(
      <TwoFactorInput 
        onComplete={mockOnComplete} 
        error="Invalid code" 
      />
    );
    
    expect(container.textContent).toContain('Invalid code');
  });
});

describe('TwoFactorBackupCodes', () => {
  const mockCodes = [
    'ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345',
    'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'
  ];

  it('renders all backup codes', () => {
    const mockOnAcknowledge = vi.fn();
    const { container } = render(
      <TwoFactorBackupCodes 
        codes={mockCodes} 
        onAcknowledge={mockOnAcknowledge} 
      />
    );
    
    mockCodes.forEach(code => {
      expect(container.textContent).toContain(code);
    });
  });

  it('requires acknowledgment before continuing', () => {
    const mockOnAcknowledge = vi.fn();
    const { container } = render(
      <TwoFactorBackupCodes 
        codes={mockCodes} 
        onAcknowledge={mockOnAcknowledge} 
      />
    );
    
    // Find the Continue button
    const continueButton = screen.getByText('Continue');
    
    // Should be disabled initially
    expect(continueButton).toBeDisabled();
  });
});
