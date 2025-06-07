/**
 * Test script to verify posts API pagination metadata
 * Date: 2025-06-07
 * Purpose: Verify backend API returns correct pagination structure that frontend expects
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testPostsAPI() {
  console.log('🧪 Testing Posts API Pagination Response Structure...\n');

  try {
    // Test the posts endpoint
    const response = await axios.get(`${API_BASE_URL}/posts?page=1&limit=5`);

    console.log('✅ API Response received successfully');
    console.log('📊 Response structure:');

    // Check if response has the required fields
    const data = response.data;
    const requiredFields = ['posts', 'total', 'page', 'limit', 'totalPages'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        console.log(
          `  ✅ ${field}: ${field === 'posts' ? data[field].length + ' items' : data[field]}`,
        );
      } else {
        missingFields.push(field);
        console.log(`  ❌ ${field}: MISSING`);
      }
    });

    if (missingFields.length === 0) {
      console.log('\n🎉 SUCCESS: All required pagination fields are present!');
      console.log('📝 Response structure matches frontend expectations:');
      console.log(`   - posts: Array[${data.posts.length}]`);
      console.log(`   - total: ${data.total}`);
      console.log(`   - page: ${data.page}`);
      console.log(`   - limit: ${data.limit}`);
      console.log(`   - totalPages: ${data.totalPages}`);

      // Verify pagination math
      const expectedTotalPages = Math.ceil(data.total / data.limit);
      if (data.totalPages === expectedTotalPages) {
        console.log('✅ Pagination math is correct');
      } else {
        console.log(
          `❌ Pagination math error: expected ${expectedTotalPages}, got ${data.totalPages}`,
        );
      }
    } else {
      console.log(`\n❌ FAILED: Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Test another page
    console.log('\n🧪 Testing page 2...');
    const page2Response = await axios.get(`${API_BASE_URL}/posts?page=2&limit=5`);
    const page2Data = page2Response.data;

    if (page2Data.page === 2) {
      console.log('✅ Page parameter working correctly');
    } else {
      console.log(`❌ Page parameter error: expected 2, got ${page2Data.page}`);
    }

    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testPostsAPI()
  .then(success => {
    if (success) {
      console.log('\n🎯 CONCLUSION: Posts API pagination fix is working correctly!');
      console.log('   Frontend should now be able to display posts properly.');
    } else {
      console.log('\n💥 CONCLUSION: Posts API still has issues that need to be fixed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
