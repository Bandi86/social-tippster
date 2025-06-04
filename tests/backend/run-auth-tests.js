/**
 * Authentication Test Suite Runner
 *
 * This script runs all authentication-related tests in the correct order
 * and provides comprehensive reporting.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test categories and their descriptions
const testSuites = {
  backend: {
    name: 'Backend Authentication Tests',
    description: 'API endpoint testing, security, and edge cases',
    files: [
      'tests/backend/auth-comprehensive.spec.ts',
      'tests/backend/auth-security-edge-cases.spec.ts',
      'tests/backend/auth-performance.spec.ts',
      'tests/backend/auth-verification.spec.ts',
    ],
  },
  frontend: {
    name: 'Frontend Authentication Tests',
    description: 'UI integration, auth store, and user interactions',
    files: [
      'tests/frontend/auth-store-comprehensive.spec.ts',
      'tests/frontend/auth-ui-integration.spec.ts',
      'tests/frontend/frontend-auth-test.spec.ts',
    ],
  },
  e2e: {
    name: 'End-to-End Authentication Tests',
    description: 'Complete user flows and integration testing',
    files: [
      'tests/examples/complete-auth-e2e-flow.spec.ts',
      'tests/examples/complete-auth-flow.spec.ts',
    ],
  },
};

// Helper functions
function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

function logSubSection(title) {
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`📋 ${title}`);
  console.log(`${'─'.repeat(40)}\n`);
}

function runCommand(command, description) {
  console.log(`🚀 ${description}...`);
  try {
    const output = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    console.log(`✅ ${description} completed successfully\n`);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

function generateTestReport(results) {
  const reportPath = 'tests/auth-test-report.md';
  const timestamp = new Date().toISOString();

  let report = `# Authentication Test Suite Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;

  report += `## Test Summary\n\n`;

  let totalTests = 0;
  let passedSuites = 0;

  Object.keys(testSuites).forEach(category => {
    const suite = testSuites[category];
    const result = results[category];

    report += `### ${suite.name}\n`;
    report += `**Description:** ${suite.description}\n\n`;

    if (result && result.success) {
      report += `**Status:** ✅ PASSED\n`;
      passedSuites++;
    } else {
      report += `**Status:** ❌ FAILED\n`;
      if (result && result.error) {
        report += `**Error:** ${result.error}\n`;
      }
    }

    report += `**Files:**\n`;
    suite.files.forEach(file => {
      const exists = checkFileExists(file);
      report += `- ${file} ${exists ? '✅' : '❌'}\n`;
      if (exists) totalTests++;
    });

    report += `\n`;
  });

  report += `## Overall Results\n\n`;
  report += `- **Test Suites:** ${passedSuites}/${Object.keys(testSuites).length} passed\n`;
  report += `- **Test Files:** ${totalTests} total files\n`;
  report += `- **Success Rate:** ${((passedSuites / Object.keys(testSuites).length) * 100).toFixed(1)}%\n\n`;

  report += `## Next Steps\n\n`;
  if (passedSuites === Object.keys(testSuites).length) {
    report += `🎉 All test suites passed! Your authentication system is well-tested.\n\n`;
    report += `**Recommendations:**\n`;
    report += `- Schedule regular test runs in CI/CD pipeline\n`;
    report += `- Monitor performance metrics over time\n`;
    report += `- Add integration tests as new features are developed\n`;
  } else {
    report += `⚠️ Some test suites failed. Please review the errors above.\n\n`;
    report += `**Recommendations:**\n`;
    report += `- Fix failing tests before deployment\n`;
    report += `- Review error logs for specific issues\n`;
    report += `- Ensure test environment is properly configured\n`;
  }

  fs.writeFileSync(reportPath, report);
  console.log(`📊 Test report generated: ${reportPath}`);
}

async function main() {
  logSection('Authentication Test Suite Runner');

  console.log('This script will run comprehensive authentication tests covering:');
  console.log('• Backend API endpoints and security');
  console.log('• Frontend authentication store and UI');
  console.log('• End-to-end user authentication flows');
  console.log('• Performance and edge case scenarios\n');

  // Check if Playwright is installed
  console.log('🔍 Checking test environment...');

  const packageJsonPath = 'package.json';
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Please run from project root.');
    process.exit(1);
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasPlaywright =
      packageJson.devDependencies && packageJson.devDependencies['@playwright/test'];

    if (!hasPlaywright) {
      console.log('⚠️ Playwright not found in devDependencies. Installing...');
      runCommand('npm install --save-dev @playwright/test', 'Installing Playwright');
      runCommand('npx playwright install', 'Installing browser binaries');
    } else {
      console.log('✅ Playwright found in dependencies');
    }
  } catch (error) {
    console.error('❌ Error checking dependencies:', error.message);
  }

  // Check if development server is running
  console.log('🌐 Checking if development servers are running...');
  console.log('ℹ️ Make sure to run "npm run dev" in another terminal before running tests');
  console.log('ℹ️ Frontend should be at http://localhost:3000');
  console.log('ℹ️ Backend should be at http://localhost:3001\n');

  // Validate test files exist
  logSubSection('Validating Test Files');

  let allFilesExist = true;
  Object.keys(testSuites).forEach(category => {
    const suite = testSuites[category];
    console.log(`📁 ${suite.name}:`);

    suite.files.forEach(file => {
      const exists = checkFileExists(file);
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
      if (!exists) allFilesExist = false;
    });
    console.log();
  });

  if (!allFilesExist) {
    console.error('❌ Some test files are missing. Please ensure all test files are created.');
    process.exit(1);
  }

  // Run test suites
  const results = {};

  for (const [category, suite] of Object.entries(testSuites)) {
    logSubSection(`Running ${suite.name}`);

    // Run tests for this category
    const testFiles = suite.files.filter(file => checkFileExists(file));

    if (testFiles.length === 0) {
      console.log(`⚠️ No test files found for ${suite.name}`);
      results[category] = { success: false, error: 'No test files found' };
      continue;
    }

    // Run Playwright tests for this category
    const testPattern = testFiles.join(' ');
    const command = `npx playwright test ${testPattern} --reporter=line`;

    const result = runCommand(command, `Running ${suite.name}`);
    results[category] = result;

    if (result.success) {
      console.log(`✅ ${suite.name} completed successfully\n`);
    } else {
      console.log(`❌ ${suite.name} failed. Check output above for details.\n`);
    }
  }

  // Generate summary report
  logSection('Test Results Summary');

  Object.keys(testSuites).forEach(category => {
    const suite = testSuites[category];
    const result = results[category];

    const status = result && result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} ${suite.name}`);
  });

  // Generate detailed report
  generateTestReport(results);

  logSection('Authentication Test Suite Complete');

  const passedSuites = Object.values(results).filter(r => r && r.success).length;
  const totalSuites = Object.keys(testSuites).length;

  console.log(`📊 Results: ${passedSuites}/${totalSuites} test suites passed`);

  if (passedSuites === totalSuites) {
    console.log('🎉 All authentication tests passed! Your system is ready for production.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please review the errors and fix issues before deployment.');
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { testSuites, runCommand };
