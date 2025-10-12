'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, CheckCircle, XCircle, RefreshCw, ExternalLink, Settings } from 'lucide-react';

interface FacebookStatus {
  configured: boolean;
  pageId: string;
  message: string;
}

export default function FacebookSettings() {
  const [status, setStatus] = useState<FacebookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking Facebook status:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/facebook/posts?limit=1');
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Success! Fetched ${data.count} posts from Facebook`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Network Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <Facebook className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Facebook Integration</h3>
      </div>

      {status && (
        <div className="space-y-4">
          {/* Status Card */}
          <div className={`p-4 rounded-lg border-2 ${
            status.configured 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center mb-2">
              {status.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-600 mr-2" />
              )}
              <span className={`font-medium ${
                status.configured ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {status.configured ? 'Connected' : 'Not Configured'}
              </span>
            </div>
            <p className={`text-sm ${
              status.configured ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {status.message}
            </p>
          </div>

          {/* Page Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Facebook Page</h4>
              <p className="text-sm text-gray-600">{status.pageId}</p>
              <a
                href={`https://facebook.com/${status.pageId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                View Page
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Integration Status</h4>
              <p className="text-sm text-gray-600">
                {status.configured ? 'Live data enabled' : 'Using mock data'}
              </p>
              <button
                onClick={checkStatus}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Status
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <a
              href="/news"
              target="_blank"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View News Page
            </a>
          </div>

          {/* Setup Instructions */}
          {!status.configured && (
            <motion.div
              className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Follow the guide in <code className="bg-blue-100 px-1 rounded">GET_FACEBOOK_TOKEN_GUIDE.md</code></li>
                <li>Get your Facebook Page Access Token</li>
                <li>Add it to <code className="bg-blue-100 px-1 rounded">backend/.env</code></li>
                <li>Restart your backend server</li>
                <li>Click "Test Connection" to verify</li>
              </ol>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}