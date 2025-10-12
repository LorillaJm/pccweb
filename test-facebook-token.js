// Quick test script to verify Facebook token
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

async function testFacebookToken() {
  console.log('🔑 Testing Facebook Access Token...\n');
  
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || 'pccsoict2005';
  
  if (!token) {
    console.log('❌ No Facebook token found in backend/.env');
    console.log('📝 Please add FACEBOOK_ACCESS_TOKEN to your .env file');
    console.log('📖 Follow the guide in GET_FACEBOOK_TOKEN_GUIDE.md');
    return;
  }
  
  console.log('✅ Token found in environment variables');
  console.log(`📄 Page ID: ${pageId}`);
  console.log(`🔐 Token: ${token.substring(0, 20)}...${token.substring(token.length - 10)}`);
  
  // Step 1: Validate the token itself
  try {
    console.log('\n🔍 Step 1: Validating access token...');
    
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: token
      },
      timeout: 10000
    });
    
    console.log('✅ Token is valid');
    console.log(`   Token Type: ${tokenResponse.data.name ? 'Page Token' : 'User Token'}`);
    console.log(`   ID: ${tokenResponse.data.id}`);
    if (tokenResponse.data.name) {
      console.log(`   Page Name: ${tokenResponse.data.name}`);
    }
    
  } catch (error) {
    console.log('❌ Token validation failed');
    if (error.response) {
      const errorData = error.response.data;
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`);
      console.log(`   Code: ${errorData.error?.code || 'N/A'}`);
      
      if (errorData.error?.code === 190) {
        console.log('\n💡 Token is invalid or expired');
        console.log('   Solution: Generate a new token from Facebook Developers');
        console.log('   URL: https://developers.facebook.com/tools/explorer/');
      }
    }
    console.log('\n📖 For help, see GET_FACEBOOK_TOKEN_GUIDE.md');
    return;
  }
  
  // Step 2: Test page access
  try {
    console.log('\n🌐 Step 2: Testing page access...');
    
    const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
      params: {
        access_token: token,
        fields: 'id,name,about,fan_count'
      },
      timeout: 10000
    });
    
    console.log('✅ Page access successful');
    console.log(`   Page Name: ${pageResponse.data.name}`);
    console.log(`   Page ID: ${pageResponse.data.id}`);
    console.log(`   Followers: ${pageResponse.data.fan_count || 'N/A'}`);
    
  } catch (error) {
    console.log('❌ Page access failed');
    if (error.response) {
      const errorData = error.response.data;
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`);
      
      if (error.response.status === 403) {
        console.log('\n💡 Access forbidden - possible causes:');
        console.log('   1. Token doesn\'t have permission for this page');
        console.log('   2. You\'re not an admin of this page');
        console.log('   3. Page is private or unpublished');
      }
    }
    return;
  }
  
  // Step 3: Test posts access
  try {
    console.log('\n📱 Step 3: Testing posts access...');
    
    const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/posts`, {
      params: {
        access_token: token,
        fields: 'id,message,created_time,likes.summary(true),comments.summary(true)',
        limit: 3
      },
      timeout: 10000
    });
    
    const posts = response.data.data;
    console.log(`✅ Successfully fetched ${posts.length} Facebook posts!`);
    
    if (posts.length > 0) {
      console.log('\n📄 Latest Post Preview:');
      const latestPost = posts[0];
      console.log(`   ID: ${latestPost.id}`);
      console.log(`   Date: ${new Date(latestPost.created_time).toLocaleDateString()}`);
      console.log(`   Message: ${(latestPost.message || 'No message').substring(0, 100)}...`);
      console.log(`   Likes: ${latestPost.likes?.summary?.total_count || 0}`);
      console.log(`   Comments: ${latestPost.comments?.summary?.total_count || 0}`);
    } else {
      console.log('⚠️  No posts found - page might not have any posts or they\'re not accessible');
    }
    
    console.log('\n🎉 Facebook API is working correctly!');
    console.log('🚀 Your news page will now show real Facebook posts');
    console.log('🔄 Restart your backend server to see the changes');
    
  } catch (error) {
    console.log('❌ Posts access failed');
    
    if (error.response) {
      const errorData = error.response.data;
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${errorData.error?.message || 'Unknown error'}`);
      console.log(`   Code: ${errorData.error?.code || 'N/A'}`);
      
      if (errorData.error?.code === 100) {
        console.log('\n💡 Posts access issue - possible causes:');
        console.log('   1. Page has no posts');
        console.log('   2. Posts are private');
        console.log('   3. Token lacks pages_read_engagement permission');
      }
    } else {
      console.log(`   Network Error: ${error.message}`);
      console.log('   Check your internet connection');
    }
    
    console.log('\n📖 For help, see GET_FACEBOOK_TOKEN_GUIDE.md');
  }
}

// Run the test
testFacebookToken();