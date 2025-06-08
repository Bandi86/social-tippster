/**
 * Frontend post creation debugging script
 * Tests actual browser functionality and identifies specific issues
 */

console.log('🔍 Frontend Post Creation Debug');
console.log('============================');

// Function to simulate tag addition
function testTagCounterLogic() {
  console.log('\n1. Testing tag counter logic...');

  // Simulate form data state
  let formData = {
    content: '',
    type: 'general',
    isPremium: false,
    tags: [],
    imageUrl: '',
  };

  // Test adding tags
  const addTag = tag => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      formData.tags = [...formData.tags, tag];
      console.log(`✅ Added tag: "${tag}". Current count: ${formData.tags.length}/5`);
      return true;
    } else {
      console.log(
        `❌ Cannot add tag: "${tag}". Reason: ${
          !tag
            ? 'Empty tag'
            : formData.tags.includes(tag)
              ? 'Tag already exists'
              : formData.tags.length >= 5
                ? 'Max tags reached'
                : 'Unknown'
        }`,
      );
      return false;
    }
  };

  // Test removing tags
  const removeTag = tagToRemove => {
    formData.tags = formData.tags.filter(tag => tag !== tagToRemove);
    console.log(`✅ Removed tag: "${tagToRemove}". Current count: ${formData.tags.length}/5`);
  };

  // Simulate tag operations
  addTag('teszt');
  addTag('javascript');
  addTag('react');
  addTag('teszt'); // Should fail - duplicate
  addTag('frontend');
  addTag('debugging');
  addTag('overflow'); // Should fail - max reached

  removeTag('javascript');
  addTag('new-tag');

  console.log('Final tags:', formData.tags);
  console.log('Final count:', formData.tags.length + '/5');
}

// Function to test image URL construction
function testImageUrls() {
  console.log('\n2. Testing image URL construction...');

  const testUrls = [
    '/uploads/posts/test-image.jpg',
    'http://localhost:3001/uploads/posts/test-image.jpg',
    '/uploads/posts/1749373031094-628206096.png',
  ];

  testUrls.forEach(url => {
    console.log(`Testing URL: ${url}`);

    // Test if URL should work
    if (url.startsWith('/uploads/')) {
      console.log(`  ✅ Relative URL detected - needs backend proxy`);
      console.log(`  🔧 Full URL would be: http://localhost:3001${url}`);
    } else if (url.startsWith('http://localhost:3001')) {
      console.log(`  ✅ Full backend URL - should work directly`);
    } else {
      console.log(`  ⚠️ Unknown URL format`);
    }
  });
}

// Function to test form validation
function testFormValidation() {
  console.log('\n3. Testing form validation...');

  const testCases = [
    { content: '', imageUrl: '', tags: [], expected: false, reason: 'No content or image' },
    { content: 'Test', imageUrl: '', tags: [], expected: true, reason: 'Has content' },
    { content: '', imageUrl: '/uploads/test.jpg', tags: [], expected: true, reason: 'Has image' },
    { content: 'Hi', imageUrl: '', tags: [], expected: false, reason: 'Content too short' },
    {
      content: 'This is a valid post content',
      imageUrl: '',
      tags: ['test'],
      expected: true,
      reason: 'Valid content and tags',
    },
  ];

  testCases.forEach((testCase, index) => {
    const isValid =
      ((testCase.content.trim().length >= 10 || testCase.imageUrl.length > 0) &&
        testCase.content.trim().length !== 0) ||
      testCase.imageUrl.length > 0;

    const actualResult = isValid;
    const passed = actualResult === testCase.expected;

    console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} ${testCase.reason}`);
    console.log(`  Expected: ${testCase.expected}, Got: ${actualResult}`);

    if (!passed) {
      console.log(`  ⚠️ Validation logic may need adjustment`);
    }
  });
}

// Function to check browser environment
function checkBrowserEnvironment() {
  console.log('\n4. Checking browser environment...');

  if (typeof window !== 'undefined') {
    console.log('✅ Running in browser environment');
    console.log(`Current URL: ${window.location.href}`);
    console.log(`User Agent: ${navigator.userAgent}`);

    // Check for React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools detected');
    } else {
      console.log('⚠️ React DevTools not detected');
    }

    // Check console for errors
    console.log('📋 Check browser console for any React errors or warnings');
  } else {
    console.log('❌ Not running in browser - this is a Node.js environment');
    console.log('🔧 To test frontend issues:');
    console.log('   1. Open browser to http://localhost:3000');
    console.log('   2. Navigate to post creation');
    console.log('   3. Open browser console and paste this script');
  }
}

// Function to test network requests
function suggestNetworkTests() {
  console.log('\n5. Network testing suggestions...');
  console.log('🔧 To test image upload issues:');
  console.log('   1. Open browser Network tab');
  console.log('   2. Try uploading an image');
  console.log('   3. Check if request goes to localhost:3001 or localhost:3000');
  console.log('   4. Verify Authorization header is present');
  console.log('   5. Check response for proper image URL');

  console.log('\n🔧 To test tag counter:');
  console.log('   1. Open React DevTools');
  console.log('   2. Find CreatePostForm component');
  console.log('   3. Watch formData.tags state while adding/removing tags');
  console.log('   4. Verify UI updates match state changes');
}

// Run all tests
testTagCounterLogic();
testImageUrls();
testFormValidation();
checkBrowserEnvironment();
suggestNetworkTests();

console.log('\n🎯 Summary:');
console.log('- Tag counter logic appears correct in code');
console.log('- Image URL construction may need backend proxy configuration');
console.log('- Form validation logic may need refinement');
console.log('- Frontend testing requires browser environment');

// Export for browser use
if (typeof window !== 'undefined') {
  window.debugPostCreation = {
    testTagCounterLogic,
    testImageUrls,
    testFormValidation,
    checkBrowserEnvironment,
    suggestNetworkTests,
  };
  console.log('\n💡 Functions available as window.debugPostCreation');
}
