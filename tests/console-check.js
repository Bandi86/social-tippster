// Console error check for guest users
import { chromium } from 'playwright';

async function checkConsoleErrors() {
  console.log('🚀 Starting console error check for guest users...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Track console messages
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });

    if (type === 'error') {
      errors.push(text);
      console.log(`❌ Console Error: ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  Console Warning: ${text}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`💥 Page Error: ${error.message}`);
  });

  try {
    // Test main page
    console.log('📄 Testing main page (/)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test posts page
    console.log('📄 Testing posts page...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test profile page (should redirect or show guest view)
    console.log('📄 Testing profile page...');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test navigation
    console.log('📄 Testing navigation...');
    await page.click('a[href="/"]');
    await page.waitForTimeout(1000);

    await page.click('a[href="/posts"]');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log(`❌ Navigation Error: ${error.message}`);
    errors.push(error.message);
  }

  await browser.close();

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`Total Console Messages: ${consoleMessages.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);

  if (errors.length === 0) {
    console.log('✅ No console errors found! Guest user experience is clean.');
  } else {
    console.log('❌ Console errors detected:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  return errors.length === 0;
}

checkConsoleErrors()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
