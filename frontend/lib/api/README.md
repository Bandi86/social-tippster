# API Layer Cleanup (2025-05-29)

- All API logic for posts, comments, and users is now handled by Zustand stores in `frontend/store`.
- The only file that should remain in this folder is `axios.ts`, which provides the shared axios instance for all API calls in the app.
- The `admin-apis/` subfolder contains admin-specific API logic and is not affected by this migration.
- All other API logic has been migrated to Zustand stores and removed from this folder.

**Do not delete `axios.ts`!**

_Last updated: 2025-05-29_
