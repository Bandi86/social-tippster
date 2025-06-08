// Advanced Post Image Integration Test Suite
// This expanded version includes comprehensive testing scenarios for all post-image functionality

// Set environment to test to disable throttling
process.env.NODE_ENV = 'test';

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const SERVER_BASE = 'http://localhost:3001';

// Enhanced test configuration
const TEST_CONFIG = {
  timeout: 15000,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
  concurrentUploads: 5,
  performanceThreshold: 2000, // 2 seconds per operation
  requestDelay: 2500, // 2.5 second delay between requests to avoid rate limiting
};

/**
 * Simple sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced user management with different user roles
 */
async function createTestUsers() {
  const users = [];

  for (let i = 0; i < 3; i++) {
    const email = `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${i}@test.com`;
    const password = 'Password123!';

    try {
      // Try to register new user
      await axios.post(
        `${API_BASE}/auth/register`,
        {
          username: `testuser_${Date.now()}_${i}`,
          email,
          password,
          first_name: 'Test',
          last_name: `User${i}`,
        },
        { timeout: TEST_CONFIG.timeout },
      );
    } catch (err) {
      // User might already exist, continue
    }

    try {
      const loginResponse = await axios.post(
        `${API_BASE}/auth/login`,
        { email, password },
        { withCredentials: true, timeout: TEST_CONFIG.timeout },
      );

      users.push({
        id: i,
        email,
        password,
        token: loginResponse.data.access_token,
        name: `TestUser${i}`,
      });
    } catch (err) {
      console.warn(`Failed to create test user ${i}: ${err.message}`);
    }
  }

  return users;
}

/**
 * Enhanced image creation with different formats and sizes
 */
function createTestImages() {
  const images = {
    // Valid small PNG (1x1 pixel)
    validSmall: {
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64',
      ),
      filename: 'valid-small.png',
      contentType: 'image/png',
    },

    // Valid medium PNG (100x100 pixel)
    validMedium: {
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64',
      ),
      filename: 'valid-medium.png',
      contentType: 'image/png',
    },

    // Oversized file (6MB)
    oversized: {
      buffer: Buffer.alloc(6 * 1024 * 1024),
      filename: 'oversized.png',
      contentType: 'image/png',
    },

    // Invalid file type
    invalidType: {
      buffer: Buffer.from('This is not an image file'),
      filename: 'invalid.txt',
      contentType: 'text/plain',
    },

    // Corrupted image file
    corrupted: {
      buffer: Buffer.from('PNG_HEADER_FAKE_DATA_CORRUPTED'),
      filename: 'corrupted.png',
      contentType: 'image/png',
    },

    // Empty file
    empty: {
      buffer: Buffer.alloc(0),
      filename: 'empty.png',
      contentType: 'image/png',
    },
  };

  // Create temporary files
  Object.entries(images).forEach(([key, image]) => {
    const filepath = `./${image.filename}`;
    fs.writeFileSync(filepath, image.buffer);
    images[key].filepath = filepath;
  });

  return images;
}

/**
 * Enhanced image upload function with retry logic
 */
async function uploadImageWithRetry(filepath, token, endpoint = 'post', maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filepath));

      const response = await axios.post(`${API_BASE}/uploads/${endpoint}`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        timeout: TEST_CONFIG.timeout,
      });

      return response.data;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Upload failed after ${maxRetries} attempts: ${error.response?.data?.message || error.message}`,
        );
      }

      // Wait before retry (exponential backoff)
      await sleep(TEST_CONFIG.requestDelay * attempt);
    }
  }
}

/**
 * Enhanced post creation with validation
 */
async function createPostWithValidation(postData, token, expectedStatus = 201) {
  try {
    const response = await axios.post(`${API_BASE}/posts`, postData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: TEST_CONFIG.timeout,
    });

    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === expectedStatus) {
      return { error: error.response.data, status: error.response.status };
    }
    throw new Error(`Post creation failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Enhanced image accessibility test
 */
async function testImageAccessibilityEnhanced(imageUrl, expectedStatus = 200) {
  try {
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${SERVER_BASE}${imageUrl}`;
    const response = await axios.head(fullUrl, {
      timeout: TEST_CONFIG.timeout,
      validateStatus: () => true, // Don't throw on any status
    });

    return {
      accessible: response.status === expectedStatus,
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
    };
  } catch (error) {
    return {
      accessible: false,
      status: 0,
      error: error.message,
    };
  }
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  startTimer(operation) {
    this.metrics[operation] = { startTime: Date.now() };
  }

  endTimer(operation) {
    if (this.metrics[operation]) {
      this.metrics[operation].endTime = Date.now();
      this.metrics[operation].duration =
        this.metrics[operation].endTime - this.metrics[operation].startTime;
      return this.metrics[operation].duration;
    }
    return 0;
  }

  getMetrics() {
    return this.metrics;
  }

  isWithinThreshold(operation, threshold = TEST_CONFIG.performanceThreshold) {
    return this.metrics[operation]?.duration <= threshold;
  }
}

/**
 * Comprehensive test suite
 */
async function runAdvancedTests() {
  console.log('🚀 Starting Advanced Post Image Integration Tests...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: [],
    performance: {},
  };

  const performanceMonitor = new PerformanceMonitor();

  // Setup
  console.log('🔧 Setting up test environment...');
  const users = await createTestUsers();
  const images = createTestImages();

  if (users.length === 0) {
    console.error('❌ Failed to create test users. Aborting tests.');
    return results;
  }

  console.log(`✅ Created ${users.length} test users`);
  console.log(`✅ Created ${Object.keys(images).length} test images\n`);

  const testCases = [
    // Group 1: Basic Upload Functionality
    {
      group: 'Basic Upload Functionality',
      name: 'Upload valid small image to post endpoint',
      test: async user => {
        performanceMonitor.startTimer('basicUpload');
        const uploadResult = await uploadImageWithRetry(
          images.validSmall.filepath,
          user.token,
          'post',
        );
        const duration = performanceMonitor.endTimer('basicUpload');

        if (!uploadResult.url || uploadResult.error) {
          throw new Error(`Upload failed: ${uploadResult.error || 'No URL returned'}`);
        }

        if (!uploadResult.url.includes('/uploads/posts/')) {
          throw new Error(`Expected post upload path, got: ${uploadResult.url}`);
        }

        return {
          success: true,
          message: `Image uploaded successfully in ${duration}ms`,
          url: uploadResult.url,
          performance: {
            duration,
            withinThreshold: performanceMonitor.isWithinThreshold('basicUpload'),
          },
        };
      },
    },

    {
      group: 'Basic Upload Functionality',
      name: 'Upload valid image to profile endpoint',
      test: async user => {
        const uploadResult = await uploadImageWithRetry(
          images.validMedium.filepath,
          user.token,
          'profile',
        );

        if (!uploadResult.url || uploadResult.error) {
          throw new Error(`Upload failed: ${uploadResult.error || 'No URL returned'}`);
        }

        if (!uploadResult.url.includes('/uploads/profile/')) {
          throw new Error(`Expected profile upload path, got: ${uploadResult.url}`);
        }

        return {
          success: true,
          message: 'Profile image uploaded successfully',
          url: uploadResult.url,
        };
      },
    },

    {
      group: 'Error Handling',
      name: 'Reject oversized file upload',
      test: async user => {
        try {
          await uploadImageWithRetry(images.oversized.filepath, user.token, 'post');
          throw new Error('Expected oversized file to be rejected');
        } catch (error) {
          if (
            error.message.includes('File too large') ||
            error.message.includes('size') ||
            error.message.includes('413')
          ) {
            return { success: true, message: 'Oversized file properly rejected' };
          }
          throw error;
        }
      },
    },

    {
      group: 'Error Handling',
      name: 'Reject invalid file type',
      test: async user => {
        try {
          await uploadImageWithRetry(images.invalidType.filepath, user.token, 'post');
          throw new Error('Expected invalid file type to be rejected');
        } catch (error) {
          if (
            error.message.includes('Only image files are allowed') ||
            error.message.includes('file type') ||
            error.message.includes('format') ||
            error.message.includes('400')
          ) {
            return { success: true, message: 'Invalid file type properly rejected' };
          }
          throw error;
        }
      },
    },

    {
      group: 'Error Handling',
      name: 'Reject corrupted image file',
      test: async user => {
        try {
          await uploadImageWithRetry(images.corrupted.filepath, user.token, 'post');
          throw new Error('Expected corrupted image to be rejected');
        } catch (error) {
          if (
            error.message.includes('invalid') ||
            error.message.includes('corrupted') ||
            error.message.includes('400')
          ) {
            return { success: true, message: 'Corrupted image properly rejected' };
          }
          throw error;
        }
      },
    },

    {
      group: 'Error Handling',
      name: 'Reject empty file upload',
      test: async user => {
        try {
          await uploadImageWithRetry(images.empty.filepath, user.token, 'post');
          throw new Error('Expected empty file to be rejected');
        } catch (error) {
          if (
            error.message.includes('empty') ||
            error.message.includes('size') ||
            error.message.includes('400')
          ) {
            return { success: true, message: 'Empty file properly rejected' };
          }
          throw error;
        }
      },
    },

    // Group 2: Authentication and Authorization
    {
      group: 'Authentication and Authorization',
      name: 'Reject unauthenticated upload request',
      test: async () => {
        try {
          const form = new FormData();
          form.append('file', fs.createReadStream(images.validSmall.filepath));

          await axios.post(`${API_BASE}/uploads/post`, form, {
            headers: form.getHeaders(),
            timeout: TEST_CONFIG.timeout,
          });

          throw new Error('Expected unauthenticated request to be rejected');
        } catch (error) {
          // Check for 401 or any other authorization-related status
          if (error.response?.status === 401 || error.response?.status === 403) {
            return { success: true, message: 'Unauthenticated request properly rejected' };
          }
          throw new Error(
            `Expected 401/403 status, got: ${error.response?.status || 'no response'}, message: ${error.message}`,
          );
        }
      },
    },

    // Group 3: Post Creation with Images
    {
      group: 'Post Creation with Images',
      name: 'Create post with uploaded localhost image URL',
      test: async user => {
        performanceMonitor.startTimer('postWithImage');

        // Upload image first
        const uploadResult = await uploadImageWithRetry(
          images.validSmall.filepath,
          user.token,
          'post',
        );
        const imageUrl = `${SERVER_BASE}${uploadResult.url}`;

        // Create post
        const postData = {
          content: 'This post includes an uploaded image with localhost URL.',
          type: 'discussion',
          imageUrl: imageUrl,
        };

        const post = await createPostWithValidation(postData, user.token);
        const duration = performanceMonitor.endTimer('postWithImage');

        if (post.image_url !== imageUrl) {
          throw new Error(`Image URL mismatch. Expected: ${imageUrl}, Got: ${post.image_url}`);
        }

        return {
          success: true,
          message: `Post created with image in ${duration}ms`,
          postId: post.id,
          performance: {
            duration,
            withinThreshold: performanceMonitor.isWithinThreshold('postWithImage'),
          },
        };
      },
    },

    {
      group: 'Post Creation with Images',
      name: 'Create post with external HTTPS image URL',
      test: async user => {
        const externalImageUrl = 'https://via.placeholder.com/300x200.png';

        const postData = {
          content: 'This post includes an external HTTPS image URL.',
          type: 'discussion',
          imageUrl: externalImageUrl,
        };

        const post = await createPostWithValidation(postData, user.token);

        if (post.image_url !== externalImageUrl) {
          throw new Error(
            `Image URL mismatch. Expected: ${externalImageUrl}, Got: ${post.image_url}`,
          );
        }

        return { success: true, message: 'Post created with external HTTPS image URL' };
      },
    },

    {
      group: 'Post Creation with Images',
      name: 'Create post without image (null handling)',
      test: async user => {
        const postData = {
          content: 'This post has no image attached.',
          type: 'discussion',
        };

        const post = await createPostWithValidation(postData, user.token);

        if (post.image_url !== null && post.image_url !== undefined) {
          throw new Error(`Expected null image_url, got: ${post.image_url}`);
        }

        return { success: true, message: 'Post without image created correctly' };
      },
    },

    {
      group: 'Validation',
      name: 'Reject post with invalid image URL',
      test: async user => {
        const postData = {
          content: 'This post has an invalid image URL.',
          type: 'discussion',
          imageUrl: 'not-a-valid-url-format',
        };

        const result = await createPostWithValidation(postData, user.token, 400);

        if (result.status === 400) {
          return { success: true, message: 'Invalid image URL properly rejected' };
        }

        throw new Error('Expected validation error for invalid URL');
      },
    },

    {
      group: 'Validation',
      name: 'Accept empty string as image URL',
      test: async user => {
        const postData = {
          content: 'This post has an empty image URL.',
          type: 'discussion',
          imageUrl: '',
        };

        const post = await createPostWithValidation(postData, user.token);

        if (post.image_url !== null && post.image_url !== undefined && post.image_url !== '') {
          throw new Error(
            `Expected null/undefined/empty image_url for empty string, got: ${post.image_url}`,
          );
        }

        return { success: true, message: 'Empty string image URL handled correctly' };
      },
    },

    // Group 4: Data Persistence and Retrieval
    {
      group: 'Data Persistence and Retrieval',
      name: 'Retrieve post maintains image URL',
      test: async user => {
        // Upload and create post
        const uploadResult = await uploadImageWithRetry(
          images.validMedium.filepath,
          user.token,
          'post',
        );
        const imageUrl = `${SERVER_BASE}${uploadResult.url}`;

        const postData = {
          content: 'Testing image URL persistence on retrieval.',
          type: 'discussion',
          imageUrl: imageUrl,
        };

        const createdPost = await createPostWithValidation(postData, user.token);

        // Retrieve the post
        const response = await axios.get(`${API_BASE}/posts/${createdPost.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: TEST_CONFIG.timeout,
        });

        const retrievedPost = response.data;

        if (retrievedPost.image_url !== imageUrl) {
          throw new Error(
            `Retrieved image URL mismatch. Expected: ${imageUrl}, Got: ${retrievedPost.image_url}`,
          );
        }

        return { success: true, message: 'Post retrieval maintains correct image URL' };
      },
    },

    // Group 5: Image Accessibility
    {
      group: 'Image Accessibility',
      name: 'Uploaded images accessible via HTTP',
      test: async user => {
        const uploadResult = await uploadImageWithRetry(
          images.validSmall.filepath,
          user.token,
          'post',
        );
        const accessibilityResult = await testImageAccessibilityEnhanced(uploadResult.url);

        if (!accessibilityResult.accessible) {
          throw new Error(
            `Image not accessible: ${accessibilityResult.error || `Status: ${accessibilityResult.status}`}`,
          );
        }

        if (!accessibilityResult.contentType?.startsWith('image/')) {
          throw new Error(`Expected image content type, got: ${accessibilityResult.contentType}`);
        }

        return {
          success: true,
          message: 'Uploaded image is accessible via HTTP',
          details: accessibilityResult,
        };
      },
    },

    // Group 6: Performance and Concurrency
    {
      group: 'Performance and Concurrency',
      name: 'Concurrent image uploads',
      test: async user => {
        performanceMonitor.startTimer('concurrentUploads');

        const uploadPromises = [];
        for (let i = 0; i < TEST_CONFIG.concurrentUploads; i++) {
          const tempImagePath = `./concurrent-${i}.png`;
          fs.writeFileSync(tempImagePath, images.validSmall.buffer);

          uploadPromises.push(
            uploadImageWithRetry(tempImagePath, user.token, 'post').finally(() => {
              if (fs.existsSync(tempImagePath)) {
                fs.unlinkSync(tempImagePath);
              }
            }),
          );
        }

        const results = await Promise.all(uploadPromises);
        const duration = performanceMonitor.endTimer('concurrentUploads');

        // Check all uploads succeeded
        for (const result of results) {
          if (!result.url) {
            throw new Error('One or more concurrent uploads failed');
          }
        }

        // Check all URLs are unique
        const urls = results.map(r => r.url);
        const uniqueUrls = new Set(urls);
        if (uniqueUrls.size !== urls.length) {
          throw new Error('Concurrent uploads produced duplicate URLs');
        }

        return {
          success: true,
          message: `${TEST_CONFIG.concurrentUploads} concurrent uploads completed in ${duration}ms`,
          performance: {
            duration,
            avgPerUpload: duration / TEST_CONFIG.concurrentUploads,
            withinThreshold: duration <= TEST_CONFIG.performanceThreshold * 2, // Allow more time for concurrent
          },
        };
      },
    },

    // Group 7: Multi-user scenarios
    {
      group: 'Multi-user Scenarios',
      name: 'Multiple users can upload simultaneously',
      test: async () => {
        if (users.length < 2) {
          return {
            success: true,
            message: 'Skipped: Insufficient users for multi-user test',
            skipped: true,
          };
        }

        performanceMonitor.startTimer('multiUserUploads');

        const uploadPromises = users.slice(0, 2).map((user, index) => {
          const tempImagePath = `./multi-user-${index}.png`;
          fs.writeFileSync(tempImagePath, images.validSmall.buffer);

          return uploadImageWithRetry(tempImagePath, user.token, 'post').finally(() => {
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
            }
          });
        });

        const results = await Promise.all(uploadPromises);
        const duration = performanceMonitor.endTimer('multiUserUploads');

        // Verify all uploads succeeded and have unique URLs
        const urls = results.map(r => r.url);
        const uniqueUrls = new Set(urls);

        if (uniqueUrls.size !== urls.length) {
          throw new Error('Multi-user uploads produced duplicate URLs');
        }

        return {
          success: true,
          message: `${users.length} users uploaded simultaneously in ${duration}ms`,
          performance: { duration },
        };
      },
    },
  ];

  // Run tests
  let currentGroup = '';
  for (const testCase of testCases) {
    results.total++;

    // Print group header
    if (testCase.group !== currentGroup) {
      currentGroup = testCase.group;
      console.log(`\n📋 ${currentGroup}`);
      console.log('='.repeat(currentGroup.length + 4));
    }

    console.log(`🧪 ${testCase.name}`);

    try {
      const testUser = users[0]; // Use first user by default
      const result = await testCase.test(testUser);

      if (result.skipped) {
        results.skipped++;
        results.details.push({
          name: testCase.name,
          group: testCase.group,
          status: 'SKIPPED',
          message: result.message,
        });
        console.log(`   ⏭️  SKIPPED: ${result.message}`);
      } else {
        results.passed++;
        results.details.push({
          name: testCase.name,
          group: testCase.group,
          status: 'PASSED',
          message: result.message,
          details: result,
        });
        console.log(`   ✅ PASSED: ${result.message}`);

        // Track performance metrics
        if (result.performance) {
          results.performance[testCase.name] = result.performance;
        }
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        name: testCase.name,
        group: testCase.group,
        status: 'FAILED',
        message: error.message,
        error: error.stack,
      });
      console.log(`   ❌ FAILED: ${error.message}`);
    }

    // Add delay between tests to avoid rate limiting
    if (results.total < testCases.length) {
      await sleep(TEST_CONFIG.requestDelay);
    }
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test files...');
  Object.values(images).forEach(image => {
    if (image.filepath && fs.existsSync(image.filepath)) {
      fs.unlinkSync(image.filepath);
    }
  });

  // Results summary
  console.log('\n📊 ADVANCED TEST RESULTS SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(
    `Success Rate: ${((results.passed / (results.total - results.skipped)) * 100).toFixed(1)}%`,
  );

  // Performance summary
  const performanceResults = Object.values(results.performance).filter(p => p.duration);
  if (performanceResults.length > 0) {
    const avgDuration =
      performanceResults.reduce((sum, p) => sum + p.duration, 0) / performanceResults.length;
    const withinThreshold = performanceResults.filter(p => p.withinThreshold).length;

    console.log('\n⚡ PERFORMANCE SUMMARY');
    console.log('=====================');
    console.log(`Average Operation Time: ${avgDuration.toFixed(0)}ms`);
    console.log(`Operations Within Threshold: ${withinThreshold}/${performanceResults.length}`);
    console.log(
      `Performance Score: ${((withinThreshold / performanceResults.length) * 100).toFixed(1)}%`,
    );
  }

  // Group-wise results
  const groupResults = {};
  results.details.forEach(test => {
    if (!groupResults[test.group]) {
      groupResults[test.group] = { total: 0, passed: 0, failed: 0, skipped: 0 };
    }
    groupResults[test.group].total++;
    groupResults[test.group][test.status.toLowerCase()]++;
  });

  console.log('\n📈 RESULTS BY GROUP');
  console.log('===================');
  Object.entries(groupResults).forEach(([group, stats]) => {
    const rate = ((stats.passed / (stats.total - stats.skipped)) * 100).toFixed(1);
    console.log(`${group}: ${stats.passed}/${stats.total - stats.skipped} passed (${rate}%)`);
  });

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.group} > ${test.name}: ${test.message}`);
      });
  }

  console.log('\n✨ Advanced post image integration testing completed!');
  console.log(`\n📝 Detailed results: ${results.details.length} test cases executed`);
  console.log(
    `🎯 Overall Status: ${results.failed === 0 ? 'ALL TESTS PASSED' : `${results.failed} TESTS FAILED`}`,
  );

  return results;
}

if (require.main === module) {
  runAdvancedTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runAdvancedTests };
