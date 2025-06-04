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

## Image Upload API (2025-06-04)

### New Endpoints

- `POST /api/uploads/profile` – Upload profile avatar images
- `POST /api/uploads/post` – Upload post images

### File Upload Specifications

- **Accepted formats:** JPEG, JPG, PNG only
- **Maximum file size:** 5MB
- **Content-Type:** `multipart/form-data`
- **Form field name:** `file`

### Request Example

```http
POST /api/uploads/profile
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary--
```

### Response Format

```json
{
  "url": "/uploads/profile/1733316754321-987654321.jpg",
  "error": null
}
```

#### Error Response

```json
{
  "url": "",
  "error": "Invalid file upload"
}
```

### File Storage Structure

- **Profile images:** `./uploads/profile/`
- **Post images:** `./uploads/posts/`
- **File naming:** `{timestamp}-{random}.{extension}`
- **Access:** Static serving at `/uploads/*` routes

### Implementation Details

- **Module:** `UploadsModule` with Multer integration
- **Service:** `UploadsService` for path and filename utilities
- **Controller:** `UploadsController` with validation and error handling
- **Security:** File type validation via mimetype checking
- **TypeScript:** Fully type-safe implementation with proper error handling

### Usage Notes

- Files are stored on local filesystem
- Unique filenames prevent conflicts
- Automatic directory creation ensures upload paths exist
- Consider cloud storage for production deployment

## See Also

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [BACKEND_PROGRESS.md](./BACKEND_PROGRESS.md)

---

**Implemented by Copilot, 2025-06-01**
