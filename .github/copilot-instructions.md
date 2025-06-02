# Project Prompt for Copilot Chat

# Project Copilot Instructions

- This document provides guidelines for file organization, development server usage, terminal best practices, testing, documentation updates, and quality assurance for the project.

### Important to know

- frontend uses `next.js` framework. Please read the [next.js documentation](https://nextjs.org/docs) for more information. Follow the latest patterns and practices.
- backend uses `nestjs` framework. Please read the [nestjs documentation](https://docs.nestjs.com/) for more information.
- All test files, images, and documentation must be organized in specific folders to maintain a clean project structure.

## File Organization Guidelines

- **Test Files**: All test files (e.g., `*.spec.ts`, `*.test.js`, and all test scripts) must be placed in the `tests/` folder at the root. If there are many files, use subfolders:
  - `tests/backend/` (backend tests)
  - `tests/frontend/` (frontend tests)
  - `tests/examples/` (example tests)
  - `tests/images/` (test screenshots)
  - `tests/playwright-report/` (E2E test reports)
- No test files are present in the root of `frontend/` or `backend/` directories. This structure is up-to-date and compliant with project documentation standards.
- **Test Images**: All test-generated images (screenshots, PNGs) must be placed in `tests/images/`, including those from any subproject or test folder.
- **Documentation**: All Markdown files (`*.md`) must be placed in the `docs/` folder, not in the root or any other folder (except for the main `README.md`, which stays in root).
- **Debug Files**: All debug PNGs and scripts (e.g., `debug-*.png`, `check-admin-status.js`) must be placed in `docs/debug/`, not in the root or other folders.
- **Important Files**: Never ignore or delete the `cookies.txt` file - it must be stored in `docs/`.
- **Root Directory**: Keep the root clean - no test, image, debug, or documentation files in the root. All such files must be organized as above.
- **Subproject Cleanliness**: The same organization applies to `backend/` and `frontend/` folders: do not keep test, image, debug, or documentation files in their roots; always move them to the central `tests/` or `docs/` folders at the project root.
- **Test Folder Consolidation**: If there are multiple test-related folders (e.g., `test/`, `tests-examples/`), consolidate their contents into the main `tests/` folder, using subfolders if needed for clarity.
- **Organization Status**: ✅ **COMPLETED** - Project reorganization completed June 1, 2025. All files now follow the above guidelines.

## Development Server Guidelines

- **Single Command**: Use `npm run dev` from root to start both frontend (localhost:3000) and backend (localhost:3001).
- **No Separate Terminals**: Do not create separate start scripts or terminals for backend/frontend.
- **Single Terminal Rule**: Always use a single integrated terminal in VS Code to run the development server.
  - Do **not** open a new terminal or start another instance if ports 3000 (frontend) and 3001 (backend) are already in use.
  - Starting multiple servers in separate terminals will cause port conflicts or crashes.
  - If you need to restart, stop the current process and run `npm run dev` again in the same terminal.
  - The server will automatically use ports 3000 and 3001 unless they are occupied. If these ports are in use, a new instance may start on a different port, but running multiple instances is not supported and will cause issues.
  - You do **not** need to create a new terminal for chat or any other feature; always reuse the existing terminal session.
- **Restart Process**: If servers need restarting, use `npm run dev` again in root directory.
- **Alternative Commands**:
  - `npm run backend` (not recommended - frontend won't start)
  - `npm run frontend` (not recommended - backend won't start)

## Terminal Best Practices

- **Terminal Type**: Use `bash` or `zsh` for script compatibility.
- **Encoding**: Ensure UTF-8 encoding for special characters.
- **IDE Integration**: Use integrated terminal in VSCode for better development experience.
- **Port Management**: If port conflicts occur, close conflicting processes before restarting.
- **Error Handling**: Check terminal logs for errors and reset terminal if needed.

## Testing & Documentation

- **E2E Testing**: Use Playwright for end-to-end testing.
- **API Documentation**: Use Swagger UI accessible at `http://localhost:3001/api/docs`.
- **Task Focus**: Complete requested tasks and end conversation after updating documentation.

## Documentation Update Requirements

After completing any task, **always update**:

### Core Documentation

1. Main `README.md` in root directory
2. Relevant files in `/docs` directory related to changes
3. Create change logs with type of changed task and time like this: `CHANGE_LOG_20250601.md` in `docs/project-management/`
4. When updating doc files, always read them first and fill them out logically, don't overwrite the whole thing with new data, but structure them appropriately.

### Organized Documentation Structure (June 2025)

The docs folder is now organized into the following structure. **Always check the correct subfolder** for the file you need to update:

#### Implementation & Progress Documentation

- **Backend changes**: Update `docs/implementation-reports/BACKEND_PROGRESS.md`
- **Frontend changes**: Update `docs/implementation-reports/FRONTEND_PROGRESS.md`
- **Admin features**: Update `docs/implementation-reports/ADMIN_PANEL_IMPLEMENTATION.md`
- **Authentication changes**: Update `docs/implementation-reports/AUTHENTICATION.md`
- **API changes**: Update `docs/implementation-reports/API.md`

#### Setup & Configuration Documentation

- **UI components**: Update `docs/setup-guides/SHADCN_SETUP.md`
- **Database changes**: Update `docs/setup-guides/DB.md` and `docs/setup-guides/DATABASE_MIGRATIONS.md`
- **Deployment changes**: Update `docs/setup-guides/DEPLOYMENT.md`
- **Environment setup**: Update `docs/setup-guides/ENVIRONMENT_SETUP.md`

#### Project Management Documentation

- **Change logs**: Create new files in `docs/project-management/` (e.g., `CHANGE_LOG_20250601.md`)
- **Testing changes**: Update `docs/project-management/TESTING.md`
- **Performance changes**: Update `docs/project-management/PERFORMANCE.md`
- **Code quality changes**: Update `docs/project-management/CODE_QUALITY.md`

#### Technical Documentation

- **Zustand store changes**: Update `docs/technical/ZUSTAND_STORE.md`
- **Security changes**: Update `docs/technical/SECURITY.md`
- **Debugging changes**: Update `docs/technical/DEBUGGING.md`
- **Seed data changes**: Update `docs/technical/SEED_DATA.md`

#### Accessibility & Standards

- **Accessibility changes**: Update `docs/accessibility/ACCESSIBILITY.md`
- **Internationalization changes**: Update `docs/accessibility/INTERNATIONALIZATION.md`

#### UI Changes & Visual Documentation

- **UI modifications**: Update relevant files in `docs/ui-changes/`
- **Visual component changes**: Update files in `docs/ui-changes/`

#### Debug & Troubleshooting

- **Debug files**: Place in `docs/debug/`
- **Troubleshooting guides**: Update files in `docs/debug/`

### File Location Quick Reference

When updating documentation, **first check these locations**:

1. **Implementation Reports**: `docs/implementation-reports/`

   - ADMIN_PANEL_IMPLEMENTATION.md
   - API.md
   - AUTHENTICATION.md
   - BACKEND_PROGRESS.md
   - FRONTEND_PROGRESS.md

2. **Setup Guides**: `docs/setup-guides/`

   - DATABASE_MIGRATIONS.md
   - DB.md
   - DEPLOYMENT.md
   - SHADCN_SETUP.md

3. **Project Management**: `docs/project-management/`

   - CHANGE*LOG*\*.md (create new ones here)
   - CODE_QUALITY.md
   - PERFORMANCE.md
   - TESTING.md

4. **Technical**: `docs/technical/`

   - DEBUGGING.md
   - SECURITY.md
   - SEED_DATA.md
   - ZUSTAND_STORE.md

5. **Accessibility**: `docs/accessibility/`
   - ACCESSIBILITY.md
   - INTERNATIONALIZATION.md

### Documentation Standards

- Maintain consistent style with existing files.
- Include relevant code examples.
- Add timestamps for updates.
- Group related changes together.
- Be concise yet thorough.
- Update implementation summaries for significant changes.
- Ensure documentation consistency with code changes.
- **Always check the organized subfolder structure before creating or updating files.**

## Quality Assurance

- Review all changes before committing.
- Verify documentation accuracy.
- Test functionality after changes.
- Maintain high-quality standards throughout development.
- Ensure files are placed in the correct organized subfolder structure.
