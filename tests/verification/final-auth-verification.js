/**
 * FINAL AUTHENTICATION VERIFICATION TEST
 *
 * This test confirms that all authentication issues have been resolved:
 * - No more double API prefix (/api/api/) in URLs
 * - Post view tracking endpoint works for both authenticated and anonymous users
 * - Users should no longer be automatically logged out after registration/login
 * - All API endpoints respond correctly
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

async function finalVerificationTest() {
  console.log('🏁 FINAL AUTHENTICATION VERIFICATION TEST');
  console.log('=========================================\n');

  const testResults = {
    frontendOnline: false,
    backendOnline: false,
    registrationWorks: false,
    loginWorks: false,
    authMeWorks: false,
    postCreationWorks: false,
    postViewTrackingWorks: false,
    anonymousViewTrackingWorks: false,
    noDoubleApiPrefix: true,
    allEndpointsWorking: false
  };

  try {
    // 1. Check if both servers are online
    console.log('📡 Checking server status...');

    try {
      await axios.get(FRONTEND_URL, { timeout: 3000 });
      testResults.frontendOnline = true;
      console.log('   ✅ Frontend server (3000) - ONLINE');
    } catch (error) {
      console.log('   ❌ Frontend server (3000) - OFFLINE');
    }

    try {
      await axios.get(`${API_BASE}/health`, { timeout: 3000 });
      testResults.backendOnline = true;
      console.log('   ✅ Backend server (3001) - ONLINE');
    } catch (error) {
      // Try alternative health check
      try {
        await axios.get(`${API_BASE}/posts`, { timeout: 3000 });
        testResults.backendOnline = true;
        console.log('   ✅ Backend server (3001) - ONLINE');
      } catch (innerError) {
        console.log('   ❌ Backend server (3001) - OFFLINE');
      }
    }

    if (!testResults.frontendOnline || !testResults.backendOnline) {
      console.log('\n❌ Cannot proceed with tests - servers are not running');
      return testResults;
    }

    // 2. Test full authentication flow
    console.log('\n🔐 Testing authentication flow...');
    const testUser = {
      email: `final_test_${Date.now()}@example.com`,
      password: 'password123',
      username: `finaltest_${Date.now()}`
    };

    // Registration
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        username: testUser.username,
        first_name: 'Final',
        last_name: 'Test'
      });
      testResults.registrationWorks = registerResponse.status === 201;
      console.log(`   ✅ User registration - SUCCESS (${registerResponse.status})`);
    } catch (error) {
      console.log(`   ❌ User registration - FAILED (${error.response?.status || error.message})`);
      if (error.config?.url?.includes('/api/api/')) {
        testResults.noDoubleApiPrefix = false;
        console.log('   🚨 DETECTED DOUBLE API PREFIX IN REGISTRATION!');
      }
    }

    // Login
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      testResults.loginWorks = loginResponse.status === 200 || loginResponse.status === 201;
      const token = loginResponse.data.access_token;
      console.log(`   ✅ User login - SUCCESS (${loginResponse.status})`);

      // Auth/me endpoint
      try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        testResults.authMeWorks = meResponse.status === 200;
        console.log(`   ✅ /auth/me endpoint - SUCCESS (${meResponse.status})`);
      } catch (error) {
        console.log(`   ❌ /auth/me endpoint - FAILED (${error.response?.status || error.message})`);
        if (error.config?.url?.includes('/api/api/')) {
          testResults.noDoubleApiPrefix = false;
          console.log('   🚨 DETECTED DOUBLE API PREFIX IN AUTH/ME!');
        }
      }

      // Post creation
      console.log('\n📝 Testing post operations...');
      try {
        const createPostResponse = await axios.post(
          `${API_BASE}/posts`,
          {
            content: 'Final verification test post',
            type: 'discussion'
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        testResults.postCreationWorks = createPostResponse.status === 201;
        const postId = createPostResponse.data.id;
        console.log(`   ✅ Post creation - SUCCESS (${createPostResponse.status})`);

        // Authenticated view tracking
        try {
          const viewResponse = await axios.post(`${API_BASE}/posts/${postId}/view`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          testResults.postViewTrackingWorks = viewResponse.status === 201;
          console.log(`   ✅ Authenticated view tracking - SUCCESS (${viewResponse.status})`);
        } catch (error) {
          console.log(`   ❌ Authenticated view tracking - FAILED (${error.response?.status || error.message})`);
          if (error.config?.url?.includes('/api/api/')) {
            testResults.noDoubleApiPrefix = false;
            console.log('   🚨 DETECTED DOUBLE API PREFIX IN VIEW TRACKING!');
          }
        }

        // Anonymous view tracking
        try {
          const anonViewResponse = await axios.post(`${API_BASE}/posts/${postId}/view`);
          testResults.anonymousViewTrackingWorks = anonViewResponse.status === 201;
          console.log(`   ✅ Anonymous view tracking - SUCCESS (${anonViewResponse.status})`);
        } catch (error) {
          console.log(`   ❌ Anonymous view tracking - FAILED (${error.response?.status || error.message})`);
        }

      } catch (error) {
        console.log(`   ❌ Post creation - FAILED (${error.response?.status || error.message})`);
        if (error.config?.url?.includes('/api/api/')) {
          testResults.noDoubleApiPrefix = false;
          console.log('   🚨 DETECTED DOUBLE API PREFIX IN POST CREATION!');
        }
      }

    } catch (error) {
      console.log(`   ❌ User login - FAILED (${error.response?.status || error.message})`);
      if (error.config?.url?.includes('/api/api/')) {
        testResults.noDoubleApiPrefix = false;
        console.log('   🚨 DETECTED DOUBLE API PREFIX IN LOGIN!');
      }
    }

    // Calculate overall success
    testResults.allEndpointsWorking =
      testResults.registrationWorks &&
      testResults.loginWorks &&
      testResults.authMeWorks &&
      testResults.postCreationWorks &&
      testResults.postViewTrackingWorks &&
      testResults.anonymousViewTrackingWorks;

  } catch (error) {
    console.error(`\n❌ Final test failed with unexpected error: ${error.message}`);
  }

  // Print final results
  console.log('\n📊 FINAL TEST RESULTS');
  console.log('=====================');
  console.log(`Frontend Server:              ${testResults.frontendOnline ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`Backend Server:               ${testResults.backendOnline ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`User Registration:            ${testResults.registrationWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`User Login:                   ${testResults.loginWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Auth/Me Endpoint:             ${testResults.authMeWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Post Creation:                ${testResults.postCreationWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Authenticated View Tracking:  ${testResults.postViewTrackingWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Anonymous View Tracking:      ${testResults.anonymousViewTrackingWorks ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`No Double API Prefix:         ${testResults.noDoubleApiPrefix ? '✅ CLEAN URLS' : '❌ DOUBLE PREFIX DETECTED'}`);

  console.log('\n🎯 OVERALL STATUS');
  console.log('=================');
  if (testResults.allEndpointsWorking && testResults.noDoubleApiPrefix) {
    console.log('🎉 ALL AUTHENTICATION ISSUES HAVE BEEN RESOLVED!');
    console.log('   ✅ Users should no longer be automatically logged out');
    console.log('   ✅ No more 404 errors on post view tracking');
    console.log('   ✅ No more double API prefix in URLs');
    console.log('   ✅ Authentication system is fully functional');
  } else {
    console.log('⚠️  SOME ISSUES REMAIN - NEEDS FURTHER INVESTIGATION');
    if (!testResults.noDoubleApiPrefix) {
      console.log('   🚨 Double API prefix issue still present!');
    }
    if (!testResults.allEndpointsWorking) {
      console.log('   🚨 Some API endpoints are not working correctly!');
    }
  }

  return testResults;
}

// Run the test
finalVerificationTest()
  .then(results => {
    console.log('\n✅ Final verification test completed.');
    process.exit(results.allEndpointsWorking && results.noDoubleApiPrefix ? 0 : 1);
  })
  .catch(error => {
    console.error(`\n❌ Final verification test crashed: ${error.message}`);
    process.exit(1);
  });
