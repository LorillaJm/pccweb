// Test Facebook Service functionality
const FacebookService = require('./backend/services/FacebookService');

async function testFacebookService() {
  console.log('🧪 Testing Facebook Service...\n');
  
  const facebookService = new FacebookService();
  
  try {
    // Test fetching posts
    console.log('📱 Fetching Facebook posts...');
    const posts = await facebookService.fetchPosts(3);
    
    console.log(`✅ Successfully fetched ${posts.length} posts`);
    
    // Display first post details
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log('\n📄 First Post Details:');
      console.log(`   Title: ${firstPost.title}`);
      console.log(`   Author: ${firstPost.author}`);
      console.log(`   Date: ${firstPost.date}`);
      console.log(`   Likes: ${firstPost.likes}`);
      console.log(`   Comments: ${firstPost.comments}`);
      console.log(`   Shares: ${firstPost.shares}`);
      console.log(`   Content: ${firstPost.content.substring(0, 100)}...`);
    }
    
    // Test configuration status
    console.log('\n⚙️ Configuration Status:');
    const hasToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
    console.log(`   Facebook Token: ${hasToken ? '✅ Configured' : '❌ Not configured (using mock data)'}`);
    console.log(`   Page ID: pccsoict2005`);
    
    console.log('\n🎉 Facebook Service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Facebook Service test failed:', error.message);
  }
}

// Run the test
testFacebookService();