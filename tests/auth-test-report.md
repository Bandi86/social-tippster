# Authentication Test Suite Report

**Generated:** 2025-06-03T11:18:21.161Z

## Test Summary

### Backend Authentication Tests
**Description:** API endpoint testing, security, and edge cases

**Status:** ❌ FAILED
**Error:** Command failed: npx playwright test tests/backend/auth-comprehensive.spec.ts tests/backend/auth-security-edge-cases.spec.ts tests/backend/auth-performance.spec.ts tests/backend/auth-verification.spec.ts --reporter=line
**Files:**
- tests/backend/auth-comprehensive.spec.ts ✅
- tests/backend/auth-security-edge-cases.spec.ts ✅
- tests/backend/auth-performance.spec.ts ✅
- tests/backend/auth-verification.spec.ts ✅

### Frontend Authentication Tests
**Description:** UI integration, auth store, and user interactions

**Status:** ❌ FAILED
**Error:** Command failed: npx playwright test tests/frontend/auth-store-comprehensive.spec.ts tests/frontend/auth-ui-integration.spec.ts tests/frontend/frontend-auth-test.spec.ts --reporter=line
**Files:**
- tests/frontend/auth-store-comprehensive.spec.ts ✅
- tests/frontend/auth-ui-integration.spec.ts ✅
- tests/frontend/frontend-auth-test.spec.ts ✅

### End-to-End Authentication Tests
**Description:** Complete user flows and integration testing

**Status:** ❌ FAILED
**Error:** Command failed: npx playwright test tests/examples/complete-auth-e2e-flow.spec.ts tests/examples/complete-auth-flow.spec.ts --reporter=line
**Files:**
- tests/examples/complete-auth-e2e-flow.spec.ts ✅
- tests/examples/complete-auth-flow.spec.ts ✅

## Overall Results

- **Test Suites:** 0/3 passed
- **Test Files:** 9 total files
- **Success Rate:** 0.0%

## Next Steps

⚠️ Some test suites failed. Please review the errors above.

**Recommendations:**
- Fix failing tests before deployment
- Review error logs for specific issues
- Ensure test environment is properly configured
