# CHANGE LOG – 2025-06-05

## Posts & Tipps Module Separation – Final Refactor

### Changed

- Removed all tip-related logic from `backend/src/modules/posts/posts.service.ts` (tip result, statistics, betting slip processing, etc.).
- Posts module now only handles generic post CRUD (text, image, comments reference).
- All tip creation, validation, statistics, and result logic is handled exclusively by the tipps module (`backend/src/modules/tipps/`).
- Ensured no controllers or services reference removed tip logic in posts module.
- Cleaned up unused imports and verified type safety.

### Migration & Database Sync

- After entity changes, TypeORM migration dryrun revealed major schema drift (enum changes, new/dropped columns, new tipps table, etc.).
- Attempting to run the generated migration failed due to enum value mismatch: `invalid input value for enum posts_type_enum: "tip"`.
- Root cause: legacy `"tip"` values in `posts.type` column, which are not present in the new enum.
- Solution: Wrote and ran a script (`fix-posts-type-tip.ts`) to update all `posts.type = 'tip'` to `discussion` before migration.
- Had to temporarily set `synchronize: false` in `data-source.ts` to avoid TypeORM auto-sync errors during the script run.
- After fixing data, migration ran successfully and DB is now in sync with entities.
- Cleaned up `data-source.ts` to only export default DataSource (required for TypeORM CLI compatibility).

### Documentation

- Updated `docs/implementation-reports/TIPPS_MODULE_REFACTORING.md` and `docs/implementation-reports/BACKEND_PROGRESS.md` for June 5, 2025.
- Updated `docs/implementation-reports/API.md` if endpoints or data model changed.
- This changelog created for traceability, including all migration and enum troubleshooting steps.

---

_Logged by GitHub Copilot, 2025-06-05_

# 2025-06-05 - TypeORM migrációs parancs dokumentáció

## Helyes migrációs parancs backend fejlesztéshez

A migrációk listázásához, futtatásához vagy generálásához mindig a backend mappában kell futtatni a parancsokat, például:

```
npx typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts
```

- A parancsot a `backend` mappában futtasd!
- A CLI csak így tölti be helyesen a környezeti változókat és az adatbázis kapcsolatot.
- Ha bármilyen "password must be a string" vagy hasonló hibát kapsz, ellenőrizd, hogy a `.env` helyesen van-e kitöltve és a parancsot a backend mappában futtatod-e.

## Ellenőrzött migrációk (2025-06-05)

- A fenti parancs sikeresen lefutott, minden migráció alkalmazva van.
- Enum típusváltásnál mindig ellenőrizd, hogy az adatbázisban nincsenek-e már nem támogatott enum értékek!
- Ha "invalid input value for enum" hibát kapsz, előbb javítsd az adatbázisban az értékeket (pl. script vagy SQL update segítségével), csak utána futtasd a migrációt.

## 2025-06-05 – Frontend Session Expiry & Refresh 404 Handling

- Improved frontend session management: when a refresh token request returns 404 (user/session not found), the frontend now globally clears authentication and redirects to the login page if the user is on a protected route.
- Implemented in `frontend/providers/AuthProvider.tsx` using a useEffect that watches authentication state and pathname.
- Ensures users are never left in a stuck state after backend seed or session reset.
- See `docs/implementation-reports/FRONTEND_PROGRESS.md` for details.

## 2025-06-05 – Bugfix: Frontend Session Expiry & Guest UI Reset

- Fixed a bug where, after session expiry or backend reseed, the UI (navbar, welcome header, etc.) still showed the previous user's info even after logout or page reload.
- Ensured that after session expiry, the frontend fully resets to the guest state, both in-memory and in persisted Zustand store, and all UI components reflect the correct authentication state.
- Playwright test (`tests/frontend/auth-session-expiry.spec.ts`) verifies that after session expiry and reload, the UI shows only guest elements and no user info.
- Updated Zustand `clearAuth` logic to clear both in-memory and persisted state (`auth-storage` in localStorage).
- Updated `AuthProvider` to re-initialize auth state after logout/session expiry and redirect to login if needed.
- Navbar and WelcomeHeader now always reflect the correct state from the store.
- Playwright test selectors were made robust to avoid ambiguity (e.g., for 'Regisztráció' link).
- Test now passes and reliably verifies the fix.

**Files Changed:**

- `frontend/store/auth.ts`
- `frontend/providers/AuthProvider.tsx`
- `frontend/components/layout/Navbar.tsx`
- `frontend/components/root/WelcomeHeader.tsx`
- `tests/frontend/auth-session-expiry.spec.ts`

**Testing:**

- Playwright test run: PASSED (2025-06-05)
