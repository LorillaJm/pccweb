'use client';

import { useState, useEffect } from 'react';

interface FacebookPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  date: string;
  timestamp: string;
  url: string;
  reactions: number;
  comments: number;
  shares: number;
  category: string;
  author: string;
}

interface UseFacebookPostsReturn {
  posts: FacebookPost[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useFacebookPosts(limit: number = 10): UseFacebookPostsReturn {
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      if (data.success) {
        setPosts(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Facebook posts fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/refresh', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Facebook refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchPosts, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [limit]);

  return {
    posts,
    loading,
    error,
    refresh,
    lastUpdated
  };
}