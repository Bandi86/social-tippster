# Zustand Store Refactor

All API logic for posts, comments, and users is now encapsulated in their respective Zustand stores. The old lib/api files are deprecated and should be removed. Use the hooks in `frontend/hooks` for all state and API access.

- Posts: `usePostsStore` (see `store/posts.ts`)
- Comments: `useCommentsStore` (see `store/comments.ts`)
- Users: `useUsersStore` (see `store/users.ts`)

## Usage

Import the hooks from `frontend/hooks` for all state and actions.

## Last updated: 2025-05-29
