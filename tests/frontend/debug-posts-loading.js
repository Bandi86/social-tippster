/**
 * Frontend Debug Script for Posts Loading Issue
 * This script tests the exact API call that the frontend is making
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function debugPostsLoading() {
  console.log('=== Frontend Posts Loading Debug ===\n');

  try {
    console.log('1. Testing direct API call to posts endpoint...');

    // Test the exact same call the frontend makes
    const response = await axios.get(`${API_BASE_URL}/posts?page=1&limit=10`, {
      headers: {
        'Content-Type': 'application/json',
        // No auth token for public posts
      },
      timeout: 10000,
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Headers:', response.headers['content-type']);
    console.log('✅ Posts Count:', response.data.posts?.length || 0);
    console.log('✅ Total Posts:', response.data.total);

    if (response.data.posts && response.data.posts.length > 0) {
      console.log('\n📋 First Post Details:');
      const firstPost = response.data.posts[0];
      console.log('  - ID:', firstPost.id);
      console.log('  - Title:', firstPost.title);
      console.log('  - Author:', firstPost.author?.username || 'Unknown');
      console.log('  - Status:', firstPost.status);
      console.log('  - Visibility:', firstPost.visibility);
    }

    console.log('\n2. Testing with different parameters...');

    // Test without pagination
    const response2 = await axios.get(`${API_BASE_URL}/posts`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Without pagination - Posts Count:', response2.data.posts?.length || 0);

    console.log('\n3. Testing CORS headers...');
    console.log(
      '  - Access-Control-Allow-Origin:',
      response.headers['access-control-allow-origin'] || 'Not set',
    );
    console.log(
      '  - Access-Control-Allow-Methods:',
      response.headers['access-control-allow-methods'] || 'Not set',
    );
    console.log(
      '  - Access-Control-Allow-Headers:',
      response.headers['access-control-allow-headers'] || 'Not set',
    );

    console.log('\n✅ All tests passed! The API is working correctly.');
    console.log('🔍 The issue is likely in the frontend code, not the backend API.');
  } catch (error) {
    console.error('❌ Error testing posts API:', error.message);

    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Status Text:', error.response.statusText);
      console.error('  - Data:', error.response.data);
    } else if (error.request) {
      console.error('  - Request was made but no response received');
      console.error('  - Request details:', error.request);
    } else {
      console.error('  - Error setting up request:', error.message);
    }
  }
}

// Run the debug
debugPostsLoading().catch(console.error);
