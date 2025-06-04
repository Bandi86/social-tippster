# CHANGE LOG – 2025-06-04

## Tip Validation Service & Backend Tip System Improvements

### Added

- Implemented `TipValidationService` for deadline, odds, user history, and match existence validation logic (stubbed for now)
- Injected and used `TipValidationService` in `TipsService` for all tip validation
- Added/updated endpoints in `TipsController` for tip validation and deadline checking
- Created unit test: `tests/backend/tip-validation.service.spec.ts` for all validation logic

### Fixed

- TypeScript errors and async/await issues in validation and service logic
- Lint and formatting issues in service and module files

### Documentation

- Updated backend implementation report and testing documentation
- All changes follow project file organization and documentation standards

## [2025-06-04] Test Infrastructure Policy Update

### Changed

- Removed all automatic backend server start/stop logic from Jest and test configs.
- Jest no longer uses any `globalSetup` or `globalTeardown` for server management.
- Updated comments in `tests/jest-global-setup.ts` and `tests/jest-global-teardown.ts` to clarify they are not active.
- Updated documentation (README.md, TESTING.md) to state that the backend server must be started manually before running any tests.
- This change prevents port conflicts and aligns with project dev server policy.

---

_Logged by GitHub Copilot, 2025-06-04_
