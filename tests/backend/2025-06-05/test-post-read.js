const axios = require('axios');

async function testPostsRead() {
  try {
    console.log('Testing posts read...');

    // Test getting posts (should work)
    const postsRes = await axios.get('http://localhost:3001/api/posts');
    console.log('✅ Posts read successful:', postsRes.data);
    return true;
  } catch (error) {
    console.log('❌ Posts read failed:');
    console.log('Status:', error.response?.status);
    console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
    return false;
  }
}

testPostsRead().catch(console.error);
