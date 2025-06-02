// Quick test to check if backend is running and test our endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function quickTest() {
  console.log('Quick test of posts API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('✓ Health check passed');
  } catch (error) {
    console.log('✗ Health check failed - backend may not be running');
    console.log('Error:', error.message);
    return;
  }

  try {
    // Test GET posts endpoint (should work without auth)
    console.log('2. Testing GET posts endpoint...');
    const postsResponse = await axios.get(`${API_BASE}/posts`, { timeout: 5000 });
    console.log('✓ GET posts successful');
    console.log('Posts count:', postsResponse.data.posts?.length || 'unknown');
  } catch (error) {
    console.log('✗ GET posts failed');
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test pagination validation
    console.log('3. Testing pagination validation...');
    const invalidResponse = await axios.get(`${API_BASE}/posts?page=0&limit=101`, {
      timeout: 5000,
    });
    console.log('✗ Invalid pagination was accepted (should have failed)');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Pagination validation working correctly');
    } else {
      console.log('✗ Unexpected error:', error.response?.status);
    }
  }

  console.log('\nQuick test completed!');
}

quickTest().catch(console.error);
