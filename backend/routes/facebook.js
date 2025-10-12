const express = require('express');
const router = express.Router();
const FacebookService = require('../services/FacebookService');

const facebookService = new FacebookService();

/**
 * GET /api/facebook/posts
 * Fetch latest posts from Facebook page
 */
router.get('/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = await facebookService.fetchPosts(limit);
    
    res.json({
      success: true,
      data: posts,
      count: posts.length,
      source: 'facebook',
      pageId: 'pccsoict2005'
    });
  } catch (error) {
    console.error('Error in Facebook posts route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Facebook posts',
      message: error.message
    });
  }
});

/**
 * GET /api/facebook/posts/:id
 * Get specific Facebook post by ID
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const posts = await facebookService.fetchPosts(50);
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching Facebook post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Facebook post',
      message: error.message
    });
  }
});

/**
 * GET /api/facebook/status
 * Check Facebook API connection status
 */
router.get('/status', async (req, res) => {
  try {
    const hasToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
    
    res.json({
      success: true,
      status: {
        configured: hasToken,
        pageId: 'pccsoict2005',
        message: hasToken ? 'Facebook API configured' : 'Using mock data - configure FACEBOOK_ACCESS_TOKEN for live data'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check Facebook status',
      message: error.message
    });
  }
});

/**
 * GET /api/facebook/validate
 * Validate Facebook access token
 */
router.get('/validate', async (req, res) => {
  try {
    const validation = await facebookService.validateToken();
    
    res.json({
      success: true,
      validation: validation
    });
  } catch (error) {
    console.error('Error validating Facebook token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate Facebook token',
      message: error.message
    });
  }
});

module.exports = router;