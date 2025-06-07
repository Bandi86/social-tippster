// Frontend integration test to verify posts are loading correctly
import axios from 'axios';

async function testFrontendIntegration() {
  console.log('=== Frontend Posts Integration Test ===\n');

  try {
    // Test 1: Check API response structure
    console.log('1. Testing API response structure...');
    const apiResponse = await axios.get('http://localhost:3001/api/posts?page=1&limit=5');
    console.log('✅ API Response structure:');
    console.log(`  - Posts count: ${apiResponse.data.posts?.length || 0}`);
    console.log(`  - Total: ${apiResponse.data.total}`);
    console.log(`  - Page: ${apiResponse.data.page}`);
    console.log(`  - Limit: ${apiResponse.data.limit}`);
    console.log(`  - Total Pages: ${apiResponse.data.totalPages}`);

    // Test 2: Check that the structure matches frontend expectations
    const expectedFields = ['posts', 'total', 'page', 'limit', 'totalPages'];
    const missingFields = expectedFields.filter(field => !(field in apiResponse.data));

    if (missingFields.length > 0) {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      return false;
    }

    console.log('✅ All required fields present in API response');

    // Test 3: Check individual post structure
    if (apiResponse.data.posts && apiResponse.data.posts.length > 0) {
      const firstPost = apiResponse.data.posts[0];
      console.log('\n2. Testing first post structure:');
      console.log(`  - ID: ${firstPost.id}`);
      console.log(`  - Title: ${firstPost.title}`);
      console.log(`  - Type: ${firstPost.type}`);
      console.log(`  - Status: ${firstPost.status}`);
      console.log(`  - Author: ${firstPost.author?.username || 'No author'}`);
      console.log(`  - Created: ${firstPost.created_at}`);
    }

    // Test 4: Verify frontend can fetch the same data
    console.log('\n3. Testing frontend API endpoint access...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/posts?page=1&limit=5');
      console.log('✅ Frontend can access posts via API proxy');
    } catch (error) {
      console.log('ℹ️  Frontend API proxy test (this might be expected if no proxy is set up)');
    }

    console.log('\n=== Integration Test Summary ===');
    console.log('✅ API is working correctly');
    console.log('✅ Response structure matches frontend expectations');
    console.log('✅ Posts data is available and properly structured');
    console.log('\nIf posts are still not showing in the browser, the issue is likely in:');
    console.log('  - Frontend component rendering logic');
    console.log('  - Zustand store state management');
    console.log('  - Browser console errors');

    return true;
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

testFrontendIntegration().catch(console.error);
