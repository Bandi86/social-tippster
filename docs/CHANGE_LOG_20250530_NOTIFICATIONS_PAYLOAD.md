# Change Log - 2025-05-30

## Notification WebSocket Payload Standardization (2025-05-30)

- Standardized the WebSocket notification payload structure for real-time notifications.
- Payload now always includes: `type`, `notification`, `meta`, `timestamp`.
- TypeScript interface `WebSocketNotificationPayload` added to both backend and frontend for type safety.
- Backend gateway and frontend WebSocket handler updated to use the new structure.
- Documentation updated in API.md and implement-notifications-to-frontend.md.

---
