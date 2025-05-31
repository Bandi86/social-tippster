// Test script for testing posts interaction endpoints (like, bookmark)
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPostInteractions() {
  console.log('=== Testing Posts Interaction Endpoints ===\n');

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
    console.log('✓ Login successful!\n');

    // Create a test post first
    console.log('2. Creating a test post...');
    const postResponse = await axios.post(
      `${API_BASE}/posts`,
      {
        title: 'Test Post for Interactions',
        content: 'This is a test post for testing interactions',
        type: 'discussion',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      },
    );

    const postId = postResponse.data.id;
    console.log(`✓ Post created with ID: ${postId}\n`);

    // Test like endpoint
    console.log('3. Testing like endpoint...');
    try {
      const likeResponse = await axios.post(
        `${API_BASE}/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        },
      );
      console.log(`✓ Like response (${likeResponse.status}):`, likeResponse.data);
    } catch (error) {
      console.log(
        `✗ Like failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    // Test bookmark endpoint
    console.log('\n4. Testing bookmark endpoint...');
    try {
      const bookmarkResponse = await axios.post(
        `${API_BASE}/posts/${postId}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        },
      );
      console.log(`✓ Bookmark response (${bookmarkResponse.status}):`, bookmarkResponse.data);
    } catch (error) {
      console.log(
        `✗ Bookmark failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    // Test unlike endpoint
    console.log('\n5. Testing unlike endpoint...');
    try {
      const unlikeResponse = await axios.delete(`${API_BASE}/posts/${postId}/like`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });
      console.log(`✓ Unlike response (${unlikeResponse.status}): Success`);
    } catch (error) {
      console.log(
        `✗ Unlike failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    // Test unbookmark endpoint
    console.log('\n6. Testing unbookmark endpoint...');
    try {
      const unbookmarkResponse = await axios.delete(`${API_BASE}/posts/${postId}/bookmark`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });
      console.log(`✓ Unbookmark response (${unbookmarkResponse.status}): Success`);
    } catch (error) {
      console.log(
        `✗ Unbookmark failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    // Test view tracking endpoint (this should already work)
    console.log('\n7. Testing view tracking endpoint...');
    try {
      const viewResponse = await axios.post(
        `${API_BASE}/posts/${postId}/view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        },
      );
      console.log(`✓ View tracking response (${viewResponse.status}):`, viewResponse.data);
    } catch (error) {
      console.log(
        `✗ View tracking failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    // Test pagination validation
    console.log('\n8. Testing pagination validation...');

    // Test invalid page (0)
    try {
      const invalidPageResponse = await axios.get(`${API_BASE}/posts?page=0&limit=10`, {
        timeout: 10000,
      });
      console.log(`✗ Page=0 should have failed but got (${invalidPageResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✓ Page=0 correctly rejected (400):`, error.response.data.message);
      } else {
        console.log(
          `✗ Page=0 failed with unexpected error (${error.response?.status}):`,
          error.response?.data || error.message,
        );
      }
    }

    // Test invalid limit (101)
    try {
      const invalidLimitResponse = await axios.get(`${API_BASE}/posts?page=1&limit=101`, {
        timeout: 10000,
      });
      console.log(`✗ Limit=101 should have failed but got (${invalidLimitResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✓ Limit=101 correctly rejected (400):`, error.response.data.message);
      } else {
        console.log(
          `✗ Limit=101 failed with unexpected error (${error.response?.status}):`,
          error.response?.data || error.message,
        );
      }
    }

    // Test valid pagination
    try {
      const validPaginationResponse = await axios.get(`${API_BASE}/posts?page=1&limit=5`, {
        timeout: 10000,
      });
      console.log(
        `✓ Valid pagination works (${validPaginationResponse.status}): Found ${validPaginationResponse.data.total} posts`,
      );
    } catch (error) {
      console.log(
        `✗ Valid pagination failed (${error.response?.status || 'Network Error'}):`,
        error.response?.data || error.message,
      );
    }

    console.log('\n=== Test Summary ===');
    console.log('Tests completed! Check the results above for any failing endpoints.');
  } catch (error) {
    console.error('Test setup failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPostInteractions().catch(console.error);
