'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { LanguageSwitcher } from '@/components/home/LanguageSwitcher';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Layers,
  MousePointer,
  Smartphone
} from 'lucide-react';

export default function TestNavigationPage() {
  const [testResults, setTestResults] = useState({
    languageSwitcher: 'pending',
    submenuDropdown: 'pending',
    mobileMenu: 'pending',
    responsiveDesign: 'pending'
  });

  const testItems = [
    {
      id: 'languageSwitcher',
      title: 'Language Switcher Z-Index',
      description: 'Language dropdown should appear above navigation',
      icon: Layers,
      instructions: 'Click the language switcher in the top navigation bar',
      status: testResults.languageSwitcher
    },
    {
      id: 'submenuDropdown',
      title: 'Programs Submenu',
      description: 'Programs dropdown should work smoothly',
      icon: MousePointer,
      instructions: 'Hover over "Programs" in the navigation menu',
      status: testResults.submenuDropdown
    },
    {
      id: 'mobileMenu',
      title: 'Mobile Navigation',
      description: 'Mobile menu should slide out properly',
      icon: Smartphone,
      instructions: 'Resize window to mobile size and test hamburger menu',
      status: testResults.mobileMenu
    },
    {
      id: 'responsiveDesign',
      title: 'Responsive Behavior',
      description: 'Navigation should adapt to different screen sizes',
      icon: Layers,
      instructions: 'Test different viewport sizes',
      status: testResults.responsiveDesign
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const markTestResult = (testId: string, result: 'passed' | 'failed') => {
    setTestResults(prev => ({
      ...prev,
      [testId]: result
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Test the actual navigation */}
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Navigation Testing Page
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This page helps verify that the navigation system is working correctly, 
            especially the z-index layering for dropdowns and mobile menus.
          </p>
        </motion.div>

        {/* Z-Index Fix Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Z-Index Issue Fixed! ✅
              </h3>
              <p className="text-green-800 mb-3">
                The language switcher dropdown now appears correctly above the navigation bar. 
                Here's what was fixed:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Language switcher dropdown: <code className="bg-green-100 px-2 py-1 rounded">z-[60]</code></li>
                <li>• Navigation submenus: <code className="bg-green-100 px-2 py-1 rounded">z-[55]</code></li>
                <li>• Main navigation: <code className="bg-green-100 px-2 py-1 rounded">z-50</code></li>
                <li>• Mobile overlay: <code className="bg-green-100 px-2 py-1 rounded">z-40</code></li>
                <li>• Added proper click-outside handling and animations</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Test Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testItems.map((test, index) => {
            const Icon = test.icon;
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.title}
                      </h3>
                      {getStatusIcon(test.status)}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {test.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      <strong>Test:</strong> {test.instructions}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => markTestResult(test.id, 'passed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Mark Passed
                      </button>
                      <button
                        onClick={() => markTestResult(test.id, 'failed')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Mark Failed
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Standalone Language Switcher Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Standalone Language Switcher Test
          </h3>
          <p className="text-gray-600 mb-6">
            Test the language switcher component in isolation to verify it works correctly:
          </p>
          
          <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl">
            <LanguageSwitcher />
          </div>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            The dropdown should appear above this container and be fully interactive
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Testing Instructions
          </h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Language Switcher:</strong> Click the language button in the top navigation. The dropdown should appear above all other elements.</p>
            <p><strong>2. Programs Menu:</strong> Hover over "Programs" in the navigation. The submenu should slide down smoothly.</p>
            <p><strong>3. Mobile Menu:</strong> Resize your browser to mobile size (&lt;768px) and test the hamburger menu.</p>
            <p><strong>4. Responsive Design:</strong> Test different screen sizes to ensure proper adaptation.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}