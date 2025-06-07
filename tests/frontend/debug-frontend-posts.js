/**
 * Frontend Posts Debug Script
 * Purpose: Debug why frontend shows "No posts yet" despite API working
 * Date: 2025-06-07
 */

console.log('🔍 Frontend Posts Debug Script Starting...');

// 1. Test if we can reach the API from browser environment
async function testApiDirectly() {
  console.log('\n1. Testing API directly from browser...');
  try {
    const response = await fetch('http://localhost:3001/api/posts');
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('✅ API Response Data Structure:', {
      hasPostsArray: Array.isArray(data.posts),
      postsCount: data.posts?.length,
      hasTotal: typeof data.total === 'number',
      hasPage: typeof data.page === 'number',
      hasLimit: typeof data.limit === 'number',
      hasTotalPages: typeof data.totalPages === 'number',
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    });

    if (data.posts && data.posts.length > 0) {
      console.log('✅ First post sample:', {
        id: data.posts[0].id,
        title: data.posts[0].title,
        content: data.posts[0].content?.substring(0, 50) + '...',
        author_id: data.posts[0].author_id,
      });
    }

    return data;
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    return null;
  }
}

// 2. Test axios configuration
async function testAxiosConfig() {
  console.log('\n2. Testing Axios configuration...');

  // Check if axios is available globally or from imports
  try {
    // Try to access axios if available in window
    const axiosInstance = window.axios || (await import('axios')).default;
    console.log('✅ Axios is available');

    // Test with same config as frontend
    const response = await axiosInstance.get('/api/posts', {
      baseURL: 'http://localhost:3001',
    });

    console.log('✅ Axios test successful:', {
      status: response.status,
      dataStructure: {
        hasPostsArray: Array.isArray(response.data.posts),
        postsCount: response.data.posts?.length,
        total: response.data.total,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Axios test failed:', error);
    return null;
  }
}

// 3. Check Zustand store state
function checkZustandStore() {
  console.log('\n3. Checking Zustand store state...');

  try {
    // Try to access React DevTools or Zustand store
    // This will help identify if the store has posts or is stuck in loading
    console.log('ℹ️ Check React DevTools or browser console for store state');
    console.log('ℹ️ Look for Zustand store with posts array, loading state, error state');

    // Try to access window object for any exposed store state
    if (typeof window !== 'undefined') {
      console.log('✅ Window object available');
      console.log(
        'ℹ️ Available window properties:',
        Object.keys(window).filter(
          key =>
            key.toLowerCase().includes('store') ||
            key.toLowerCase().includes('zustand') ||
            key.toLowerCase().includes('posts'),
        ),
      );
    }
  } catch (error) {
    console.error('❌ Store check failed:', error);
  }
}

// 4. Check for CORS issues
async function checkCorsIssues() {
  console.log('\n4. Checking for CORS issues...');

  try {
    const response = await fetch('http://localhost:3001/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    console.log('✅ CORS test passed');
    console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    if (error.message.includes('CORS')) {
      console.error('🚨 CORS issue detected! Backend may need CORS configuration.');
    }
  }
}

// 5. Check environment variables and configuration
function checkEnvironmentConfig() {
  console.log('\n5. Checking environment configuration...');

  try {
    // Check if Next.js environment variables are available
    if (typeof process !== 'undefined' && process.env) {
      console.log('✅ Process.env available');
      console.log('ℹ️ NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('ℹ️ NODE_ENV:', process.env.NODE_ENV);
    }

    // Check if window has any config
    if (typeof window !== 'undefined') {
      console.log('ℹ️ Window location:', window.location.href);
    }
  } catch (error) {
    console.error('❌ Environment check failed:', error);
  }
}

// 6. Network requests monitoring
function setupNetworkMonitoring() {
  console.log('\n6. Setting up network monitoring...');

  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    console.log('🌐 Fetch request:', args[0], args[1] || {});
    return originalFetch
      .apply(this, args)
      .then(response => {
        console.log('🌐 Fetch response:', response.status, response.url);
        return response;
      })
      .catch(error => {
        console.error('🌐 Fetch error:', error);
        throw error;
      });
  };

  console.log('✅ Network monitoring active - watch for fetch requests');
}

// Main execution
async function runDebugSuite() {
  console.log('🚀 Starting comprehensive frontend debug...\n');

  // Setup monitoring first
  setupNetworkMonitoring();

  // Run tests
  const apiData = await testApiDirectly();
  const axiosData = await testAxiosConfig();

  checkZustandStore();
  await checkCorsIssues();
  checkEnvironmentConfig();

  // Summary
  console.log('\n📊 DEBUG SUMMARY:');
  console.log('===================');
  console.log('API Direct Test:', apiData ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Axios Test:', axiosData ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Posts Available:', apiData?.posts?.length || 0);

  if (apiData && !axiosData) {
    console.log('🔍 FINDING: Direct fetch works but axios fails - check axios config');
  } else if (!apiData && !axiosData) {
    console.log('🔍 FINDING: Both API tests failed - check backend server');
  } else if (apiData && axiosData) {
    console.log('🔍 FINDING: API works fine - issue is in frontend store or component logic');
    console.log('💡 SUGGESTION: Check React DevTools for store state and component re-renders');
  }

  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Open React DevTools and check Zustand store state');
  console.log('2. Check Network tab for failed requests');
  console.log('3. Check Console for error messages');
  console.log('4. Monitor fetch requests above to see if frontend calls API');
}

// Auto-run when script loads
if (typeof window !== 'undefined') {
  runDebugSuite();
} else {
  console.log('ℹ️ Run this script in browser console for best results');
}

// Export for manual execution
window.debugFrontendPosts = runDebugSuite;
console.log('💡 You can also run: debugFrontendPosts() manually');
