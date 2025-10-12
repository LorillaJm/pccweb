'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, MessageCircle, Share2, ExternalLink, RefreshCw, Facebook, Clock, TrendingUp, Users, Eye } from 'lucide-react';
import Link from 'next/link';

interface FacebookPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  url: string;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  author: string;
}

interface FacebookFeedProps {
  limit?: number;
  showHeader?: boolean;
}

export default function FacebookFeed({ limit = 6, showHeader = true }: FacebookFeedProps) {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/facebook/posts?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error - unable to fetch posts');
      console.error('Error fetching Facebook posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [limit]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Facebook className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Latest from Facebook
                </h2>
                <p className="text-sm text-gray-600">Loading latest posts...</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-5 animate-pulse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg border border-red-100 p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Facebook className="h-6 w-6 text-white" />
        </motion.div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Issue</h3>
        <p className="text-gray-600 mb-4 text-sm">{error}</p>
        <motion.button
          onClick={fetchPosts}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Facebook className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Latest from Facebook
              </h2>
              <p className="text-sm text-gray-600">Stay updated with our latest posts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <motion.button
              onClick={fetchPosts}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {posts.slice(0, 3).map((post, index) => (
          <motion.article
            key={post.id}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            {/* Post Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{post.author}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <Link
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              {/* Post Title */}
              <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                {post.title}
              </h4>

              {/* Post Content */}
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {post.content.length > 120 
                  ? `${post.content.substring(0, 120)}...` 
                  : post.content
                }
              </p>
            </div>

            {/* Post Image */}
            {post.image && (
              <motion.div 
                className="relative overflow-hidden mx-5 mb-4 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            )}

            {/* Post Engagement */}
            <div className="px-5 pb-5 border-t border-gray-100/50 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button 
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(post.likes)}</span>
                  </motion.button>
                  
                  <motion.button 
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(post.comments)}</span>
                  </motion.button>
                  
                  <motion.button 
                    className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(post.shares)}</span>
                  </motion.button>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <span>View Post</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.article>
        ))}
        
        {/* View More Button */}
        {posts.length > 3 && (
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Facebook className="h-4 w-4 mr-2" />
              View All {posts.length} Posts
            </motion.button>
          </motion.div>
        )}
      </div>

      {posts.length === 0 && !loading && (
        <motion.div 
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-400 to-blue-400 rounded-xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Facebook className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Available</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Check back later for new updates from our Facebook page.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="https://facebook.com/pccsoict2005"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Visit Our Facebook Page
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}