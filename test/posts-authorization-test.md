# Posts Authorization Testing Guide

## 🔐 Authorization Rules Implemented

### PATCH /api/posts/:id (Update Post)

- ✅ **ONLY the post author** can update their own posts
- ❌ Admins **CANNOT** update posts they don't own
- ❌ Other users **CANNOT** update posts

### DELETE /api/posts/:id (Delete Post)

- ✅ **Post author** can delete their own posts
- ✅ **Admin users** can delete ANY post
- ❌ Regular users **CANNOT** delete posts they don't own

## 🧪 Test Scenarios

### Setup Test Data

```bash
# 1. Create test users
POST /api/auth/register
{
  "username": "testuser",
  "email": "user@test.com",
  "password": "password123"
}

POST /api/auth/register
{
  "username": "adminuser",
  "email": "admin@test.com",
  "password": "password123"
}

# 2. Manually set admin role in database
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';

# 3. Create test post by regular user
POST /api/posts
Authorization: Bearer <user_token>
{
  "title": "Test Post",
  "content": "This is a test post"
}
```

### Test Authorization

#### Test 1: User Updates Own Post ✅

```bash
PATCH /api/posts/<post_id>
Authorization: Bearer <user_token>
{
  "title": "Updated Test Post"
}
# Expected: 200 OK - Post updated successfully
```

#### Test 2: Admin Tries to Update User's Post ❌

```bash
PATCH /api/posts/<post_id>
Authorization: Bearer <admin_token>
{
  "title": "Admin Updated Post"
}
# Expected: 403 Forbidden - "Csak a saját posztjaidat módosíthatod"
```

#### Test 3: User Deletes Own Post ✅

```bash
DELETE /api/posts/<post_id>
Authorization: Bearer <user_token>
# Expected: 204 No Content - Post deleted successfully
```

#### Test 4: Admin Deletes Any Post ✅

```bash
DELETE /api/posts/<post_id>
Authorization: Bearer <admin_token>
# Expected: 204 No Content - Post deleted successfully
```

#### Test 5: User Tries to Delete Another User's Post ❌

```bash
DELETE /api/posts/<other_user_post_id>
Authorization: Bearer <user_token>
# Expected: 403 Forbidden - "Csak a saját posztjaidat törölheted, vagy admin jogosultság szükséges"
```

## 📊 Role System

### UserRole Enum

```typescript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
```

### Database Schema

```sql
-- Users table with role column
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR DEFAULT 'user',
  -- ... other fields
);
```

## 🔧 Implementation Details

### Authorization Logic in Posts Controller

```typescript
// UPDATE (PATCH) - Author only
if (existingPost.author_id !== user.user_id) {
  throw new ForbiddenException('Csak a saját posztjaidat módosíthatod');
}

// DELETE - Author or Admin
const isOwner = existingPost.author_id === user.user_id;
const isAdmin = user.role === UserRole.ADMIN;

if (!isOwner && !isAdmin) {
  throw new ForbiddenException(
    'Csak a saját posztjaidat törölheted, vagy admin jogosultság szükséges',
  );
}
```

## ✅ Security Benefits

1. **Content Integrity**: Only authors can modify their posts
2. **Admin Moderation**: Admins can remove inappropriate content
3. **Clear Permissions**: Explicit role-based access control
4. **Audit Trail**: All authorization checks logged
5. **User-Friendly**: Hungarian error messages for better UX

## 🚀 Ready for Production

- ✅ Type-safe authorization logic
- ✅ Role-based access control implemented
- ✅ Comprehensive error handling
- ✅ Swagger documentation updated
- ✅ Database schema ready for migration
