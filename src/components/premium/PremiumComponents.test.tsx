/**
 * Premium Components Test
 * 
 * Basic tests to verify premium components render correctly
 */

import React from 'react';
import { PremiumCard, PremiumButton, PremiumInput } from './index';

/**
 * Test component that demonstrates all premium components
 */
export function PremiumComponentsDemo() {
  return (
    <div className="p-8 space-y-8 bg-primary min-h-screen">
      <h1 className="text-4xl font-bold text-textLight mb-8">Premium Components Demo</h1>
      
      {/* PremiumCard Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-textLight">Premium Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard className="p-6 bg-surface">
            <h3 className="text-xl font-bold text-textLight mb-2">Card 1</h3>
            <p className="text-textMuted">Hover over me to see the morph animation!</p>
          </PremiumCard>
          
          <PremiumCard className="p-6 bg-surface" hoverScale={1.05}>
            <h3 className="text-xl font-bold text-textLight mb-2">Card 2</h3>
            <p className="text-textMuted">I have a larger scale on hover.</p>
          </PremiumCard>
          
          <PremiumCard className="p-6 bg-surface">
            <h3 className="text-xl font-bold text-textLight mb-2">Card 3</h3>
            <p className="text-textMuted">Border-radius morphs smoothly!</p>
          </PremiumCard>
        </div>
      </section>
      
      {/* PremiumButton Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-textLight">Premium Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <PremiumButton variant="primary">
            Primary Button
          </PremiumButton>
          
          <PremiumButton variant="secondary">
            Secondary Button
          </PremiumButton>
          
          <PremiumButton variant="outline">
            Outline Button
          </PremiumButton>
          
          <PremiumButton variant="primary" size="sm">
            Small
          </PremiumButton>
          
          <PremiumButton variant="primary" size="lg">
            Large
          </PremiumButton>
          
          <PremiumButton variant="primary" disabled>
            Disabled
          </PremiumButton>
        </div>
      </section>
      
      {/* PremiumInput Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-textLight">Premium Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <PremiumInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            helperText="We'll never share your email"
          />
          
          <PremiumInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            validationState="idle"
          />
          
          <PremiumInput
            label="Username"
            type="text"
            value="johndoe"
            validationState="success"
            successText="Username is available!"
          />
          
          <PremiumInput
            label="Phone Number"
            type="tel"
            value="invalid"
            validationState="error"
            errorText="Please enter a valid phone number"
          />
          
          <PremiumInput
            label="Full Name"
            type="text"
            size="lg"
            placeholder="John Doe"
          />
          
          <PremiumInput
            label="Code"
            type="text"
            size="sm"
            placeholder="Enter code"
          />
        </div>
      </section>
    </div>
  );
}

export default PremiumComponentsDemo;
