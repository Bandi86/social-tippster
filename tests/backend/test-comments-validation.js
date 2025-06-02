// Test script for testing comments API validation and functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCommentsAPI() {
  console.log('=== Testing Comments API Comprehensive Validation ===\n');

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

    // First, create a test post to comment on
    console.log('2. Creating test post for commenting...');
    const postResponse = await axios.post(
      `${API_BASE}/posts`,
      {
        title: 'Test Post for Comments',
        content: 'This post is for testing comments functionality',
        type: 'text',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        timeout: 10000,
      },
    );

    const testPostId = postResponse.data.id;
    console.log(`✅ Test post created with ID: ${testPostId}\n`);

    // Test cases for comments API
    const testCases = [
      {
        name: 'Valid comment creation',
        method: 'POST',
        endpoint: `/comments`,
        data: {
          content: 'This is a test comment',
          post_id: testPostId,
        },
        expectedStatus: 201,
      },
      {
        name: 'Invalid comment - missing content',
        method: 'POST',
        endpoint: `/comments`,
        data: {
          post_id: testPostId,
        },
        expectedStatus: 400,
      },
      {
        name: 'Invalid comment - missing post_id',
        method: 'POST',
        endpoint: `/comments`,
        data: {
          content: 'This is a test comment',
        },
        expectedStatus: 400,
      },
      {
        name: 'Invalid comment - empty content',
        method: 'POST',
        endpoint: `/comments`,
        data: {
          content: '',
          post_id: testPostId,
        },
        expectedStatus: 400,
      },
      {
        name: 'Invalid comment - non-existent post',
        method: 'POST',
        endpoint: `/comments`,
        data: {
          content: 'This is a test comment',
          post_id: '99999999-9999-9999-9999-999999999999',
        },
        expectedStatus: 404,
      },
      {
        name: 'Get comments for post',
        method: 'GET',
        endpoint: `/comments/post/${testPostId}?page=1&limit=10`,
        expectedStatus: 200,
      },
      {
        name: 'Get comments with invalid pagination',
        method: 'GET',
        endpoint: `/comments/post/${testPostId}?page=0&limit=101`,
        expectedStatus: 400,
      },
    ];

    let createdCommentId = null;

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
            createdCommentId = response.data.id;
            console.log(`   Created comment ID: ${createdCommentId}`);
          } else if (testCase.method === 'GET' && response.data.data) {
            console.log(`   Retrieved ${response.data.data.length} comments`);
            if (response.data.meta) {
              console.log(`   Total comments: ${response.data.meta.total}`);
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

    // Test comment interactions if we created a comment
    if (createdCommentId) {
      console.log('=== Testing Comment Interactions ===\n');

      const interactionTests = [
        {
          name: 'Like comment',
          method: 'POST',
          endpoint: `/comments/${createdCommentId}/like`,
          expectedStatus: 200,
        },
        {
          name: 'Unlike comment',
          method: 'DELETE',
          endpoint: `/comments/${createdCommentId}/like`,
          expectedStatus: 200,
        },
        {
          name: 'Get specific comment',
          method: 'GET',
          endpoint: `/comments/${createdCommentId}`,
          expectedStatus: 200,
        },
        {
          name: 'Reply to comment (nested comment)',
          method: 'POST',
          endpoint: `/comments`,
          data: {
            content: 'This is a reply to the comment',
            post_id: testPostId,
            parent_id: createdCommentId,
          },
          expectedStatus: 201,
        },
      ];

      let replyCommentId = null;

      for (const test of interactionTests) {
        console.log(`Testing: ${test.name}`);

        try {
          const config = {
            method: test.method,
            url: `${API_BASE}${test.endpoint}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 10000,
          };

          if (test.data) {
            config.data = test.data;
          }

          const response = await axios(config);

          console.log(`✅ Success: ${test.name} (${response.status})`);

          if (test.name.includes('Reply') && response.data.id) {
            replyCommentId = response.data.id;
            console.log(`   Created reply comment ID: ${replyCommentId}`);
          }
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

      // Test nested comments retrieval
      if (replyCommentId) {
        console.log('Testing: Get comments with nested replies');
        try {
          const response = await axios.get(
            `${API_BASE}/comments/post/${testPostId}?include_replies=true`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            },
          );

          console.log(`✅ Success: Retrieved comments with replies (${response.status})`);
          console.log(`   Found ${response.data.data.length} top-level comments`);
        } catch (error) {
          console.log(
            `❌ Failed to get nested comments: ${error.response?.data?.message || error.message}`,
          );
        }
        console.log('');
      }
    }

    console.log('🎉 Comments API testing completed!');
  } catch (error) {
    console.error('Setup failed:', error.response?.data?.message || error.message);
  }
}

testCommentsAPI();
