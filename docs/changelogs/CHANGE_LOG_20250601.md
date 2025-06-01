# CHANGE LOG - 2025-06-01

## Type: Project Structure Refactor & File Organization

### Summary

- Centralized all test files from root, backend, frontend, and test-related folders into `tests/` with subfolders for backend, frontend, and examples.
- Moved all test images from various locations into `tests/images/`.
- Moved all Markdown documentation files (except `README.md`) into `docs/`.
- Moved all debug PNGs and scripts into `docs/debug/`.
- Moved `cookies.txt` to `docs/`.
- Updated `.github/copilot-instructions.md` to clarify stricter file organization and consolidation rules for all subprojects.

### Implementation Details

- No test, image, debug, or documentation files remain in the root or subproject roots.
- All test folders are consolidated under `tests/`.
- All documentation is now under `docs/`.
- All debug files are under `docs/debug/`.

---

_Updated: 2025-06-01_
