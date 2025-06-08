/**
 * Test script to verify image proxy functionality
 * Tests that images uploaded to backend can be accessed through frontend proxy
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🧪 Testing Image Proxy Configuration...\n');

async function testImageProxy() {
  try {
    // Check if backend static file serving works
    console.log('1. Testing backend static file serving...');

    // Check if uploads directory exists
    const uploadsDir = path.join(__dirname, '../../backend/uploads/posts');
    console.log(`   Checking uploads directory: ${uploadsDir}`);

    if (!fs.existsSync(uploadsDir)) {
      console.log('   ℹ️  Uploads directory does not exist, creating test structure...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a test image file if none exists
    const testImagePath = path.join(uploadsDir, 'test-proxy-image.txt');
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, 'Test image content for proxy verification');
      console.log('   ✅ Created test file for proxy testing');
    }

    // Test direct backend access
    console.log('\n2. Testing direct backend access...');
    const backendResponse = await fetch(`${BACKEND_URL}/uploads/posts/test-proxy-image.txt`);
    if (backendResponse.ok) {
      console.log('   ✅ Backend static file serving works');
      console.log(`   📄 Status: ${backendResponse.status}`);
    } else {
      console.log('   ❌ Backend static file serving failed');
      console.log(`   📄 Status: ${backendResponse.status}`);
    }

    // Test frontend proxy
    console.log('\n3. Testing frontend proxy...');
    const proxyResponse = await fetch(`${FRONTEND_URL}/uploads/posts/test-proxy-image.txt`);
    if (proxyResponse.ok) {
      const content = await proxyResponse.text();
      console.log('   ✅ Frontend proxy works!');
      console.log(`   📄 Status: ${proxyResponse.status}`);
      console.log(`   📄 Content: ${content.substring(0, 50)}...`);
    } else {
      console.log('   ❌ Frontend proxy failed');
      console.log(`   📄 Status: ${proxyResponse.status}`);

      // Try to get error details
      try {
        const errorText = await proxyResponse.text();
        console.log(`   📄 Error: ${errorText.substring(0, 200)}`);
      } catch (e) {
        console.log(`   📄 Could not read error response`);
      }
    }

    // Test real image scenario
    console.log('\n4. Testing actual uploaded images...');
    const postsDir = path.join(__dirname, '../../backend/uploads/posts');
    if (fs.existsSync(postsDir)) {
      const files = fs
        .readdirSync(postsDir)
        .filter(
          f =>
            f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.gif'),
        );

      if (files.length > 0) {
        const testFile = files[0];
        console.log(`   📸 Testing real image: ${testFile}`);

        const realImageBackend = await fetch(`${BACKEND_URL}/uploads/posts/${testFile}`);
        const realImageProxy = await fetch(`${FRONTEND_URL}/uploads/posts/${testFile}`);

        console.log(`   📄 Backend access: ${realImageBackend.status}`);
        console.log(`   📄 Proxy access: ${realImageProxy.status}`);

        if (realImageProxy.ok) {
          console.log('   ✅ Real image proxy works!');
        } else {
          console.log('   ❌ Real image proxy failed');
        }
      } else {
        console.log('   ℹ️  No real images found to test');
      }
    }

    console.log('\n📊 Test Summary:');
    console.log('   - Backend static serving: Tested');
    console.log('   - Frontend proxy: Tested');
    console.log('   - Real image access: Tested');
    console.log('\n✨ Image proxy test completed!');
  } catch (error) {
    console.error('❌ Error during image proxy test:', error.message);
  }
}

// Run the test
testImageProxy();
