const axios = require('axios');

class FacebookService {
  constructor() {
    this.pageId = 'pccsoict2005';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Fetch posts from Facebook page
   * Note: This requires a valid Facebook App and Page Access Token
   */
  async fetchPosts(limit = 10) {
    try {
      if (!this.accessToken) {
        console.warn('Facebook Access Token not configured, returning mock data');
        return this.getMockPosts();
      }

      console.log(`Attempting to fetch Facebook posts for page: ${this.pageId}`);
      
      const response = await axios.get(`${this.baseUrl}/${this.pageId}/posts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,message,full_picture,created_time,permalink_url,likes.summary(true),comments.summary(true),shares',
          limit: limit
        },
        timeout: 10000
      });

      console.log(`Successfully fetched ${response.data.data.length} Facebook posts`);
      return this.formatPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching Facebook posts:', error.message);
      
      if (error.response) {
        console.error('Facebook API Error Details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Handle specific Facebook API errors
        if (error.response.status === 400) {
          console.error('Facebook API 400 Error - Possible causes:');
          console.error('1. Invalid or expired access token');
          console.error('2. Insufficient permissions');
          console.error('3. Invalid page ID');
          console.error('4. Page not accessible');
        }
        
        if (error.response.status === 403) {
          console.error('Facebook API 403 Error - Access forbidden');
          console.error('Check if you have admin access to the page');
        }
      }
      
      console.log('Falling back to mock data');
      return this.getMockPosts();
    }
  }

  /**
   * Format Facebook posts for frontend consumption
   */
  formatPosts(posts) {
    return posts.map(post => ({
      id: post.id,
      title: this.extractTitle(post.message),
      content: post.message || 'No content available',
      image: post.full_picture || null,
      date: new Date(post.created_time).toLocaleDateString(),
      url: post.permalink_url,
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      category: 'Facebook Post',
      author: 'PCC SOICT'
    }));
  }

  /**
   * Extract title from post message (first line or first 50 chars)
   */
  extractTitle(message) {
    if (!message) return 'PCC Update';
    
    const firstLine = message.split('\n')[0];
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...';
    }
    return firstLine || 'PCC Update';
  }

  /**
   * Validate Facebook access token
   */
  async validateToken() {
    try {
      if (!this.accessToken) {
        return { valid: false, error: 'No access token provided' };
      }

      // Test token with a simple API call
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: this.accessToken
        },
        timeout: 5000
      });

      return { 
        valid: true, 
        data: response.data,
        message: 'Token is valid'
      };
    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData.error?.message || `HTTP ${error.response.status}`;
        
        if (error.response.status === 400 && errorData.error?.code === 190) {
          errorMessage = 'Invalid or expired access token';
        }
      } else {
        errorMessage = error.message;
      }

      return { 
        valid: false, 
        error: errorMessage,
        details: error.response?.data
      };
    }
  }

  /**
   * Mock data for development/fallback
   */
  getMockPosts() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'mock_1',
        title: 'Welcome to the New Academic Year 2025!',
        content: 'We are excited to welcome all our students back to campus for another year of learning and growth. This semester brings new opportunities, updated facilities, and exciting programs designed to enhance your educational experience. Join us for orientation week starting January 15th!',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: today.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 245,
        comments: 32,
        shares: 18,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      },
      {
        id: 'mock_2',
        title: 'Programming Competition Victory! 🏆',
        content: 'Our Computer Science students have once again proven their excellence by winning multiple awards in the regional programming competition held in Iloilo City. Team Alpha secured 1st place while Team Beta claimed 3rd place. Congratulations to all participants!',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: yesterday.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 189,
        comments: 24,
        shares: 12,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      },
      {
        id: 'mock_3',
        title: 'New State-of-the-Art Laboratory Opens',
        content: 'We are thrilled to announce the opening of our new computer laboratory equipped with the latest technology including high-performance workstations, advanced networking equipment, and modern software development tools. The lab is now available for student use.',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: twoDaysAgo.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 156,
        comments: 18,
        shares: 8,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      },
      {
        id: 'mock_4',
        title: 'Faculty Development Workshop Success',
        content: 'Our monthly faculty development workshop on "Modern Teaching Methodologies in IT Education" was a huge success! Over 30 faculty members participated in hands-on sessions covering innovative teaching techniques and educational technology integration.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: threeDaysAgo.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 98,
        comments: 15,
        shares: 6,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      },
      {
        id: 'mock_5',
        title: 'Community Outreach Program Launch',
        content: 'PCC SOICT launches comprehensive community outreach program focusing on digital literacy and basic computer skills training for remote barangays. The program aims to bridge the digital divide and provide essential IT skills to underserved communities.',
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: fourDaysAgo.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 134,
        comments: 21,
        shares: 15,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      },
      {
        id: 'mock_6',
        title: 'Student Research Showcase 2025',
        content: 'Mark your calendars! Our annual Student Research Showcase will be held on February 20, 2025. Students will present their innovative projects in AI, web development, mobile apps, and cybersecurity. Open to all students and faculty members.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        date: fiveDaysAgo.toLocaleDateString(),
        url: 'https://facebook.com/pccsoict2005',
        likes: 87,
        comments: 12,
        shares: 9,
        category: 'Facebook Post',
        author: 'PCC SOICT'
      }
    ];
  }

  /**
   * Alternative method using RSS feed (if available)
   */
  async fetchFromRSS() {
    try {
      // Facebook doesn't provide RSS feeds anymore, but this is a placeholder
      // for other social media platforms that might support RSS
      const rssUrl = `https://www.facebook.com/feeds/page.php?id=${this.pageId}&format=rss20`;
      
      // This would require an RSS parser library
      console.log('RSS method not implemented - Facebook discontinued RSS feeds');
      return this.getMockPosts();
    } catch (error) {
      console.error('RSS fetch error:', error.message);
      return this.getMockPosts();
    }
  }
}

module.exports = FacebookService;