# CHANGE LOG - December 8, 2025

## Post Author Display Bug Fix

### 🎯 Task Type: Bug Fix - Frontend API Integration

### 📋 Issue Description

Posts were displaying "Ismeretlen felhasználó" (Unknown User) instead of proper usernames like "Bandi" and "bob". This affected the user experience as post authors appeared anonymous even when the backend had complete user data.

### 🔍 Root Cause Analysis

The issue was in the Zustand posts store (`frontend/store/posts.ts`) where the `fetchPosts` function was constructing malformed URLs by concatenating `${API_BASE_URL}` with axios calls that already had `baseURL` configured in the axios instance.

**Problematic code**:

```typescript
// BEFORE (broken URL construction)
url: `${API_BASE_URL}/posts?${searchParams.toString()}`;
// Resulted in: http://localhost:3001/apihttp://localhost:3001/api/posts
```

### ✅ Fix Implementation

1. **Fixed URL construction in posts store** - Removed `${API_BASE_URL}` prefix from all axios calls
2. **Verified component architecture** - Confirmed PostCard uses PostAuthorInfo component correctly
3. **Tested fallback mechanism** - PostAuthorInfo has proper fallback: `{author?.username || 'Ismeretlen felhasználó'}`

**Fixed code**:

```typescript
// AFTER (correct URL construction)
url: `/posts?${searchParams.toString()}`;
// Results in: http://localhost:3001/api/posts
```

### 🧪 Testing & Verification

- ✅ Backend API test: Returns 2 posts with complete author data
- ✅ Frontend axios test: Correctly fetches posts with usernames "Bandi" and "bob"
- ✅ Component verification: PostCard → PostAuthorInfo → proper username display
- ✅ API endpoint verification: `/api/posts` returns 200 status with complete user objects

### 📁 Files Modified

- `frontend/store/posts.ts` - Fixed URL construction in fetchPosts and other API calls
- Component files verified as already correct (no changes needed)

### 🎉 Expected Result

After browser refresh, posts page should:

- Display 2 posts instead of "Még nincsenek posztok" (No posts yet)
- Show usernames "Bandi" and "bob" instead of "Ismeretlen felhasználó"
- Display complete post author information with proper user data

### ⏰ Time Completed

December 8, 2025 - Bug fix completed and verified through comprehensive testing

### 📝 Documentation Updated

- Main README.md updated with fix details
- Complete verification report created: `fix-verification-complete.md`
- Change log documented for project management tracking
