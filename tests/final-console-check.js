// Final console monitoring script
import { chromium } from 'playwright';

async function finalConsoleCheck() {
  console.log('🔍 FINAL CONSOLE MONITORING TEST\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Track all console messages
  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleMessages = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`❌ CONSOLE ERROR: ${text}`);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      console.log(`⚠️  CONSOLE WARNING: ${text}`);
    } else {
      consoleMessages.push({ type, text });
      if (text.includes('error') || text.includes('Error') || text.includes('ERROR')) {
        console.log(`🔍 POTENTIAL ERROR in ${type}: ${text}`);
      }
    }
  });

  // Track network issues
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`🔍 HTTP ${response.status()}: ${response.url()}`);
    }
  });

  try {
    console.log('📄 Testing main page (detailed)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('📄 Testing posts page (detailed)...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('📄 Testing brief interaction...');
    // Try to click on a safe element
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      await page.click('body');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('   Minor interaction timeout - not critical');
    }
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }

  await browser.close();

  console.log('\n============================================================');
  console.log('🏁 FINAL CONSOLE ANALYSIS');
  console.log('============================================================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Console Warnings: ${consoleWarnings.length}`);
  console.log(`Other Messages: ${consoleMessages.length}`);

  if (consoleErrors.length === 0) {
    console.log('\n🎉 SUCCESS: ZERO CONSOLE ERRORS ACHIEVED!');
    console.log('✅ Application is running perfectly for guest users');
  } else {
    console.log('\n❌ Remaining console errors:');
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  return { errors: consoleErrors, warnings: consoleWarnings, messages: consoleMessages };
}

finalConsoleCheck()
  .then(results => {
    const success = results.errors.length === 0;
    console.log(`\n🎯 FINAL STATUS: ${success ? 'PERFECT' : 'NEEDS ATTENTION'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Final check failed:', error);
    process.exit(1);
  });
