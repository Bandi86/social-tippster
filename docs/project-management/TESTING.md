# TESTING

## Test File Organization (as of 2025-06-01)

- All test files are located in the root `tests/` folder, with subfolders for backend, frontend, and examples.
- No test files are present in the root of `frontend/` or `backend/` directories.
- Test images and reports are stored in `tests/images/` and `tests/playwright-report/` respectively.
- This organization ensures clarity, maintainability, and compliance with project standards.

## Authentication System Testing Status (Updated June 3, 2025)

### ✅ Core Authentication Testing - COMPLETED

- **JWT Strategy Testing**: Token validation flow verified after fixes
- **Refresh Token Testing**: Guard registration and strategy alignment confirmed
- **Session Lifecycle Testing**: Session cleanup and management validated
- **Token Rotation Testing**: Automatic rotation with grace periods verified
- **Security Monitoring Testing**: Sentry integration logging validated

### ✅ Critical Fixes Verification (June 3, 2025)

- **JWT User Lookup**: Fixed strategy validation with proper `usersService.findById()` calls
- **Guard Registration**: Verified consistent `'refresh-token'` naming across components
- **Session Integration**: Confirmed `SessionLifecycleService` integration with logout methods
- **Token Security**: Validated complete token rotation implementation
- **Error Tracking**: Sentry service integration tested and operational

### 🧪 Test Commands

```bash
# Authentication system tests
npm run test:auth:run

# Backend unit tests with coverage
npm test

# End-to-end authentication flows
npm run test:e2e

# Start backend in test mode
npm run start:test
```

### ⏳ Pending Test Updates

- Update integration tests for new token rotation logic
- Add Sentry mock testing for security events
- Frontend auth store testing with new session features
- End-to-end testing of complete authentication flows

## E2E Testing

- Playwright is used for end-to-end tests. Reports are in `tests/playwright-report/`.

## How to Run Tests

- Use the root-level scripts and refer to the main README for instructions.

## Backend User Login System Tests (2025-06-01)

- Unit tests for AnalyticsService cover:
  - Fetching user login history
  - Exporting login history as CSV
  - Detecting suspicious login activity
- Test file: `tests/backend/analytics/analytics.service.spec.ts`
- Ensure Jest and ts-jest are configured for backend TypeScript tests.

## Backend Session Management (2025-06-01)

- Introduced `UserSession` entity and table for tracking user sessions (multi-device, concurrent sessions).
- Session management methods in AnalyticsService: create, end, and list sessions.
- AuthService creates a session on login.
- Endpoint `/users/sessions` for users to view their sessions.
- Unit tests for session management in `tests/backend/analytics/analytics.session.spec.ts`.

### [2025-06-03] Registration Form Design Test

- Added Playwright test (`tests/frontend/register-form-design.spec.ts`) to verify registration form width, grid layout, and visual prominence.
- Test uses `data-testid` selectors for reliability.
- Test passes after layout fix in `frontend/app/auth/layout.tsx`.
- Screenshot output: `tests/images/register-form-design.png`.
