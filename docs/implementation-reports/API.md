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

# API Changes – Posts & Tipps Refactor (2025-06-05)

**Last updated:** 2025-06-05

## Tipps Endpoints

- `POST /tipps`: Create a new tip
- `GET /tipps`: Get all tips with filtering and pagination
- `GET /tipps/my-performance`: Get user tip performance statistics
- `GET /tipps/leaderboard`: Get tips leaderboard
- `GET /tipps/statistics`: Get overall tip statistics
- `POST /tipps/validate`: Validate a tip before creation
- `POST /tipps/check-deadline`: Check submission deadlines for tips
- `POST /tipps/:id/result`: Set tip result
- `GET /tipps/:id`: Get a specific tip by ID

## Data Model Changes

- `posts.type` enum updated: removed legacy value `'tip'`, now only accepts `'general', 'discussion', 'analysis', 'help_request', 'news'`.
- All tip-related columns removed from `posts` table, now handled in `tipps` table.
- New `tipps` table created with all tip-specific fields and indexes.

## Migration Notes

- If you see `invalid input value for enum posts_type_enum: "tip"`, update all legacy values before running migration.
- See `docs/project-management/CHANGE_LOG_20250605.md` for full troubleshooting steps.

---

**Implemented by Copilot, 2025-06-01**
