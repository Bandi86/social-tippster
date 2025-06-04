/**
 * Test script for notification snoozing and pagination features
 * Run with: node tests/notification-snooze-test.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
let authToken = null;
let currentUser = null;

// Test credentials
const TEST_USER = {
  email: 'testadmin@test.com',
  password: 'password123',
};

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message);
    return { response: null, data: null };
  }
}

async function authenticate() {
  console.log('🔐 Testing authentication...');

  const { response, data } = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_USER),
  });

  if (response && response.ok && data.access_token) {
    authToken = data.access_token;
    currentUser = data.user; // Store user data for later use
    console.log('✅ Authentication successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${currentUser.user_id}`);
    return true;
  } else {
    console.log('❌ Authentication failed');
    console.log('   Response:', data);
    return false;
  }
}

async function createTestNotification() {
  console.log('\n📝 Creating test notification...');

  if (!currentUser) {
    console.log('❌ No user data available');
    return null;
  }

  const notificationData = {
    user_id: currentUser.user_id,
    type: 'info',
    title: 'Test Notification for Snoozing',
    content: 'This is a test notification to test snoozing functionality',
  };

  const { response, data } = await makeRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });

  if (response && response.ok) {
    console.log('✅ Test notification created');
    console.log(`   ID: ${data.notification_id}`);
    return data;
  } else {
    console.log('❌ Failed to create test notification');
    console.log('   Response:', data);
    return null;
  }
}

async function testPaginatedNotifications() {
  console.log('\n📄 Testing paginated notifications...');

  const { response, data } = await makeRequest(
    '/notifications/paginated?limit=5&offset=0&includeSnoozed=false',
  );

  if (response && response.ok) {
    console.log('✅ Paginated notifications retrieved');
    console.log(`   Total notifications: ${data.total || 'unknown'}`);
    console.log(
      `   Current page count: ${data.notifications ? data.notifications.length : 'unknown'}`,
    );
    return data;
  } else {
    console.log('❌ Failed to get paginated notifications');
    console.log('   Response:', data);
    return null;
  }
}

async function testSnoozeNotification(notificationId) {
  console.log('\n⏰ Testing notification snoozing...');

  // Snooze for 1 hour from now
  const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { response, data } = await makeRequest(`/notifications/${notificationId}/snooze`, {
    method: 'PATCH',
    body: JSON.stringify({
      snoozed_until: snoozeUntil,
    }),
  });

  if (response && response.ok) {
    console.log('✅ Notification snoozed successfully');
    console.log(`   Snoozed until: ${snoozeUntil}`);
    return data;
  } else {
    console.log('❌ Failed to snooze notification');
    console.log('   Response:', data);
    return null;
  }
}

async function testBulkSnooze(notificationIds) {
  console.log('\n⏰ Testing bulk notification snoozing...');

  // Snooze for 4 hours from now
  const snoozeUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const { response, data } = await makeRequest('/notifications/bulk/snooze', {
    method: 'PATCH',
    body: JSON.stringify({
      ids: notificationIds,
      snoozed_until: snoozeUntil,
    }),
  });

  if (response && response.ok) {
    console.log('✅ Bulk snooze successful');
    console.log(`   Snoozed ${notificationIds.length} notifications until: ${snoozeUntil}`);
    return data;
  } else {
    console.log('❌ Failed to bulk snooze notifications');
    console.log('   Response:', data);
    return null;
  }
}

async function testPaginatedWithSnoozed() {
  console.log('\n📄 Testing paginated notifications with snoozed included...');

  const { response, data } = await makeRequest(
    '/notifications/paginated?limit=10&offset=0&includeSnoozed=true',
  );

  if (response && response.ok) {
    console.log('✅ Paginated notifications with snoozed retrieved');
    console.log(`   Total notifications: ${data.total || 'unknown'}`);
    const snoozedCount = data.notifications
      ? data.notifications.filter(n => n.snoozed_until && new Date(n.snoozed_until) > new Date())
          .length
      : 0;
    console.log(`   Snoozed notifications: ${snoozedCount}`);
    return data;
  } else {
    console.log('❌ Failed to get paginated notifications with snoozed');
    console.log('   Response:', data);
    return null;
  }
}

async function getAllNotifications() {
  console.log('\n📋 Getting all notifications...');

  const { response, data } = await makeRequest('/notifications');

  if (response && response.ok) {
    console.log('✅ All notifications retrieved');
    console.log(`   Total notifications: ${data.length}`);
    return data;
  } else {
    console.log('❌ Failed to get all notifications');
    console.log('   Response:', data);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting notification snoozing and pagination tests...\n');

  // 1. Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  // 2. Get all notifications first
  const allNotifications = await getAllNotifications();

  // 3. Test paginated notifications
  const paginatedNotifications = await testPaginatedNotifications();

  // 4. Create a test notification
  const testNotification = await createTestNotification();

  if (testNotification) {
    // 5. Test single notification snoozing
    await testSnoozeNotification(testNotification.notification_id);

    // 6. Test bulk snoozing if we have the test notification
    await testBulkSnooze([testNotification.notification_id]);
  }

  // 7. Test paginated notifications with snoozed included
  await testPaginatedWithSnoozed();

  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests();
