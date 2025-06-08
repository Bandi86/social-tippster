// Detailed debugging script to identify the exact URLs causing 500 errors
import { chromium } from 'playwright';

async function debug500Errors() {
  console.log('🔍 Starting detailed 500 error debugging...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors500 = [];

  // Track all network responses
  page.on('response', async response => {
    if (response.status() === 500) {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();

      console.log(`🚨 500 Error detected: ${url}`);
      console.log(`   Status: ${status}`);
      console.log(`   Headers:`, headers);

      try {
        const responseBody = await response.text();
        console.log(`   Response Body:`, responseBody.substring(0, 300));
      } catch (e) {
        console.log(`   Could not read response body: ${e.message}`);
      }

      errors500.push({ url, status, headers, timestamp: new Date() });
    }
  });

  // Track request failures
  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()}`);
    console.log(`   Failure: ${request.failure()?.errorText}`);
  });

  // Track all requests to see patterns
  const allRequests = [];
  page.on('request', request => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
    });
  });

  try {
    console.log('📄 Testing main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Wait longer to catch delayed requests

    console.log('📄 Testing posts page...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }

  console.log('\n📊 ANALYSIS:');
  console.log(`Total 500 errors: ${errors500.length}`);

  if (errors500.length > 0) {
    console.log('\n🚨 500 Error Details:');
    errors500.forEach((error, index) => {
      console.log(`${index + 1}. URL: ${error.url}`);
      console.log(`   Time: ${error.timestamp.toISOString()}`);
      console.log('');
    });
  }

  // Look for image-related requests
  const imageRequests = allRequests.filter(
    req =>
      req.resourceType === 'image' ||
      req.url.includes('_next/image') ||
      req.url.includes('placeholder') ||
      req.url.includes('.png') ||
      req.url.includes('.jpg') ||
      req.url.includes('.jpeg'),
  );

  if (imageRequests.length > 0) {
    console.log('\n🖼️ Image-related requests:');
    imageRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url} (${req.resourceType})`);
    });
  }

  await browser.close();
}

debug500Errors().catch(console.error);
