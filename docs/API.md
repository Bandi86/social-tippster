# Notification API Endpoints (2025-05-30)

## WebSocket Notification Payload Structure (2025-05-30)

All real-time notification events sent via WebSocket use the following standardized payload:

```json
{
  "type": "new_notification", // or other event type
  "notification": {
    /* Notification object, see below or null */
  },
  "meta": {
    /* Optional metadata, or null */
  },
  "timestamp": "2025-05-30T12:00:00Z"
}
```

- `type` (string): Event type, e.g. `new_notification`, `notification_read`, etc.
- `notification` (object|null): The notification object (see REST response), or null.
- `meta` (object|null): Optional metadata for extensibility (e.g. batch info, admin context).
- `timestamp` (string): ISO timestamp when the event was sent.

This structure is enforced on both backend and frontend for all notification WebSocket events.

## Endpoints

- `POST /notifications` – Új értesítés létrehozása
- `GET /notifications?user_id=...` – Felhasználó összes értesítése (legújabb elöl)
- `GET /notifications/:id` – Egy értesítés lekérdezése
- `PATCH /notifications/:id` – Értesítés frissítése
- `PATCH /notifications/:id/read` – Értesítés olvasottra állítása
- `DELETE /notifications/:id` – Értesítés törlése
- `PATCH /notifications/mark-all-read?user_id=...` – Összes nem olvasott értesítés olvasottra állítása
- `POST /posts/:id/view` – Poszt megtekintésének követése

## DTO-k

- `CreateNotificationDto` – kötelező mezők: user_id, type, title, content
- `UpdateNotificationDto` – bármely mező frissíthető

## Példa válasz

```json
{
  "notification_id": "uuid",
  "user_id": "uuid",
  "type": "comment",
  "title": "Új komment érkezett!",
  "content": "Valaki hozzászólt a tippedhez.",
  "created_at": "2025-05-30T12:00:00Z",
  "updated_at": "2025-05-30T12:00:00Z",
  "read_at": null,
  "read_status": false,
  "related_post_id": "uuid",
  "related_comment_id": null,
  "related_user_id": null,
  "action_url": "/posts/123",
  "priority": "low"
}
```

## NotificationType enum bővítve:

- `post_liked` – ha valaki like-olja a posztod
- `post_shared` – ha valaki megosztja a posztod
- `new_follower` – ha új követőd lesz

## Jogosultság

- Csak saját értesítések érhetők el (user_id alapján)
- Admin jogosultság szükséges más user értesítéseinek lekérdezéséhez

---

## POST /posts/:id/view

Track a view for a post. Increments the post's views_count and creates a PostView entity.

- **Method:** POST
- **URL:** /posts/:id/view
- **Auth:** Optional (works for anonymous and authenticated users)
- **Request Body:** None
- **Response:** `{ success: true }` on success, 404 if post not found
- **Status Codes:** 201 (created), 404 (not found)

**Example:**

```
POST /posts/81f94b95-c9fb-499a-a156-5065407caa62/view
Response: { "success": true }
```

Utolsó frissítés: 2025-05-30

---

## Admin Comments API (2025-05-31)

### Endpoints

- `GET /admin/comments` – List all comments for admin with filtering, sorting, and pagination
- `GET /admin/comments/stats` – Get comment statistics for admin dashboard
- `GET /admin/comments/:id` – Get a specific comment by ID (admin view)
- `POST /admin/comments/:id/flag` – Flag a comment (admin moderation)
- `POST /admin/comments/:id/unflag` – Unflag a comment (admin moderation)
- `POST /admin/comments/bulk-action` – Bulk actions on comments (delete, flag, etc.)

### Query Parameters for `/admin/comments`

- `page`, `limit`, `search`, `status`, `postId`, `authorId`, `sortBy`

### Response DTOs

- `CommentResponseDto` (see backend)
- `CommentStatsDto` (see backend)

### Frontend Integration

- Zustand comments store now uses these endpoints for all admin comment management
- Data transformation is handled in the store for admin UI compatibility

_Last updated: 2025-05-31_
