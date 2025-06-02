# TESTING

## Test File Organization (as of 2025-06-01)

- All test files are located in the root `tests/` folder, with subfolders for backend, frontend, and examples.
- No test files are present in the root of `frontend/` or `backend/` directories.
- Test images and reports are stored in `tests/images/` and `tests/playwright-report/` respectively.
- This organization ensures clarity, maintainability, and compliance with project standards.

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
