# Database Migrations Guide

## Date: June 2, 2025

## Overview

This document provides guidelines for creating and running database migrations in the Social Tippster project. Proper migration practices are essential for maintaining database schema consistency across environments.

## TypeORM Migration Commands

The following commands are available in the backend package.json for managing migrations:

```bash
# Generate a new migration based on entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert the last executed migration
npm run migration:revert
```

## Migration Naming Convention

TypeORM requires migrations to follow a specific naming convention:

1. **Class Name Format**: `[DescriptiveName][UnixTimestamp]`

   - Example: `CreateUserSessions1748563200000`

2. **File Name Format**: `[timestamp]-[descriptive-name].ts`

   - Example: `1748563200000-CreateUserSessions.ts`

3. **Timestamp Format**: Unix timestamp (milliseconds since epoch)
   - Can be generated with: `Date.now()` in JavaScript/TypeScript

❌ **INCORRECT**: `20250602-CreateUserSessions.ts`
✅ **CORRECT**: `1748563200000-CreateUserSessions.ts`

## Migration Best Practices

1. **One Change Per Migration**: Each migration should focus on a single logical change to the database schema.

2. **Test Migrations**: Always test migrations in a development environment before applying to production.

3. **Reversible Changes**: Ensure both `up()` and `down()` methods are properly implemented for reversibility.

4. **Use IF EXISTS / IF NOT EXISTS**: Use conditional statements to make migrations more robust.

5. **Check Foreign Key Constraints**: Verify table existence before adding foreign key constraints.

6. **Document Schema Changes**: Update relevant documentation files when making significant schema changes.

## Recent Migration Changes

### June 2, 2025 - Session Token Length Fix

- Migrated `session_token` field in `user_sessions` table from VARCHAR(255) to VARCHAR(512)
- Fixed incorrect migration naming formats
- See [CHANGE_LOG_20250602_MIGRATION_FIX.md](../changelogs/CHANGE_LOG_20250602_MIGRATION_FIX.md) for details

## Common Issues and Solutions

### Issue: Incorrect Migration Format

**Problem**: Migration class name doesn't follow TypeORM naming convention.

**Error Message**:

```
Error during migration run:
TypeORMError: [MigrationName] migration name is wrong. Migration class name should have a JavaScript timestamp appended.
```

**Solution**:

1. Remove the incorrectly formatted migration file
2. Create a new migration with the correct format
3. Run migrations again

### Issue: Migration Order Conflicts

**Problem**: Multiple migrations attempting to modify the same schema objects.

**Solution**:

- Ensure migration timestamps create a logical execution order
- Consider consolidating migrations if they're not yet applied to production
