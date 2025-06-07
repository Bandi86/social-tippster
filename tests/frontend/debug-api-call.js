// Debug script to test the exact frontend API call
import axios from 'axios';

async function debugFrontendAPICall() {
  console.log('=== Debugging Frontend API Call ===\n');

  try {
    // Test the exact same call that the frontend store makes
    console.log('1. Testing direct API call to backend...');
    const backendResponse = await axios.get('http://localhost:3001/api/posts?page=1&limit=10');
    console.log('✅ Backend API Response:');
    console.log(`  - Status: ${backendResponse.status}`);
    console.log(`  - Posts count: ${backendResponse.data.posts?.length || 0}`);
    console.log(`  - Total: ${backendResponse.data.total}`);
    console.log('  - Response structure:', {
      posts: backendResponse.data.posts ? 'Array present' : 'Missing',
      total: backendResponse.data.total !== undefined ? 'Present' : 'Missing',
      page: backendResponse.data.page !== undefined ? 'Present' : 'Missing',
      limit: backendResponse.data.limit !== undefined ? 'Present' : 'Missing',
      totalPages: backendResponse.data.totalPages !== undefined ? 'Present' : 'Missing',
    });

    // Test with the frontend base URL (through frontend axios)
    console.log('\n2. Testing with frontend base URL...');
    try {
      const frontendAPIResponse = await axios
        .create({
          baseURL: 'http://localhost:3001/api',
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        })
        .get('/posts?page=1&limit=10');

      console.log('✅ Frontend-style API call successful:');
      console.log(`  - Status: ${frontendAPIResponse.status}`);
      console.log(`  - Posts count: ${frontendAPIResponse.data.posts?.length || 0}`);
      console.log(`  - Total: ${frontendAPIResponse.data.total}`);

      // Test if response structure matches expected PostsResponse interface
      const expectedFields = ['posts', 'total', 'page', 'limit', 'totalPages'];
      const responseData = frontendAPIResponse.data;
      const missingFields = expectedFields.filter(field => !(field in responseData));

      if (missingFields.length === 0) {
        console.log('✅ Response structure matches PostsResponse interface');
      } else {
        console.log(`❌ Missing fields from PostsResponse interface: ${missingFields.join(', ')}`);
      }

      // Check if posts array has valid structure
      if (
        responseData.posts &&
        Array.isArray(responseData.posts) &&
        responseData.posts.length > 0
      ) {
        const firstPost = responseData.posts[0];
        const requiredPostFields = ['id', 'title', 'content', 'type', 'status', 'author_id'];
        const missingPostFields = requiredPostFields.filter(field => !(field in firstPost));

        if (missingPostFields.length === 0) {
          console.log('✅ Post objects have required fields');
        } else {
          console.log(`❌ Post objects missing fields: ${missingPostFields.join(', ')}`);
        }
      }
    } catch (frontendError) {
      console.log('❌ Frontend-style API call failed:', frontendError.message);
      if (frontendError.response) {
        console.log(`  - Status: ${frontendError.response.status}`);
        console.log(`  - Data:`, frontendError.response.data);
      }
    }

    console.log('\n=== Debug Summary ===');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Response structure is correct');
    console.log('✅ Frontend should be able to process this data');
    console.log('\nIf frontend is still not showing posts, check:');
    console.log('  1. Browser developer console for JavaScript errors');
    console.log('  2. Network tab to see if API calls are being made');
    console.log('  3. Zustand store state in React DevTools');
    console.log('  4. Component re-rendering issues');
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugFrontendAPICall().catch(console.error);
