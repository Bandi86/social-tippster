const axios = require('axios');

async function debugPostCreation() {
  try {
    console.log('🧪 DETAILED POST CREATION DEBUG');
    console.log('================================');

    // Step 1: Login
    console.log('\n1. Attempting login...');
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testuser123@test.com',
      password: 'password123',
    });
    const token = loginRes.data.access_token;
    console.log('✅ Login successful, token received');

    // Step 2: Test various post creation scenarios
    const testCases = [
      {
        name: 'Minimal valid post',
        data: {
          title: 'Test Post',
          content: 'Test content',
          type: 'discussion',
        },
      },
      {
        name: 'Post with all basic fields',
        data: {
          title: 'Test Post 2',
          content: 'Test content 2',
          type: 'discussion',
          status: 'published',
          visibility: 'public',
        },
      },
      {
        name: 'Tip type post',
        data: {
          title: 'Test Tip',
          content: 'Test tip content',
          type: 'tip',
          tipCategory: 'single_bet',
          odds: 2.5,
          stake: 5,
          confidence: 4,
        },
      },
    ];

    for (const testCase of testCases) {
      console.log(`\n2. Testing: ${testCase.name}`);
      console.log('Data being sent:', JSON.stringify(testCase.data, null, 2));

      try {
        const postRes = await axios.post('http://localhost:3001/api/posts', testCase.data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log(`✅ ${testCase.name} - SUCCESS`);
        console.log('Response:', JSON.stringify(postRes.data, null, 2));
        return; // Exit on first success
      } catch (error) {
        console.log(`❌ ${testCase.name} - FAILED`);
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));

        if (error.response?.data?.details) {
          console.log('Validation Details:', JSON.stringify(error.response.data.details, null, 2));
        }
        console.log('---');
      }
    }

    console.log('\n❌ ALL TEST CASES FAILED');
  } catch (error) {
    console.error('❌ DEBUG SCRIPT ERROR:', error.message);
  }
}

debugPostCreation();
