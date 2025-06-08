// Enhanced console debugging with detailed error tracking
import { chromium } from 'playwright';

async function enhancedConsoleCheck() {
  console.log('🔍 Enhanced console debugging for detailed error analysis...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const detailedErrors = [];
  const networkErrors = [];

  // Enhanced console tracking
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      detailedErrors.push({
        type: 'console',
        message: text,
        timestamp: new Date().toISOString(),
      });
      console.log(`❌ Console Error: ${text}`);
    }
  });

  // Track network responses
  page.on('response', async response => {
    const status = response.status();
    const url = response.url();

    if (status >= 400) {
      const errorInfo = {
        type: 'network',
        status,
        url,
        timestamp: new Date().toISOString(),
      };

      networkErrors.push(errorInfo);
      console.log(`🌐 HTTP ${status}: ${url}`);

      // Try to get response body for 500 errors
      if (status >= 500) {
        try {
          const body = await response.text();
          errorInfo.body = body.substring(0, 500);
          console.log(`   Body: ${errorInfo.body}`);
        } catch (e) {
          console.log(`   Could not read response body`);
        }
      }
    }
  });

  page.on('pageerror', error => {
    detailedErrors.push({
      type: 'page',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    console.log(`💥 Page Error: ${error.message}`);
  });

  try {
    console.log('📄 Testing main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000); // Wait longer for all requests

    console.log('📄 Testing posts page...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  } catch (error) {
    console.log(`❌ Navigation Error: ${error.message}`);
  }

  await browser.close();

  console.log('\n📊 DETAILED ERROR ANALYSIS:');
  console.log(`Console Errors: ${detailedErrors.length}`);
  console.log(`Network Errors: ${networkErrors.length}`);

  if (networkErrors.length > 0) {
    console.log('\n🌐 Network Errors:');
    networkErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.status} - ${error.url}`);
      if (error.body) {
        console.log(`     Response: ${error.body}`);
      }
    });
  }

  if (detailedErrors.length > 0) {
    console.log('\n❌ Console Errors:');
    detailedErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.message}`);
    });
  }

  return { detailedErrors, networkErrors };
}

enhancedConsoleCheck()
  .then(results => {
    const hasErrors =
      results.detailedErrors.length > 0 ||
      results.networkErrors.filter(e => e.status >= 500).length > 0;
    process.exit(hasErrors ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
