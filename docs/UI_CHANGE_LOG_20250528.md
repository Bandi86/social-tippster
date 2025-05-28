# UI_CHANGE_LOG_20250528.md

## Type: Backend/Comments Module Refactor

**Date:** 2025-05-28

### Summary

- Fixed 35+ TypeScript errors in CommentsService and CommentsController.
- Ensured all controller endpoints and service methods are type-safe and return correct DTOs.
- Added missing admin endpoints: findAllForAdmin, bulkAction.
- Fixed all strict formatting, destructuring, and type issues in CommentsService.
- Confirmed compatibility with AdminController and admin panel bulk actions.
- All backend and admin panel builds now pass with zero errors.

### Details

- Refactored CommentsService to match DTO/entity structure and strict TypeScript rules.
- Added explicit type narrowing for admin query params.
- Implemented admin comment listing and bulk moderation logic.
- Updated mapToResponseDto for null/undefined safety and DTO compliance.
- Verified with full build and lint: no errors remain.

---

**This change log documents the completion of the comments module refactor and admin compatibility for May 28, 2025.**
