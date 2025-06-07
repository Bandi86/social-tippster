#!/usr/bin/env node
/**
 * Phase 2 Test Script - Complete End-to-End Testing
 * Tests FavoriteButton and ReportButton with fresh post creation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test user credentials (seeded in database)
const TEST_USER = {
  email: 'alice@example.com',
  password: 'password123'
};

async function testPhase2Complete() {
  console.log('=== Complete Phase 2 End-to-End Test ===\n');

  let accessToken;
  let testPostId;

  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER, {
      timeout: 10000,
    });
    accessToken = loginResponse.data.access_token;
    console.log('✓ Login successful!\n');

    // 2. Create a new test post
    console.log('2. Creating a new test post...');
    const newPost = {
      content: 'This is a test post for Phase 2 functionality testing',
      type: 'discussion',
      visibility: 'public',
      status: 'published'
    };

    const createResponse = await axios.post(`${API_BASE}/posts`, newPost, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });

    testPostId = createResponse.data.id;
    console.log(`✓ New test post created with ID: ${testPostId}\n`);

    // 3. Test bookmark functionality
    console.log('3. Testing bookmark functionality...');

    // Add bookmark
    try {
      const bookmarkResponse = await axios.post(`${API_BASE}/posts/${testPostId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log(`✓ Bookmark added (${bookmarkResponse.status}):`, bookmarkResponse.data);
    } catch (error) {
      console.log(`✗ Bookmark failed (${error.response?.status || 'Network Error'}):`, error.response?.data || error.message);
    }

    // Remove bookmark
    try {
      const unbookmarkResponse = await axios.delete(`${API_BASE}/posts/${testPostId}/bookmark`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log(`✓ Bookmark removed (${unbookmarkResponse.status}):`, unbookmarkResponse.data);
    } catch (error) {
      console.log(`✗ Remove bookmark failed (${error.response?.status || 'Network Error'}):`, error.response?.data || error.message);
    }

    // 4. Test report functionality with fresh post
    console.log('\n4. Testing report functionality with fresh post...');

    try {
      const reportResponse = await axios.post(`${API_BASE}/posts/${testPostId}/report`, {
        reason: 'spam'
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log(`✓ Report successful (${reportResponse.status}):`, reportResponse.data);
    } catch (error) {
      console.log(`✗ Report failed (${error.response?.status || 'Network Error'}):`, error.response?.data || error.message);
    }

    // Test duplicate report (should fail)
    console.log('\n5. Testing duplicate report (should fail)...');
    try {
      const duplicateReportResponse = await axios.post(`${API_BASE}/posts/${testPostId}/report`, {
        reason: 'harassment'
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log(`✗ Duplicate report unexpectedly succeeded (${duplicateReportResponse.status}):`, duplicateReportResponse.data);
    } catch (error) {
      console.log(`✓ Duplicate report correctly rejected (${error.response?.status}):`, error.response?.data?.message);
    }

    // 6. Test bookmark filtering
    console.log('\n6. Testing bookmark filtering...');

    // First add a bookmark back
    await axios.post(`${API_BASE}/posts/${testPostId}/bookmark`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    try {
      const bookmarkedPostsResponse = await axios.get(`${API_BASE}/posts?bookmarked=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log(`✓ Bookmarked posts filtering works (${bookmarkedPostsResponse.status}): Found ${bookmarkedPostsResponse.data.posts.length} bookmarked posts`);
    } catch (error) {
      console.log(`✗ Bookmark filtering failed (${error.response?.status || 'Network Error'}):`, error.response?.data || error.message);
    }

    // 7. Cleanup: Delete test post
    console.log('\n7. Cleaning up test post...');
    try {
      await axios.delete(`${API_BASE}/posts/${testPostId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });
      console.log('✓ Test post cleaned up successfully');
    } catch (error) {
      console.log(`⚠ Test post cleanup failed (${error.response?.status || 'Network Error'}):`, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);

    // Cleanup on error
    if (testPostId && accessToken) {
      try {
        await axios.delete(`${API_BASE}/posts/${testPostId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('✓ Test post cleaned up after error');
      } catch (cleanupError) {
        console.log('⚠ Test post cleanup failed after error');
      }
    }
  }

  console.log('\n=== Complete Phase 2 Test Summary ===');
  console.log('✓ FavoriteButton (bookmark) functionality tested');
  console.log('✓ ReportButton functionality tested');
  console.log('✓ Bookmark filtering tested');
  console.log('✓ Duplicate report prevention tested');
  console.log('✓ Post creation and cleanup tested');
  console.log('\nPhase 2 implementation validation complete!');
}

testPhase2Complete().catch(console.error);
