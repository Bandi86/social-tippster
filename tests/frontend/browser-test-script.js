/**
 * Comprehensive frontend test for post creation functionality
 * Tests image proxy, tag counter, and overall user experience
 */

async function testImageFunctionality() {
  console.log('🧪 Testing Frontend Image & Post Creation Functionality...\n');

  // Test 1: Test if existing uploaded images are accessible via proxy
  console.log('1. Testing existing uploaded images...');

  try {
    // Check for any existing images in uploads
    const response = await fetch('/uploads/posts/1749373369281-478782328.png');
    if (response.ok) {
      console.log('✅ Existing image accessible via proxy');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);

      // Test image in an img element
      const testImg = document.createElement('img');
      testImg.src = '/uploads/posts/1749373369281-478782328.png';
      testImg.style.maxWidth = '200px';
      testImg.style.border = '2px solid green';
      testImg.onload = () => console.log('✅ Image loaded successfully in DOM');
      testImg.onerror = () => console.log('❌ Image failed to load in DOM');
      document.body.appendChild(testImg);
    } else {
      console.log(`❌ Image proxy failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error testing image: ${error.message}`);
  }

  // Test 2: Test tag counter functionality
  console.log('\n2. Testing tag counter functionality...');

  // Find tag counter element
  const tagCounters = document.querySelectorAll('[class*="tag"], [class*="count"]');
  console.log(`   Found ${tagCounters.length} potential tag counter elements`);

  tagCounters.forEach((el, index) => {
    if (el.textContent.includes('/5') || el.textContent.includes('címke')) {
      console.log(`   Tag counter ${index}: "${el.textContent}"`);
    }
  });

  // Test 3: Test create post form if available
  console.log('\n3. Testing create post form...');

  const createPostButtons = document.querySelectorAll('button');
  let createPostButton = null;

  createPostButtons.forEach(btn => {
    if (
      btn.textContent.includes('Poszt') ||
      btn.textContent.includes('Létrehoz') ||
      btn.textContent.includes('Create') ||
      btn.textContent.includes('Post')
    ) {
      console.log(`   Found create post button: "${btn.textContent}"`);
      createPostButton = btn;
    }
  });

  // Test 4: Test image upload elements
  console.log('\n4. Testing image upload elements...');

  const fileInputs = document.querySelectorAll('input[type="file"]');
  console.log(`   Found ${fileInputs.length} file input elements`);

  fileInputs.forEach((input, index) => {
    console.log(`   File input ${index}: accept="${input.accept}"`);
  });

  // Test 5: Test for any existing images on the page
  console.log('\n5. Testing existing images on page...');

  const images = document.querySelectorAll('img');
  console.log(`   Found ${images.length} images on page`);

  images.forEach((img, index) => {
    if (img.src.includes('/uploads/')) {
      console.log(`   Upload image ${index}: ${img.src}`);
      console.log(`     Size: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log(`     Loaded: ${img.complete && img.naturalHeight !== 0}`);
    }
  });

  console.log('\n✨ Frontend functionality test completed!');
}

// Add a button to run the test
const testButton = document.createElement('button');
testButton.textContent = '🧪 Run Frontend Tests';
testButton.style.position = 'fixed';
testButton.style.top = '10px';
testButton.style.right = '10px';
testButton.style.zIndex = '9999';
testButton.style.padding = '10px';
testButton.style.backgroundColor = '#007bff';
testButton.style.color = 'white';
testButton.style.border = 'none';
testButton.style.borderRadius = '5px';
testButton.style.cursor = 'pointer';
testButton.onclick = testImageFunctionality;
document.body.appendChild(testButton);

console.log('🧪 Frontend test script loaded. Click the blue button in top-right to run tests.');

// Also run immediately
testImageFunctionality();
