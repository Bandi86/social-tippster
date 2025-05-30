// Test script for testing posts API validation and functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPostsAPI() {
  console.log('=== Testing Posts API Comprehensive Validation ===\n');

  try {
    // First login to get a valid token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: 'testuser123@test.com',
        password: 'password123',
      },
      {
        withCredentials: true,
        timeout: 10000,
      },
    );

    const accessToken = loginResponse.data.access_token;
    console.log('Login successful!\n');

    // Test cases for posts API
    const testCases = [
      {
        name: 'Valid discussion post creation',
        method: 'POST',
        endpoint: '/posts',
        data: {
          title: 'Test Discussion Post',
          content: 'This is a test discussion post content',
          type: 'discussion',
        },
        expectedStatus: 201,
      },
      {
        name: 'Valid tip post creation',
        method: 'POST',
        endpoint: '/posts',
        data: {
          title: 'Test Tip Post',
          content: 'This is a test tip post content',
          type: 'tip',
          odds: 2.5,
          stake: 5,
          confidence: 4,
        },
        expectedStatus: 201,
      },
      {
        name: 'Invalid post - missing title',
        method: 'POST',
        endpoint: '/posts',
        data: {
          content: 'This is a test post content',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Invalid post - empty content',
        method: 'POST',
        endpoint: '/posts',
        data: {
          title: 'Test Post Title',
          content: '',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Get posts with pagination',
        method: 'GET',
        endpoint: '/posts?page=1&limit=5',
        expectedStatus: 200,
      },
      {
        name: 'Get posts with invalid pagination',
        method: 'GET',
        endpoint: '/posts?page=0&limit=101',
        expectedStatus: 400,
      },
    ];

    let createdPostId = null;

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);

      try {
        const config = {
          method: testCase.method,
          url: `${API_BASE}${testCase.endpoint}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000,
        };

        if (testCase.data) {
          config.data = testCase.data;
        }

        const response = await axios(config);

        if (response.status === testCase.expectedStatus) {
          console.log(`✅ Success: Expected status ${testCase.expectedStatus}`);

          if (testCase.method === 'POST' && response.data.id) {
            createdPostId = response.data.id;
            console.log(`   Created post ID: ${createdPostId}`);
          } else if (testCase.method === 'GET' && response.data.data) {
            console.log(`   Retrieved ${response.data.data.length} posts`);
            if (response.data.meta) {
              console.log(`   Total posts: ${response.data.meta.total}`);
            }
          }
        } else {
          console.log(
            `⚠️ Unexpected status: Expected ${testCase.expectedStatus}, got ${response.status}`,
          );
        }
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          if (status === testCase.expectedStatus) {
            console.log(
              `✅ Expected error (${status}): ${error.response.data.message || error.response.data.error}`,
            );
          } else {
            console.log(
              `❌ Unexpected error (${status}): ${error.response.data.message || error.response.data.error}`,
            );
          }
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
      }
      console.log('');
    }

    // Test post interactions if we created a post
    if (createdPostId) {
      console.log('=== Testing Post Interactions ===\n');

      const interactionTests = [
        {
          name: 'Like post',
          method: 'POST',
          endpoint: `/posts/${createdPostId}/like`,
          expectedStatus: 200,
        },
        {
          name: 'Unlike post',
          method: 'DELETE',
          endpoint: `/posts/${createdPostId}/like`,
          expectedStatus: 200,
        },
        {
          name: 'Bookmark post',
          method: 'POST',
          endpoint: `/posts/${createdPostId}/bookmark`,
          expectedStatus: 200,
        },
        {
          name: 'Track post view',
          method: 'POST',
          endpoint: `/posts/${createdPostId}/view`,
          expectedStatus: 200,
        },
        {
          name: 'Get specific post',
          method: 'GET',
          endpoint: `/posts/${createdPostId}`,
          expectedStatus: 200,
        },
      ];

      for (const test of interactionTests) {
        console.log(`Testing: ${test.name}`);

        try {
          const response = await axios({
            method: test.method,
            url: `${API_BASE}${test.endpoint}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 10000,
          });

          console.log(`✅ Success: ${test.name} (${response.status})`);
        } catch (error) {
          if (error.response) {
            console.log(
              `❌ Failed: ${test.name} (${error.response.status}) - ${error.response.data.message || error.response.data.error}`,
            );
          } else {
            console.log(`❌ Network error: ${error.message}`);
          }
        }
        console.log('');
      }
    }

    console.log('🎉 Posts API testing completed!');
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
  }
}

testPostsAPI();
