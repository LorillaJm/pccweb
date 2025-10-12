'use client';

import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/card';

export default function TestSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl font-bold mb-4">Search Bar Test Page</h1>
          <p className="text-gray-300">Test both search bar variants with live functionality</p>
        </div>

        {/* Default Variant */}
        <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Default Variant</h2>
          <p className="text-gray-300 mb-6">
            Clean, modern design for standard navigation. Try searching for programs, events, or pages.
          </p>
          <SearchBar 
            variant="default"
            placeholder="Search programs, news, events..."
          />
          
          <div className="mt-6 text-sm text-gray-400">
            <p className="font-semibold mb-2">Try these searches:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;computer&quot; - Find Computer Science program</li>
              <li>&quot;event&quot; - Find upcoming events</li>
              <li>&quot;portal&quot; - Find Student Portal</li>
              <li>&quot;nursing&quot; - Find Nursing program</li>
            </ul>
          </div>
        </Card>

        {/* Futuristic Variant */}
        <Card className="p-8 quantum-glass-intense border border-cyan-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 holographic-text">
            Futuristic Variant
          </h2>
          <p className="text-gray-300 mb-6">
            Glassmorphism with neural glow effects. Perfect for modern, tech-forward designs.
          </p>
          <SearchBar 
            variant="futuristic"
            placeholder="Search the quantum database..."
          />
          
          <div className="mt-6 text-sm text-gray-400">
            <p className="font-semibold mb-2">Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Real-time search with debouncing</li>
              <li>Keyboard navigation (↑↓ arrows, Enter, Escape)</li>
              <li>Smart relevance scoring</li>
              <li>Responsive design for all devices</li>
              <li>Accessibility compliant</li>
            </ul>
          </div>
        </Card>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">🎯 Smart Search</h3>
            <p className="text-gray-300 text-sm">
              Advanced relevance scoring ensures the most relevant results appear first.
              Searches across titles, descriptions, and categories.
            </p>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">⚡ Fast Performance</h3>
            <p className="text-gray-300 text-sm">
              Debounced input prevents excessive API calls. Results load in milliseconds
              with smooth animations.
            </p>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">♿ Accessible</h3>
            <p className="text-gray-300 text-sm">
              Full keyboard navigation, ARIA labels, and screen reader support.
              Works perfectly with assistive technologies.
            </p>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">📱 Responsive</h3>
            <p className="text-gray-300 text-sm">
              Optimized for all screen sizes. Touch-friendly on mobile with
              adaptive layouts for tablets and desktops.
            </p>
          </Card>
        </div>

        {/* API Info */}
        <Card className="p-6 bg-green-500/10 backdrop-blur-lg border-green-500/30">
          <h3 className="text-xl font-bold text-white mb-3">🔌 API Endpoint</h3>
          <code className="block bg-black/30 p-4 rounded-lg text-green-400 text-sm">
            GET /api/search?q=your-query
          </code>
          <p className="text-gray-300 text-sm mt-3">
            The search API returns up to 8 results ranked by relevance. Results include
            programs, news, events, and pages with titles, descriptions, and direct links.
          </p>
        </Card>
      </div>
    </div>
  );
}
