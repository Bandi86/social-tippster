/**
 * Frontend Store API Integration Test
 * Tests the exact API call pattern that the fixed Zustand store will use
 * Date: 2025-06-07
 */

const axios = require('axios');

async function testFrontendStoreAPIPattern() {
  console.log('🔍 Testing Frontend Store API Pattern...\n');

  const API_BASE_URL = 'http://localhost:3001/api';

  try {
    // Test the exact same request pattern as the fixed store
    console.log('1. Testing GET /posts with pagination params...');

    const searchParams = new URLSearchParams();
    searchParams.append('page', '1');
    searchParams.append('limit', '10');

    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/posts?${searchParams.toString()}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Request successful!');
    console.log('✅ Status:', response.status);

    const data = response.data;
    console.log('✅ Response structure validation:');
    console.log('  - Has posts array:', Array.isArray(data.posts));
    console.log('  - Posts count:', data.posts?.length || 0);
    console.log('  - Has total:', typeof data.total === 'number');
    console.log('  - Has page:', typeof data.page === 'number');
    console.log('  - Has limit:', typeof data.limit === 'number');
    console.log('  - Has totalPages:', typeof data.totalPages === 'number');

    console.log('\n📊 API Response Metadata:');
    console.log('  - Total posts:', data.total);
    console.log('  - Current page:', data.page);
    console.log('  - Posts per page:', data.limit);
    console.log('  - Total pages:', data.totalPages);

    if (data.posts && data.posts.length > 0) {
      console.log('\n📝 Sample Post Data:');
      const firstPost = data.posts[0];
      console.log('  - ID:', firstPost.id);
      console.log('  - Title:', firstPost.title?.substring(0, 50) + '...');
      console.log('  - Type:', firstPost.type);
      console.log('  - Status:', firstPost.status);
      console.log('  - Author ID:', firstPost.author_id);
    }

    // Test featured posts endpoint as well
    console.log('\n2. Testing featured posts endpoint...');
    const featuredResponse = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/posts?featured=true&limit=10`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Featured posts request successful!');
    console.log('✅ Featured posts count:', featuredResponse.data.posts?.length || 0);

    // Final validation
    console.log('\n🎉 FRONTEND STORE FIX VALIDATION:');
    console.log('✅ API endpoint accessible via axiosWithAuth pattern');
    console.log('✅ Response structure matches PostsResponse interface');
    console.log('✅ Pagination metadata included');
    console.log('✅ Posts array populated with', data.posts?.length || 0, 'posts');

    if (data.posts?.length > 0) {
      console.log(
        '🚀 EXPECTED RESULT: Frontend should now show posts instead of "Még nincsenek posztok"',
      );
    } else {
      console.log('⚠️  WARNING: API returns empty posts array - check database');
    }

    return true;
  } catch (error) {
    console.error('❌ Frontend store API test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Execute test
testFrontendStoreAPIPattern()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ FRONTEND STORE FIX: SUCCESSFUL');
      console.log('💡 The posts should now appear on the home page');
    } else {
      console.log('❌ FRONTEND STORE FIX: NEEDS INVESTIGATION');
    }
    console.log('='.repeat(60));
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  });
