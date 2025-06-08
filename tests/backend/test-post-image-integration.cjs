// Test script for comprehensive post creation with image upload integration
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

async function getOrCreateTestUser() {
  const email = `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@test.com`;
  const password = 'Password123!';
  try {
    // Try to login first
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { withCredentials: true, timeout: 10000 },
    );
    return { email, password, token: loginResponse.data.access_token };
  } catch (err) {
    // If login fails, register
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
    // Then login
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

async function uploadImage(accessToken, imagePath, endpoint = '/uploads/post') {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: 'image/png',
  });

  try {
    const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw error;
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
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function verifyPostImageStorage(imageUrl) {
  try {
    // Check if the uploaded image is accessible
    const imageResponse = await axios.get(`http://localhost:3001${imageUrl}`, {
      timeout: 5000,
    });
    return imageResponse.status === 200;
  } catch (error) {
    return false;
  }
}

async function testPostImageIntegration() {
  console.log('=== Testing Post Creation with Image Upload Integration ===\n');

  try {
    // Step 1: Get authenticated user
    console.log('1. Authenticating user...');
    const { token: accessToken } = await getOrCreateTestUser();
    console.log('✅ Authentication successful!\n');

    // Test scenarios
    const testScenarios = [
      {
        name: 'Valid post with valid image',
        imageSize: 'small',
        postContent: 'This is a test post with a valid image.',
        expectedResult: 'success',
        description: 'Should successfully create post with uploaded image',
      },
      {
        name: 'Valid post with content only (no image)',
        imageSize: null,
        postContent: 'This is a text-only post without any image.',
        expectedResult: 'success',
        description: 'Should successfully create text-only post',
      },
      {
        name: 'Post with image URL only (no text content)',
        imageSize: 'small',
        postContent: '',
        expectedResult: 'success',
        description: 'Should successfully create image-only post',
      },
      {
        name: 'Post creation with oversized image upload',
        imageSize: 'large',
        postContent: 'This post attempts to upload an oversized image.',
        expectedResult: 'image_error',
        description: 'Should fail image upload but handle gracefully',
      },
    ];

    let testResults = [];

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`${i + 2}. Testing: ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);

      try {
        let imageUrl = '';
        let uploadResult = null;

        // Step A: Upload image if required
        if (scenario.imageSize) {
          console.log('   A. Creating and uploading test image...');
          const imagePath = createTestImage(`test-image-${i}.png`, scenario.imageSize);

          try {
            uploadResult = await uploadImage(accessToken, imagePath);
            imageUrl = uploadResult.url;
            console.log(`   ✅ Image upload successful: ${imageUrl}`);

            // Verify image is accessible
            const isAccessible = await verifyPostImageStorage(imageUrl);
            if (isAccessible) {
              console.log('   ✅ Uploaded image is accessible');
            } else {
              console.log('   ⚠️ Uploaded image is not accessible');
            }
          } catch (uploadError) {
            if (scenario.expectedResult === 'image_error') {
              console.log('   ✅ Expected image upload error occurred');
              console.log(
                `   Error: ${uploadError.response?.data?.message || uploadError.message}`,
              );
            } else {
              console.log('   ❌ Unexpected image upload error');
              console.log(
                `   Error: ${uploadError.response?.data?.message || uploadError.message}`,
              );
            }
          } finally {
            // Clean up test image file
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        }

        // Step B: Create post with or without image
        if (uploadResult || !scenario.imageSize) {
          console.log('   B. Creating post...');

          const postData = {
            content: scenario.postContent,
            type: 'discussion',
            tags: ['test', 'integration'],
          };

          // Add image URL if upload was successful
          if (imageUrl) {
            postData.imageUrl = imageUrl;
          }

          try {
            const postResult = await createPostWithImage(accessToken, postData);
            console.log(`   ✅ Post created successfully: ${postResult.id}`);
            console.log(`   Post title: "${postResult.title}"`);

            if (postResult.image_url) {
              console.log(`   Image URL in post: ${postResult.image_url}`);

              // Verify the image URL in the post matches uploaded image
              if (postResult.image_url === imageUrl) {
                console.log('   ✅ Image URL correctly stored in post');
              } else {
                console.log('   ⚠️ Image URL mismatch in post');
              }
            }

            testResults.push({
              scenario: scenario.name,
              status: 'success',
              postId: postResult.id,
              imageUrl: postResult.image_url,
            });

            // Step C: Verify post can be retrieved with image
            console.log('   C. Verifying post retrieval...');
            try {
              const retrievedPost = await axios.get(`${API_BASE}/posts/${postResult.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 10000,
              });

              if (retrievedPost.data.image_url === postResult.image_url) {
                console.log('   ✅ Post retrieval with image URL successful');
              } else {
                console.log('   ⚠️ Image URL not preserved in retrieved post');
              }
            } catch (retrievalError) {
              console.log('   ❌ Post retrieval failed');
              console.log(
                `   Error: ${retrievalError.response?.data?.message || retrievalError.message}`,
              );
            }
          } catch (postError) {
            if (scenario.expectedResult === 'post_error') {
              console.log('   ✅ Expected post creation error occurred');
            } else {
              console.log('   ❌ Post creation failed');
            }
            console.log(`   Error: ${postError.response?.data?.message || postError.message}`);

            testResults.push({
              scenario: scenario.name,
              status: 'failed',
              error: postError.response?.data?.message || postError.message,
            });
          }
        }

        console.log('');
      } catch (error) {
        console.log(`   ❌ Test scenario failed: ${error.message}`);
        testResults.push({
          scenario: scenario.name,
          status: 'error',
          error: error.message,
        });
        console.log('');
      }
    }

    // Final test summary
    console.log('=== Test Results Summary ===');
    const successful = testResults.filter(r => r.status === 'success').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const errors = testResults.filter(r => r.status === 'error').length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🔥 Errors: ${errors}`);
    console.log(`📊 Total: ${testResults.length}\n`);

    // Detailed results
    testResults.forEach(result => {
      console.log(`${result.status === 'success' ? '✅' : '❌'} ${result.scenario}`);
      if (result.postId) {
        console.log(`   Post ID: ${result.postId}`);
      }
      if (result.imageUrl) {
        console.log(`   Image URL: ${result.imageUrl}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n🎉 Post + Image Integration Testing Complete!');
  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data?.message || error.message);
  }
}

// Additional test for edge cases
async function testPostImageEdgeCases() {
  console.log('\n=== Testing Edge Cases ===\n');

  try {
    const { token: accessToken } = await getOrCreateTestUser();

    // Edge Case 1: Post with invalid image URL
    console.log('1. Testing post with invalid image URL...');
    try {
      const postData = {
        content: 'This post has an invalid image URL.',
        type: 'discussion',
        imageUrl: 'https://invalid-url-that-does-not-exist.com/image.jpg',
        tags: ['test'],
      };

      const postResult = await createPostWithImage(accessToken, postData);
      console.log('   ✅ Post created with invalid image URL (backend validation passed)');
      console.log(`   Post ID: ${postResult.id}`);
    } catch (error) {
      console.log('   ❌ Post creation failed with invalid image URL');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Edge Case 2: Post with malformed image URL
    console.log('\n2. Testing post with malformed image URL...');
    try {
      const postData = {
        content: 'This post has a malformed image URL.',
        type: 'discussion',
        imageUrl: 'not-a-valid-url',
        tags: ['test'],
      };

      const postResult = await createPostWithImage(accessToken, postData);
      console.log('   ⚠️ Post created with malformed image URL (validation should catch this)');
    } catch (error) {
      console.log('   ✅ Post creation properly rejected malformed image URL');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Edge Case 3: Empty post (no content, no image)
    console.log('\n3. Testing empty post (no content, no image)...');
    try {
      const postData = {
        content: '',
        type: 'discussion',
        tags: ['test'],
      };

      const postResult = await createPostWithImage(accessToken, postData);
      console.log('   ⚠️ Empty post created (validation should prevent this)');
    } catch (error) {
      console.log('   ✅ Empty post properly rejected');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Edge case testing complete!');
  } catch (error) {
    console.error('❌ Edge case testing failed:', error.message);
  }
}

// Run both test suites
async function runAllTests() {
  await testPostImageIntegration();
  await testPostImageEdgeCases();
}

runAllTests();
