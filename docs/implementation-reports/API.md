# API Changes – User Login System (June 2025)

**Last updated:** 2025-06-01

## New Endpoints

### User Login History

- `GET /users/login-history`
  Returns the current user's login history (last 100 entries).
- `GET /users/login-history/export`
  Exports the current user's login history as a CSV file.

### Admin Session Management (2025-06-01)

- `GET /admin/analytics/sessions`
  List all user sessions (admin only).
- `GET /admin/analytics/sessions/:userId`
  List all sessions for a specific user (admin only).
- `POST /admin/analytics/sessions/:sessionId/force-logout`
  Force logout a specific session (admin only).
- `POST /admin/analytics/sessions/invalidate-all/:userId`
  Invalidate all sessions for a user (admin only).

## Notification Preferences API (2025-06-03)

### New Endpoints

- `GET /users/me/notification-preferences` – Get current user's notification preferences
- `PUT /users/me/notification-preferences` – Update current user's notification preferences (partial or full)
- `POST /users/me/notification-preferences/reset` – Reset preferences to default values

### Data Model

- `user_settings` table: stores per-user notification preferences as JSONB
- Entity: `UserSettings` (TypeORM)
- DTOs: `NotificationPreferencesDto`, `UpdateNotificationPreferencesDto`

### Usage Example

```http
GET /users/me/notification-preferences
Authorization: Bearer <token>

Response:
{
  "notification_preferences": {
    "comment": { "in_app": true, "email": false, "push": false },
    "mention": { "in_app": true, "email": true, "push": false },
    "follow": { "in_app": true, "email": false, "push": false }
  }
}
```

### Notes

- All endpoints require authentication.
- Preferences are merged with sensible defaults if not set.
- See `tests/backend/test-notification-preferences.js` for full test coverage.

## Data Model Changes

- `user_logins` table:
  - Added `failure_reason` (text, nullable)
  - Added `session_start` (timestamp, nullable)
  - Added `session_end` (timestamp, nullable)
- `user_sessions` table:
  - New entity for tracking active and historical sessions
  - Linked to user, includes metadata (IP, device, etc.)

## Security & Monitoring

- Backend detects suspicious login activity (5+ failed logins in 1 hour).
- Data retention logic for old login records (default: 1 year).
- Admins can now view and manage user sessions for security and compliance.

# API Changes – Tipps Module & Image Upload Refactor (2025-06-04)

## Tipps Module Endpoints

- `POST /tipps`: Create a new tip
- `GET /tipps`: Get all tips with filtering and pagination
- `GET /tipps/my-performance`: Get user tip performance statistics
- `GET /tipps/leaderboard`: Get tips leaderboard
- `GET /tipps/statistics`: Get overall tip statistics
- `POST /tipps/validate`: Validate a tip before creation
- `POST /tipps/check-deadline`: Check submission deadlines for tips
- `POST /tipps/:id/result`: Set tip result
- `GET /tipps/:id`: Get a specific tip by ID

## Tipps Module Details

- All tip-related logic is now handled by the tipps module, not the posts module.
- Validation, business rules, and endpoints for tips are self-contained in the tipps module.
- See `docs/implementation-reports/TIPPS_MODULE_REFACTORING.md` for technical details.

## Image Upload & Analysis Refactor

- `POST /api/uploads/profile` – Upload profile avatar images
- `POST /api/uploads/post` – Upload post images
- All advanced image analysis (OCR, tip extraction) is now handled by `image-analysis/image-processing.service.ts`.
- The uploads module only handles file storage and validation.

## File Upload Specifications

- **Accepted formats:** JPEG, JPG, PNG only
- **Maximum file size:** 5MB
- **Content-Type:** `multipart/form-data`
- **Form field name:** `file`

## Response Format

```json
{
  "url": "/uploads/profile/1733316754321-987654321.jpg",
  "error": null
}
```

## Status

- All endpoints are production-ready and type-safe.
- Backend builds and runs successfully.

_Last updated: 2025-06-04 by GitHub Copilot_

---

**Implemented by Copilot, 2025-06-01**
