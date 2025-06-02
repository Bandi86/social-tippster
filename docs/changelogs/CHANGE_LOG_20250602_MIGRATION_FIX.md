# Migration Fix - Session Token Length Change

## Date: June 2, 2025

## Type: Database Schema Update

### Changes Made

1. Fixed migration format issues for user sessions and user login modifications

   - Removed incorrectly formatted migrations (20250601-\*)
   - Removed duplicate migrations with older timestamps (1748476800000-_, 1748476900000-_)
   - Created new migrations with proper timestamp format (1748563200000-_, 1748563300000-_)

2. Updated session_token field in user_sessions table

   - Changed varchar length from 255 to 512 for session_token to accommodate longer tokens
   - This change aligns with the entity definition in user-session.entity.ts

3. Successfully executed migrations to update the database schema

### Technical Details

- Migration files updated:

  - Created: 1748563200000-CreateUserSessions.ts
  - Created: 1748563300000-AddFailureReasonAndSessionToUserLogins.ts
  - Removed: 20250601-CreateUserSessions.ts
  - Removed: 20250601-AddFailureReasonAndSessionToUserLogins.ts
  - Removed: 1748476800000-CreateUserSessions.ts
  - Removed: 1748476900000-AddFailureReasonAndSessionToUserLogins.ts

- Schema changes:
  - user_sessions.session_token: VARCHAR(255) → VARCHAR(512)
  - user_logins: Added failure_reason, session_start, and session_end columns

### Benefits

- Ensures database schema matches entity definitions
- Prevents potential truncation of session tokens
- Follows TypeORM migration naming standards for proper versioning

### Migration Command

```bash
npm run migration:run
```

### Verification

Migrations have been executed successfully with proper naming conventions. The database schema now matches the entity definitions, with session_token field properly sized to 512 characters.
