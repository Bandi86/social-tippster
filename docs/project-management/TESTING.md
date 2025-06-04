# TESTING

> **2025-06-04:**
>
> - Backend image upload (storage/validation) and image analysis (OCR, tip extraction) are now handled by separate modules.
> - All advanced image processing logic is in `backend/src/modules/image-analysis/image-processing.service.ts`.
> - The old `uploads/image-processing.service.ts` is deprecated and only provides basic file validation.
> - Tip-related functionality has been refactored into a dedicated tipps module.
> - A simple test for the tipps module endpoints is available at `tests/backend/test-tipps-module.js`.
> - Update or add tests accordingly.

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

### 🧪 Tipps Module Testing

The tipps module can be tested using the following command:

```bash
# Run the tipps module test
node tests/backend/test-tipps-module.js
```

This test verifies that the tipps module endpoints are working correctly. It checks:

- The `/tipps` endpoint for retrieving all tips
- The `/tipps/leaderboard` endpoint for retrieving the tips leaderboard

> **Note:** Before running any of the above test commands, ensure the backend server is already running on `localhost:3001` using `npm run dev`.

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

## Notification Preferences API Testing (2025-06-03)

### Backend API Test Coverage

- **Manual API Test Script**: `tests/backend/test-notification-preferences.js` validates all notification preferences endpoints (GET, PUT, POST reset) against a running backend server.
- **Integration Test**: `tests/backend/notification-preferences.integration.test.js` covers all API flows, but must be run when the main dev server is stopped to avoid port conflicts (see below).
- **Unit Test**: Service logic can be tested in isolation (see `user-settings.service.unit.test.js` if present).

### Test Execution Policy

- **While dev server is running**: Use the manual test script for live API validation.
- **For Jest integration tests**: Stop the main dev server before running, or configure tests to use a different port/in-memory DB.
- **Do not run integration tests in parallel with the main dev server** (per project policy).

### Endpoints Tested

- `GET /users/me/notification-preferences`
- `PUT /users/me/notification-preferences`
- `POST /users/me/notification-preferences/reset`

### Test Results (2025-06-03)

- All manual and API tests pass with expected results.
- Integration test startup will fail if port 3001 is in use (expected).
- See `CHANGE_LOG_20250603.md` for details.

### ✅ Tip Validation Service & Backend Tip System (2025-06-04)

- Implemented `TipValidationService` for deadline, odds, user history, and match existence validation logic (stubbed for now)
- Injected and used `TipValidationService` in `TipsService` for all tip validation
- Added/updated endpoints in `TipsController` for tip validation and deadline checking
- Created unit test: `tests/backend/tip-validation.service.spec.ts` for all validation logic
- All validation logic now separated and testable
- All endpoints from posts-todo-2025-06-04.md are now present
- TypeScript errors and async/await issues fixed
- Lint and formatting issues resolved
- All changes follow project file organization and documentation standards

# TESTING – Tipps Module & Image Upload Refactor (2025-06-04)

## Tipps Module Testing

- All tip-related endpoints are now tested via `tests/backend/test-tipps-module.js` and `tests/backend/tip-validation.service.spec.ts`.
- Tests cover creation, validation, statistics, leaderboard, and deadline logic for tips.
- All validation logic is now separated and testable in isolation.
- TypeScript errors and async/await issues fixed in all related test files.
- Lint and formatting issues resolved.

## Backend Image Upload & Analysis Testing

- Image upload endpoints (`/api/uploads/profile`, `/api/uploads/post`) are tested for file type, size, and error handling.
- Advanced image analysis (OCR, tip extraction) is tested via `image-analysis/image-processing.service.ts`.
- The uploads module is tested for file storage and validation only.

## Test Execution Policy

- Backend server must be started manually with `npm run dev` before running any backend or integration tests.
- Jest, integration, and E2E tests do **not** start or stop the backend server automatically.
- Do **not** rely on test scripts or Jest configuration to start/stop the server.
- This policy prevents port conflicts and ensures a stable test environment.

## Status

- All tests pass and follow project file organization and documentation standards.
- Backend builds and runs successfully.

_Last updated: 2025-06-04 by GitHub Copilot_
