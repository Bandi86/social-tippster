/**
 * Direct Posts API Test
 * Test the posts endpoint without authentication to confirm it should work
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testDirectPostsAPI() {
  console.log('=== Direct Posts API Test ===\n');

  try {
    // Test 1: Direct axios call without auth
    console.log('1. Testing direct axios call without auth...');
    const response1 = await axios.get(`${API_BASE_URL}/posts?page=1&limit=10`);
    console.log('✅ Status:', response1.status);
    console.log('✅ Posts found:', response1.data.posts?.length || 0);
    console.log('✅ Total posts:', response1.data.total);

    // Test 2: With axios create (like the frontend uses)
    console.log('\n2. Testing with axios instance...');
    const api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response2 = await api.get('/posts?page=1&limit=10');
    console.log('✅ Status:', response2.status);
    console.log('✅ Posts found:', response2.data.posts?.length || 0);
    console.log('✅ Total posts:', response2.data.total);

    // Test 3: Simulate frontend axiosWithAuth approach but without token
    console.log('\n3. Testing frontend-style request...');
    const config = {
      method: 'GET',
      url: `${API_BASE_URL}/posts?page=1&limit=10`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response3 = await axios(config);
    console.log('✅ Status:', response3.status);
    console.log('✅ Posts found:', response3.data.posts?.length || 0);
    console.log('✅ Total posts:', response3.data.total);

    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('📝 The issue is likely in the frontend axios configuration or error handling.');
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
  }
}

testDirectPostsAPI();
