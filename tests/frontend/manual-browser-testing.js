/**
 * Manual Browser Testing Guide for Post Creation
 * Copy and paste these functions into browser console for testing
 */

console.log('🔍 Manual Post Creation Testing Guide');
console.log('=====================================');
console.log('');
console.log('📝 Steps to test in browser:');
console.log('1. Open http://localhost:3000 in browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Copy and paste the functions below');
console.log('5. Run the test functions');
console.log('');

/**
 * Test tag counter functionality in browser
 */
function testTagCounterInBrowser() {
  console.log('🏷️ Testing tag counter...');

  // Find tag input and counter elements
  const tagInputs = document.querySelectorAll(
    'input[placeholder*="címke"], input[placeholder*="tag"]',
  );
  const counters = document.querySelectorAll('[class*="text-white"]:contains("/5")');

  console.log(`Found ${tagInputs.length} tag input(s)`);
  console.log(`Found ${counters.length} counter element(s)`);

  if (tagInputs.length > 0) {
    console.log('✅ Tag input field found');
    console.log('📝 Try adding tags and watch for counter updates');
  } else {
    console.log('❌ Tag input field not found - may need to navigate to create post page');
  }
}

/**
 * Test image upload functionality
 */
function testImageUploadInBrowser() {
  console.log('🖼️ Testing image upload...');

  // Look for file input elements
  const fileInputs = document.querySelectorAll('input[type="file"]');
  const uploadButtons = document.querySelectorAll(
    '[class*="upload"], button:contains("Kép"), button:contains("Upload")',
  );

  console.log(`Found ${fileInputs.length} file input(s)`);
  console.log(`Found ${uploadButtons.length} upload button(s)`);

  if (fileInputs.length > 0) {
    console.log('✅ File input found');
    console.log('📝 Try uploading an image and check Network tab for requests');
  } else {
    console.log('❌ File input not found - may need to navigate to create post page');
  }
}

/**
 * Test image proxy functionality
 */
function testImageProxyInBrowser() {
  console.log('🔗 Testing image proxy...');

  // Test if uploaded images are accessible
  const testImageUrl = '/uploads/posts/test-image.jpg';

  fetch(testImageUrl)
    .then(response => {
      if (response.ok) {
        console.log(`✅ Image proxy working: ${response.status} ${response.statusText}`);
      } else {
        console.log(`⚠️ Image proxy response: ${response.status} ${response.statusText}`);
      }
    })
    .catch(error => {
      console.log(`❌ Image proxy error: ${error.message}`);
    });
}

/**
 * Test authentication state
 */
function testAuthStateInBrowser() {
  console.log('🔐 Testing authentication...');

  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');

  if (token) {
    console.log('✅ Auth token found in localStorage');
    console.log(`Token preview: ${token.substring(0, 30)}...`);
  } else {
    console.log('❌ No auth token found - user may not be logged in');
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('✅ User data found:', user);
    } catch (e) {
      console.log('⚠️ User data found but invalid JSON');
    }
  } else {
    console.log('❌ No user data found');
  }
}

/**
 * Check for React DevTools and component state
 */
function checkReactDevTools() {
  console.log('⚛️ Checking React DevTools...');

  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
    console.log('📝 You can inspect CreatePostForm component state in React DevTools');
  } else {
    console.log('⚠️ React DevTools not detected - install for better debugging');
  }
}

/**
 * Monitor network requests for post creation
 */
function monitorNetworkRequests() {
  console.log('🌐 Setting up network request monitoring...');

  // Override fetch to log requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const [url, options] = args;

    if (url.includes('/api/') || url.includes('/uploads/')) {
      console.log(`🌐 Network Request: ${options?.method || 'GET'} ${url}`);
      if (options?.headers?.Authorization) {
        console.log('✅ Authorization header present');
      }
    }

    return originalFetch
      .apply(this, args)
      .then(response => {
        if (url.includes('/api/') || url.includes('/uploads/')) {
          console.log(`✅ Response: ${response.status} ${response.statusText}`);
        }
        return response;
      })
      .catch(error => {
        if (url.includes('/api/') || url.includes('/uploads/')) {
          console.log(`❌ Request failed: ${error.message}`);
        }
        throw error;
      });
  };

  console.log('✅ Network monitoring active - watch for API calls');
}

/**
 * Run all tests
 */
function runAllBrowserTests() {
  console.log('🚀 Running all browser tests...');
  console.log('================================');

  testAuthStateInBrowser();
  console.log('');

  testTagCounterInBrowser();
  console.log('');

  testImageUploadInBrowser();
  console.log('');

  testImageProxyInBrowser();
  console.log('');

  checkReactDevTools();
  console.log('');

  monitorNetworkRequests();
  console.log('');

  console.log('✅ All tests completed!');
  console.log('📝 Now try creating a post and watch for console output');
}

// Export functions for manual testing
window.postCreationTests = {
  testTagCounterInBrowser,
  testImageUploadInBrowser,
  testImageProxyInBrowser,
  testAuthStateInBrowser,
  checkReactDevTools,
  monitorNetworkRequests,
  runAllBrowserTests,
};

console.log('');
console.log('🎯 Quick Start:');
console.log('Run: runAllBrowserTests()');
console.log('Or run individual tests: postCreationTests.testTagCounterInBrowser()');
console.log('');
