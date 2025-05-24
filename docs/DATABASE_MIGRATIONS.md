# Database Migration Status

## Applied Migrations

| Date       | Migration                              | Description                                                                | Status     |
| ---------- | -------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| 2024-01-10 | 1733826267000-CreateRefreshTokensTable | Created refresh tokens table for secure JWT authentication                 | ✅ Applied |
| 2025-05-24 | 1737738000000-AddUserRoleField         | Added role column to users table with enum values (USER, ADMIN, MODERATOR) | ✅ Applied |

## Migration Details

### 1733826267000-CreateRefreshTokensTable

Created the `refresh_tokens` table to store and manage refresh tokens for the JWT authentication system:

```sql
CREATE TABLE refresh_tokens (
  token_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  device_info TEXT,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### 1737738000000-AddUserRoleField

Added the `role` column to the `users` table to implement role-based access control:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;
UPDATE users SET role = 'user' WHERE role IS NULL;
```

## Pending Migrations

Currently, there are no pending migrations.

## Migration Commands

To run migrations:

```bash
cd backend
npm run migration:run
```

To create a new migration:

```bash
cd backend
npm run migration:generate -- --name=MigrationName
```

To revert the last migration:

```bash
cd backend
npm run migration:revert
```

## Entity Structure After Migrations

### User Entity

```typescript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  // ...other fields

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // ...timestamps and relationships
}
```

### Authorization Rules

- Users can only modify their own profiles
- Users can only modify their own posts
- Users can only delete their own posts
- Admins can delete any post (for moderation)
- Moderators have specific permissions (as defined in controllers)
