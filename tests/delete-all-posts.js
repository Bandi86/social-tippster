/**
 * Delete All Posts Script
 * This script safely deletes all posts from the Social Tippster application
 * for testing purposes with fresh data.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function deleteAllPosts() {
  console.log('🗑️  Delete All Posts Script - Starting...\n');

  try {
    // Step 1: Login as admin to get authentication token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'bob@example.com', // Admin user from seed data
      password: 'password123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful\n');

    // Step 2: Get all posts (with pagination)
    console.log('2. Fetching all posts...');
    let allPosts = [];
    let page = 1;
    let totalPosts = 0;

    // Fetch all posts using pagination
    while (true) {
      const postsResponse = await axios.get(`${API_BASE}/posts?page=${page}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const posts = postsResponse.data.posts;
      totalPosts = postsResponse.data.total;

      allPosts.push(...posts);

      if (posts.length < 100 || allPosts.length >= totalPosts) {
        break; // No more posts to fetch
      }

      page++;
    }

    console.log(`✅ Found ${totalPosts} posts to delete\n`);

    if (allPosts.length === 0) {
      console.log('✅ No posts found. Database is already clean!');
      return;
    }

    // Step 3: Delete all posts using admin bulk delete endpoint
    console.log('3. Deleting all posts using admin bulk delete...');

    if (allPosts.length > 0) {
      const postIds = allPosts.map(post => post.id);

      try {
        const deleteResponse = await axios.post(
          `${API_BASE}/admin/posts/bulk-delete`,
          {
            postIds: postIds,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log(`✅ Bulk delete completed!`);
        console.log(`   Successfully processed: ${deleteResponse.data.processed} posts`);
        console.log(`   Total requested: ${postIds.length} posts`);
      } catch (error) {
        console.error(`❌ Bulk delete failed: ${error.response?.status || error.message}`);

        // Fallback to individual deletion if bulk fails
        console.log('\n3b. Falling back to individual deletion...');
        let deletedCount = 0;
        let failedCount = 0;

        for (const post of allPosts) {
          try {
            await axios.delete(`${API_BASE}/posts/${post.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            deletedCount++;

            // Show progress for every 10 posts
            if (deletedCount % 10 === 0) {
              console.log(`   Deleted ${deletedCount}/${allPosts.length} posts...`);
            }
          } catch (error) {
            failedCount++;
            console.warn(
              `   ⚠️ Failed to delete post ${post.id}: ${error.response?.status || error.message}`,
            );
          }
        }

        console.log(`\n✅ Individual deletion completed!`);
        console.log(`   Successfully deleted: ${deletedCount} posts`);
        if (failedCount > 0) {
          console.log(`   Failed to delete: ${failedCount} posts`);
        }
      }
    }

    // Step 4: Verify deletion
    console.log('\n4. Verifying deletion...');
    const verifyResponse = await axios.get(`${API_BASE}/posts?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const remainingPosts = verifyResponse.data.total;
    console.log(`✅ Verification complete: ${remainingPosts} posts remaining`);

    if (remainingPosts === 0) {
      console.log('\n🎉 SUCCESS: All posts have been deleted successfully!');
      console.log('📝 The application is now ready for testing with fresh data.');
    } else {
      console.log(`\n⚠️ WARNING: ${remainingPosts} posts could not be deleted.`);
    }
  } catch (error) {
    console.error('❌ Error during post deletion:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed. Please check admin credentials.');
    } else if (error.response?.status === 404) {
      console.error('🔗 API endpoint not found. Please check if the backend is running.');
    }
  }
}

// Run the script
deleteAllPosts();
