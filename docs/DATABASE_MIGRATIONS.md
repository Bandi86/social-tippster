# Database Migrations

This document tracks database migrations and schema changes for the Social Tippster application.

## Latest Migrations

### 1733580000000-CreateAnalyticsEntities

**Date: May 28, 2025**

Created analytics entities for tracking user activity and platform metrics:

- `user_logins`: Tracks each user login with device information
- `daily_stats`: Daily aggregated statistics for users, posts, and comments
- `monthly_stats`: Monthly aggregated statistics for users, posts, and comments
- `system_metrics`: System-level performance and usage metrics

### 1733826267000-CreateRefreshTokensTable

**Date: May 28, 2025**

Fixed migration to safely handle existing refresh token tables and constraints:

- Added proper checks for existing constraints
- Prevents duplicate constraint errors during deployment
- Ensures safe rollbacks with IF EXISTS clauses

## Running Migrations

To run all pending migrations:

```bash
npm run migration:run
```

To revert the most recent migration:

```bash
npm run migration:revert
```

To generate a new migration after entity changes:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

## Troubleshooting

If you encounter constraint errors during migration:

1. Check if the constraint already exists in the database
2. Use the `checkConstraintExists` helper method in your migration
3. Add IF EXISTS clauses to DROP statements in down() methods
