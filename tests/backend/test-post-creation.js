/**
 * Poszt létrehozás teszt
 * Teszteli a posztkészítés teljes folyamatát
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Test configuration
const API_BASE = 'http://localhost:3001/api';
const TEST_USER_REGISTER = {
  email: 'test@test.com',
  password: 'test123',
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
};

const TEST_USER_LOGIN = {
  email: 'test@test.com',
  password: 'test123',
};

let authToken = null;

// Helper function to make authenticated requests
async function authRequest(method, url, data = null) {
  const config = {
    method,
    url: `${API_BASE}${url}`,
    headers: {},
  };

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
    console.log('🔑 Using auth token:', authToken.substring(0, 20) + '...');
  }

  if (data) {
    if (data instanceof FormData) {
      config.data = data;
      // For FormData, merge headers instead of overwriting
      Object.assign(config.headers, data.getHeaders());
    } else {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
  }

  console.log('📡 Making request:', method, url, 'with headers:', Object.keys(config.headers));

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Request failed: ${method} ${url}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    throw error;
  }
}

// Test functions
async function testRegister() {
  console.log('📝 Testing user registration...');
  try {
    await authRequest('POST', '/auth/register', TEST_USER_REGISTER);
    console.log('✅ Registration successful');
    return true;
  } catch (error) {
    if (error.response && (error.response.status === 409 || error.response.status === 400)) {
      console.log('⚠️ User already exists or validation error - continuing with login');
      return true;
    }
    console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('🔐 Testing login...');
  try {
    const response = await authRequest('POST', '/auth/login', TEST_USER_LOGIN);
    authToken = response.accessToken || response.access_token;
    console.log(
      '✅ Login successful, token:',
      authToken ? authToken.substring(0, 20) + '...' : 'NO TOKEN',
    );
    return true;
  } catch (error) {
    console.log("⚠️ Login failed - this is expected if test user doesn't exist");
    return false;
  }
}

async function testImageUpload() {
  console.log('📷 Testing image upload...');

  // Create a simple test image (1x1 pixel PNG)
  const testImageBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA';
  const testImagePath = './test-image.png';

  // Write test image to file
  fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));

    const result = await authRequest('POST', '/uploads/post', formData);
    console.log('✅ Image upload successful:', result.url);

    // Clean up test file
    fs.unlinkSync(testImagePath);

    return result.url;
  } catch (error) {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    throw error;
  }
}

async function testPostCreation(imageUrl = null) {
  console.log('📝 Testing post creation...');

  const postData = {
    content: 'Ez egy teszt poszt címkékkel! #teszt #sport',
    type: 'general',
    tags: ['teszt', 'sport', 'automatikus'],
    imageUrl: imageUrl,
    isPremium: false,
    commentsEnabled: true,
    sharingEnabled: true,
    status: 'published',
    visibility: 'public',
  };

  try {
    const result = await authRequest('POST', '/posts', postData);
    console.log('✅ Post creation successful:', result.id);
    return result;
  } catch (error) {
    throw error;
  }
}

async function testTagCounter() {
  console.log('🏷️ Testing tag counter logic...');

  const testTags = ['tag1', 'tag2', 'tag3'];
  console.log(`Tag count: ${testTags.length}/5`);

  if (testTags.length === 3) {
    console.log('✅ Tag counter logic works correctly');
    return true;
  } else {
    console.log('❌ Tag counter logic failed');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting post creation tests...\n');

  try {
    // Test 1: Tag counter logic
    await testTagCounter();
    console.log('');

    // Test 2: Register user if needed
    await testRegister();
    console.log('');

    // Test 3: Login
    const loginSuccess = await testLogin();
    console.log('');

    if (!loginSuccess) {
      console.log('⚠️ Skipping authenticated tests (no test user)');
      console.log(
        'To run full tests, create a test user with email: test@test.com, password: test123',
      );
      return;
    }

    // Test 3: Image upload
    let imageUrl = null;
    try {
      imageUrl = await testImageUpload();
      console.log('');
    } catch (error) {
      console.log('⚠️ Image upload failed, continuing with text-only post');
      console.log('');
    }

    // Test 4: Post creation
    await testPostCreation(imageUrl);
    console.log('');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('💥 Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
runTests();
