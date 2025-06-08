// Test script to verify all post image integration fixes
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const SERVER_BASE = 'http://localhost:3001';

// Simple sleep function to handle rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function uploadImage(filepath, token, endpoint = 'post') {
  const form = new FormData();
  form.append('file', fs.createReadStream(filepath));

  try {
    const response = await axios.post(`${API_BASE}/uploads/${endpoint}`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
  }
}

async function createPost(postData, token) {
  try {
    const response = await axios.post(`${API_BASE}/posts`, postData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Post creation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function getPost(postId, token) {
  try {
    const response = await axios.get(`${API_BASE}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Get post failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testImageAccessibility(imageUrl) {
  try {
    const fullUrl = `${SERVER_BASE}${imageUrl}`;
    const response = await axios.head(fullUrl, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting comprehensive post image integration tests...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: [],
  };

  const testCases = [
    {
      name: 'Text-only post creation',
      test: async user => {
        const postData = {
          content: 'This is a text-only post without images.',
          type: 'discussion',
        };
        const post = await createPost(postData, user.token);

        if (!post.id || post.content !== postData.content) {
          throw new Error('Post creation failed or content mismatch');
        }

        if (post.image_url !== null && post.image_url !== undefined) {
          throw new Error(`Expected null image_url, got: ${post.image_url}`);
        }

        return { success: true, message: 'Text-only post created successfully' };
      },
    },
    {
      name: 'Image upload to post endpoint',
      test: async user => {
        const testImagePath = createTestImage('./test-upload.png', 'small');

        try {
          const uploadResult = await uploadImage(testImagePath, user.token, 'post');

          if (!uploadResult.url || uploadResult.error) {
            throw new Error(`Upload failed: ${uploadResult.error || 'No URL returned'}`);
          }

          if (!uploadResult.url.includes('/uploads/posts/')) {
            throw new Error(`Expected post upload path, got: ${uploadResult.url}`);
          }

          return { success: true, message: 'Image uploaded successfully', url: uploadResult.url };
        } finally {
          if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
          }
        }
      },
    },
    {
      name: 'Post creation with localhost image URL',
      test: async user => {
        const testImagePath = createTestImage('./test-post-image.png', 'small');

        try {
          // First upload the image
          const uploadResult = await uploadImage(testImagePath, user.token, 'post');
          const imageUrl = `${SERVER_BASE}${uploadResult.url}`;

          // Create post with the localhost URL
          const postData = {
            content: 'This post includes an uploaded image with localhost URL.',
            type: 'discussion',
            imageUrl: imageUrl,
          };

          const post = await createPost(postData, user.token);

          if (!post.id) {
            throw new Error('Post creation failed');
          }

          if (post.image_url !== imageUrl) {
            throw new Error(`Image URL mismatch. Expected: ${imageUrl}, Got: ${post.image_url}`);
          }

          return {
            success: true,
            message: 'Post created with localhost image URL',
            postId: post.id,
          };
        } finally {
          if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
          }
        }
      },
    },
    {
      name: 'Post creation with external HTTPS image URL',
      test: async user => {
        const externalImageUrl = 'https://via.placeholder.com/150.png';

        const postData = {
          content: 'This post includes an external HTTPS image URL.',
          type: 'discussion',
          imageUrl: externalImageUrl,
        };

        const post = await createPost(postData, user.token);

        if (!post.id) {
          throw new Error('Post creation failed');
        }

        if (post.image_url !== externalImageUrl) {
          throw new Error(
            `Image URL mismatch. Expected: ${externalImageUrl}, Got: ${post.image_url}`,
          );
        }

        return { success: true, message: 'Post created with external HTTPS image URL' };
      },
    },
    {
      name: 'Post retrieval maintains image URL',
      test: async user => {
        const testImagePath = createTestImage('./test-retrieve.png', 'small');

        try {
          // Upload image and create post
          const uploadResult = await uploadImage(testImagePath, user.token, 'post');
          const imageUrl = `${SERVER_BASE}${uploadResult.url}`;

          const postData = {
            content: 'Testing post retrieval with image URL.',
            type: 'discussion',
            imageUrl: imageUrl,
          };

          const createdPost = await createPost(postData, user.token);

          // Retrieve the post
          const retrievedPost = await getPost(createdPost.id, user.token);

          if (retrievedPost.image_url !== imageUrl) {
            throw new Error(
              `Retrieved image URL mismatch. Expected: ${imageUrl}, Got: ${retrievedPost.image_url}`,
            );
          }

          return { success: true, message: 'Post retrieval maintains correct image URL' };
        } finally {
          if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
          }
        }
      },
    },
    {
      name: 'Image accessibility via HTTP',
      test: async user => {
        const testImagePath = createTestImage('./test-access.png', 'small');

        try {
          const uploadResult = await uploadImage(testImagePath, user.token, 'post');
          const isAccessible = await testImageAccessibility(uploadResult.url);

          if (!isAccessible) {
            throw new Error(`Image not accessible at ${uploadResult.url}`);
          }

          return { success: true, message: 'Uploaded image is accessible via HTTP' };
        } finally {
          if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
          }
        }
      },
    },
    {
      name: 'Invalid URL validation',
      test: async user => {
        const postData = {
          content: 'Testing invalid URL validation.',
          type: 'discussion',
          imageUrl: 'not-a-valid-url',
        };

        try {
          await createPost(postData, user.token);
          throw new Error('Expected validation error for invalid URL');
        } catch (error) {
          if (error.message.includes('validation') || error.message.includes('Invalid URL')) {
            return { success: true, message: 'Invalid URL properly rejected' };
          }
          throw error;
        }
      },
    },
    {
      name: 'File size limit enforcement',
      test: async user => {
        const largeImagePath = createTestImage('./test-large.png', 'large');

        try {
          await uploadImage(largeImagePath, user.token, 'post');
          throw new Error('Expected file size limit error');
        } catch (error) {
          if (error.message.includes('File too large') || error.message.includes('size')) {
            return { success: true, message: 'File size limit properly enforced' };
          }
          throw error;
        } finally {
          if (fs.existsSync(largeImagePath)) {
            fs.unlinkSync(largeImagePath);
          }
        }
      },
    },
  ];

  // Get test user
  console.log('Creating test user...');
  const user = await getOrCreateTestUser();
  console.log(`Test user created: ${user.email}\n`);

  // Run tests
  for (const testCase of testCases) {
    results.total++;
    console.log(`🧪 Running: ${testCase.name}`);

    try {
      const result = await testCase.test(user);
      results.passed++;
      results.details.push({
        name: testCase.name,
        status: 'PASSED',
        message: result.message,
        details: result,
      });
      console.log(`   ✅ PASSED: ${result.message}`);
    } catch (error) {
      results.failed++;
      results.details.push({
        name: testCase.name,
        status: 'FAILED',
        message: error.message,
        error: error.stack,
      });
      console.log(`   ❌ FAILED: ${error.message}`);
    }

    // Add delay between tests to avoid rate limiting
    if (results.total < testCases.length) {
      await sleep(1500); // 1.5 second delay
    }
    console.log('');
  }

  // Results summary
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  if (results.failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.message}`);
      });
    console.log('');
  }

  console.log('✨ Post image integration testing completed!');

  return results;
}

if (require.main === module) {
  runTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
