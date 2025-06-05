const axios = require('axios');

async function testValidationIssue() {
  console.log('Ì∑™ TESTING VALIDATION ISSUES');
  console.log('============================');

  try {
    // Login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testuser123@test.com',
      password: 'password123',
    });
    const token = loginRes.data.access_token;
    console.log('‚úÖ Login successful');

    // Try with DTO enum value exactly as defined
    const testData = {
      title: 'Validation Test',
      content: 'Testing validation issues',
      type: 'general',  // This matches PostType.GENERAL = 'general'
      status: 'published', // This matches PostStatus.PUBLISHED = 'published'
      visibility: 'public' // This matches PostVisibility.PUBLIC = 'public'
    };

    console.log('\nÌ≥ù Testing with full DTO compliance:');
    console.log(JSON.stringify(testData, null, 2));

    try {
      const response = await axios.post('http://localhost:3001/api/posts', testData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000 
      });
      
      console.log('‚úÖ SUCCESS! Post created:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('‚ùå VALIDATION/POST CREATION FAILED');
      
      if (error.response) {
        console.log('Status Code:', error.response.status);
        console.log('Response:', JSON.stringify(error.response.data, null, 2));
        console.log('Headers:', error.response.headers);
      } else if (error.code === 'ECONNABORTED') {
        console.log('Timeout - Backend might be hanging during save operation');
      } else {
        console.log('Other error:', error.message);
      }
      
      console.log('\nÌ¥ç This should show detailed error in backend console logs');
    }

  } catch (error) {
    console.error('‚ùå Script error:', error.message);
  }
}

testValidationIssue();
