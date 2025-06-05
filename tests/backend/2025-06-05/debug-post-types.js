const axios = require('axios');

async function testPostCreationSimple() {
  try {
    console.log('🧪 SIMPLE POST CREATION TEST');
    console.log('============================');

    // Login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testuser123@test.com',
      password: 'password123',
    });
    const token = loginRes.data.access_token;
    console.log('✅ Login successful');

    // Test only "general" type to see if it's a type issue
    const testData = {
      title: 'Test Post',
      content: 'Test content',
      type: 'general', // Try general instead of discussion
    };

    console.log('\nTesting with general type...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    try {
      const postRes = await axios.post('http://localhost:3001/api/posts', testData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ SUCCESS with general type!');
      console.log('Response:', JSON.stringify(postRes.data, null, 2));
    } catch (error) {
      console.log('❌ FAILED with general type');
      console.log('Status:', error.response?.status);
      console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    // Test only "discussion" type
    const testData2 = {
      title: 'Test Post Discussion',
      content: 'Test discussion content',
      type: 'discussion',
    };

    console.log('\nTesting with discussion type...');
    console.log('Data:', JSON.stringify(testData2, null, 2));

    try {
      const postRes = await axios.post('http://localhost:3001/api/posts', testData2, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ SUCCESS with discussion type!');
      console.log('Response:', JSON.stringify(postRes.data, null, 2));
    } catch (error) {
      console.log('❌ FAILED with discussion type');
      console.log('Status:', error.response?.status);
      console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

testPostCreationSimple();
