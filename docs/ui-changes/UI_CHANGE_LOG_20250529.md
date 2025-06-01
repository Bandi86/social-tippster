# UI_CHANGE_LOG_20250529.md

## [2025-05-29] Database Seed Script

- Added `backend/src/database/seed.ts` to populate all main tables with sample data (users, posts, bookmarks, votes, shares, views, comments, comment votes, user logins, system metrics).
- Script is intended for local development and testing.
- Usage: `npx ts-node backend/src/database/seed.ts`
- Automatically loads environment variables from `.env`.

---
