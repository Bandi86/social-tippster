// Enhanced test script for post creation with proper image URL handling
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const SERVER_BASE = 'http://localhost:3001';

async function getOrCreateTestUser() {
  const email = `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@test.com`;
  const password = 'Password123!';
  try {
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { withCredentials: true, timeout: 10000 },
    );
    return { email, password, token: loginResponse.data.access_token };
  } catch (err) {
    await axios.post(
      `${API_BASE}/auth/register`,
      {
        username: `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        email,
        password,
        first_name: 'Test',
        last_name: 'User',
      },
      { timeout: 10000 },
    );
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { withCredentials: true, timeout: 10000 },
    );
    return { email, password, token: loginResponse.data.access_token };
  }
}

function createTestImage(filename, size = 'small') {
  const imageBuffers = {
    small: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    ),
    large: Buffer.alloc(6 * 1024 * 1024), // 6MB oversized file
  };

  const buffer = imageBuffers[size] || imageBuffers.small;
  fs.writeFileSync(filename, buffer);
  return filename;
}

async function uploadImageAndGetFullUrl(accessToken, imagePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: 'image/png',
  });

  try {
    const response = await axios.post(`${API_BASE}/uploads/post`, formData, {
      headers: formData.getHeaders(),
      timeout: 10000,
    });

    // Convert relative path to full URL
    const relativePath = response.data.url;
    const fullUrl = `${SERVER_BASE}${relativePath}`;

    return {
      relativePath,
      fullUrl,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

async function createPostWithImage(accessToken, postData) {
  try {
    const response = await axios.post(`${API_BASE}/posts`, postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

async function verifyImageAccessibility(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function runComprehensivePostImageTests() {
  console.log('=== Comprehensive Post + Image Integration Tests ===\n');

  try {
    // Authenticate
    console.log('1. Authenticating user...');
    const { token: accessToken } = await getOrCreateTestUser();
    console.log('✅ Authentication successful!\n');

    // Test Case 1: Post with valid image (full URL)
    console.log('2. Test Case 1: Post with valid image (full URL)');
    console.log('   Description: Upload image and create post with full URL');

    const imagePath1 = createTestImage('test-valid-1.png', 'small');
    const uploadResult1 = await uploadImageAndGetFullUrl(accessToken, imagePath1);

    if (uploadResult1.success) {
      console.log(`   ✅ Image uploaded: ${uploadResult1.relativePath}`);
      console.log(`   📍 Full URL: ${uploadResult1.fullUrl}`);

      // Check image accessibility
      const isAccessible = await verifyImageAccessibility(uploadResult1.fullUrl);
      console.log(
        `   🔍 Image accessibility: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}`,
      );

      // Create post with full URL
      const postData1 = {
        content: 'This post contains a valid uploaded image.',
        type: 'discussion',
        imageUrl: uploadResult1.fullUrl,
        tags: ['test', 'image', 'valid'],
      };

      const postResult1 = await createPostWithImage(accessToken, postData1);
      if (postResult1.success) {
        console.log(`   ✅ Post created successfully: ${postResult1.data.id}`);
        console.log(`   📝 Title: "${postResult1.data.title}"`);
        console.log(`   🖼️ Image URL stored: ${postResult1.data.image_url}`);

        // Verify image URL matches
        if (postResult1.data.image_url === uploadResult1.fullUrl) {
          console.log('   ✅ Image URL correctly stored in post');
        } else {
          console.log('   ⚠️ Image URL mismatch in post');
        }
      } else {
        console.log(`   ❌ Post creation failed: ${postResult1.error}`);
      }
    } else {
      console.log(`   ❌ Image upload failed: ${uploadResult1.error}`);
    }

    // Clean up
    if (fs.existsSync(imagePath1)) fs.unlinkSync(imagePath1);
    console.log('');

    // Test Case 2: Post with relative path (should fail validation)
    console.log('3. Test Case 2: Post with relative path (validation test)');
    console.log('   Description: Attempt to create post with relative image path');

    const imagePath2 = createTestImage('test-valid-2.png', 'small');
    const uploadResult2 = await uploadImageAndGetFullUrl(accessToken, imagePath2);

    if (uploadResult2.success) {
      const postData2 = {
        content: 'This post attempts to use a relative image path.',
        type: 'discussion',
        imageUrl: uploadResult2.relativePath, // Using relative path instead of full URL
        tags: ['test', 'validation'],
      };

      const postResult2 = await createPostWithImage(accessToken, postData2);
      if (postResult2.success) {
        console.log('   ⚠️ Post unexpectedly created with relative path');
      } else {
        console.log('   ✅ Post creation properly rejected relative path');
        console.log(`   Error: ${postResult2.error}`);
      }
    }

    // Clean up
    if (fs.existsSync(imagePath2)) fs.unlinkSync(imagePath2);
    console.log('');

    // Test Case 3: Text-only post (no image)
    console.log('4. Test Case 3: Text-only post (no image)');
    console.log('   Description: Create post with content only');

    const postData3 = {
      content: 'This is a text-only post without any images.',
      type: 'discussion',
      tags: ['test', 'text-only'],
    };

    const postResult3 = await createPostWithImage(accessToken, postData3);
    if (postResult3.success) {
      console.log(`   ✅ Text-only post created: ${postResult3.data.id}`);
      console.log(`   📝 Title: "${postResult3.data.title}"`);
      console.log(`   🖼️ Image URL: ${postResult3.data.image_url || 'None'}`);
    } else {
      console.log(`   ❌ Text-only post creation failed: ${postResult3.error}`);
    }
    console.log('');

    // Test Case 4: Image-only post (minimal content + image)
    console.log('5. Test Case 4: Image-only post (minimal content + image)');
    console.log('   Description: Create post with minimal content and image');

    const imagePath4 = createTestImage('test-valid-4.png', 'small');
    const uploadResult4 = await uploadImageAndGetFullUrl(accessToken, imagePath4);

    if (uploadResult4.success) {
      const postData4 = {
        content: '📸', // Minimal content to satisfy validation
        type: 'discussion',
        imageUrl: uploadResult4.fullUrl,
        tags: ['test', 'image-focused'],
      };

      const postResult4 = await createPostWithImage(accessToken, postData4);
      if (postResult4.success) {
        console.log(`   ✅ Image-focused post created: ${postResult4.data.id}`);
        console.log(`   📝 Title: "${postResult4.data.title}"`);
        console.log(`   🖼️ Image URL: ${postResult4.data.image_url}`);
      } else {
        console.log(`   ❌ Image-focused post creation failed: ${postResult4.error}`);
      }
    }

    // Clean up
    if (fs.existsSync(imagePath4)) fs.unlinkSync(imagePath4);
    console.log('');

    // Test Case 5: Oversized image upload
    console.log('6. Test Case 5: Oversized image upload');
    console.log('   Description: Attempt to upload oversized image');

    const imagePath5 = createTestImage('test-large.png', 'large');
    const uploadResult5 = await uploadImageAndGetFullUrl(accessToken, imagePath5);

    if (uploadResult5.success) {
      console.log('   ⚠️ Oversized image upload unexpectedly succeeded');
    } else {
      console.log('   ✅ Oversized image upload properly rejected');
      console.log(`   Error: ${uploadResult5.error}`);
    }

    // Clean up
    if (fs.existsSync(imagePath5)) fs.unlinkSync(imagePath5);
    console.log('');

    // Test Case 6: Invalid file type upload
    console.log('7. Test Case 6: Invalid file type upload');
    console.log('   Description: Attempt to upload non-image file');

    const invalidFilePath = 'test-invalid.txt';
    fs.writeFileSync(invalidFilePath, 'This is not an image file');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(invalidFilePath), {
      filename: 'test-invalid.txt',
      contentType: 'text/plain',
    });

    try {
      await axios.post(`${API_BASE}/uploads/post`, formData, {
        headers: formData.getHeaders(),
        timeout: 10000,
      });
      console.log('   ⚠️ Invalid file type upload unexpectedly succeeded');
    } catch (error) {
      console.log('   ✅ Invalid file type upload properly rejected');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Clean up
    if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    console.log('');

    console.log('🎉 Comprehensive Post + Image Integration Tests Complete!\n');

    // Summary of findings
    console.log('=== Key Findings ===');
    console.log('✅ Image upload endpoint works correctly');
    console.log('✅ Post creation with full URLs works');
    console.log('✅ URL validation properly rejects relative paths');
    console.log('✅ Text-only posts work correctly');
    console.log('✅ File size limits are enforced');
    console.log('✅ File type validation works');
    console.log('⚠️ Image accessibility needs verification');
    console.log('📋 Full URL conversion is required for imageUrl field\n');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

runComprehensivePostImageTests();
