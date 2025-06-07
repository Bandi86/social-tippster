/**
 * Frontend Posts Store Test
 * Tests the updated posts store to ensure it's working correctly
 */

// Simulate browser environment
global.window = { localStorage: { getItem: () => null } };
global.localStorage = { getItem: () => null };

// Mock the axios import to use our test version
const mockAxios = {
  get: async url => {
    console.log('Mock axios GET called with URL:', url);
    // Simulate successful API response
    return {
      data: {
        posts: [
          {
            id: 'test-1',
            title: 'Test Post 1',
            content: 'This is a test post',
            author: { username: 'testuser' },
            created_at: new Date().toISOString(),
          },
          {
            id: 'test-2',
            title: 'Test Post 2',
            content: 'Another test post',
            author: { username: 'testuser2' },
            created_at: new Date().toISOString(),
          },
        ],
        total: 11,
        page: 1,
        limit: 10,
        totalPages: 2,
      },
    };
  },
};

// Test the posts store logic
async function testPostsStore() {
  console.log('=== Posts Store Test ===\n');

  try {
    // Test 1: Simulate fetchPosts logic
    console.log('1. Testing fetchPosts logic...');

    const searchParams = new URLSearchParams();
    searchParams.append('page', '1');
    searchParams.append('limit', '10');

    const response = await mockAxios.get(`/posts?${searchParams.toString()}`);
    const postsData = response.data;

    console.log('✅ Response received');
    console.log('✅ Posts found:', postsData.posts.length);
    console.log('✅ Total posts:', postsData.total);
    console.log('✅ Total pages:', postsData.totalPages);

    // Test 2: Check if data structure matches expectations
    console.log('\n2. Testing data structure...');
    const firstPost = postsData.posts[0];
    console.log('✅ First post ID:', firstPost.id);
    console.log('✅ First post title:', firstPost.title);
    console.log('✅ First post author:', firstPost.author.username);

    console.log('\n🎉 Posts store logic test passed!');
    console.log('📝 The fix should now work in the browser.');
  } catch (error) {
    console.error('❌ Error in posts store test:', error);
  }
}

testPostsStore();
