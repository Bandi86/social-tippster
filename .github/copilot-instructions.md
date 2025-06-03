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

**Single Command Rule**: Start both frontend (localhost:3000) and backend (localhost:3001) using the unified root command:

```bash
npm run dev
```

**Do Not Start Servers Automatically or in Parallel**:
If the development servers are already running on ports 3000 or 3001, do not attempt to start them again — either manually or programmatically (e.g., via Copilot task suggestions). This causes port conflicts, server duplication, or unexpected behavior.

**Do Not Auto-Restart Servers**:
Copilot or developer scripts must never attempt to "help" by starting a server just because a port is occupied. If a port is in use, it usually means the server is already running, and that’s expected.

**Single Terminal Policy**:

- Use only one integrated terminal in VSCode to run the dev server.
- Do not open multiple terminals to start frontend/backend separately.
- Do not run alternative commands like dev:frontend or dev:backend unless debugging in isolation (and even then, prefer `npm run dev`).

**Restart Protocol**:
If a server crashes or needs to be restarted, stop the current process and re-run:

```bash
npm run dev
```

**Avoid Conflicts**:

- Never run separate frontend/backend instances in different terminals.
- If port 3000 or 3001 is unavailable, check if the server is already running rather than starting a new instance.
- Multiple concurrent servers are not supported and will break the dev environment.

**No Server Boot Logic in Tasks**:

- Do not attach server start logic to test or documentation tasks.
- Do not include server bootstrap logic in test runners, file watchers, or script executions.

**Alternative Commands (Use only when necessary)**:

- `npm run dev:backend` – Starts backend only (not recommended)
- `npm run dev:frontend` – Starts frontend only (not recommended)

### Package.json Configuration

- **Root Dependencies**: Project uses comprehensive testing and development dependencies:
  - **Testing**: Jest (`^29.7.0`), Playwright (`^1.52.0`), ts-jest (`^29.3.4`)
  - **Reporting**: jest-html-reporter, jest-junit for test output
  - **TypeScript**: Full TypeScript support with ts-node and type definitions
  - **Linting/Formatting**: ESLint, Prettier with automated commit hooks
  - **Development**: Concurrently for running multiple processes, cross-env for environment variables
- **Backend Dependencies**: NestJS testing framework, Supertest for HTTP testing
- **Build Scripts**: Separate build commands for frontend and backend components
- **Quality Assurance**: Husky pre-commit hooks, lint-staged for automated code quality checks

## Terminal Best Practices

- **Terminal Type**: Use `bash` or `zsh` for script compatibility.
- **Encoding**: Ensure UTF-8 encoding for special characters.
- **IDE Integration**: Use integrated terminal in VSCode for better development experience.
- **Port Management**: If port conflicts occur, close conflicting processes before restarting.
- **Error Handling**: Check terminal logs for errors and reset terminal if needed.

## Testing & Documentation

### Test Infrastructure

- **Jest Configuration**: Root `jest.config.ts` with TypeScript support, coverage reporting, and HTML/JUnit output
- **Test Scripts**: Available npm scripts for comprehensive testing:
  - `npm test` - Run Jest unit tests with coverage
  - `npm run test:e2e` - Run Playwright end-to-end tests
  - `npm run test:auth:run` - Run authentication integration test suite
  - `npm run start:test` - Start backend in test environment
- **Backend Testing**: NestJS testing framework with custom Jest configurations:
  - `tests/backend/jest.auth-integration.config.js` - Authentication integration tests
  - In-memory SQLite database for isolated testing
  - Coverage reports in `tests/coverage/` directory
- **Frontend Testing**: Playwright tests for UI components and auth store integration
- **Authentication Test Suite**: Comprehensive testing framework:
  - `tests/run-auth-tests.js` - Automated test runner script
  - Backend API endpoint testing (security, performance, edge cases)
  - Frontend authentication store and UI integration tests
  - End-to-end user authentication flows
  - Test reporting with detailed pass/fail analysis

### Testing Categories

- **Unit Tests**: Jest-based tests for backend modules and services
- **Integration Tests**: Authentication system, database operations, API endpoints
- **E2E Testing**: Playwright for complete user workflows and browser testing
- **Performance Tests**: Authentication response times and concurrent user scenarios
- **Security Tests**: Token validation, CSRF protection, brute force protection

### Test Execution

- **Development Testing**: Run `npm run dev` first, then execute test commands
- **Isolated Testing**: Backend tests use in-memory database, no server dependency required
- **Continuous Testing**: All test files organized in `tests/` with subfolders for different categories
- **Test Reports**: Automatic generation of HTML reports and JUnit XML for CI/CD integration

### API Documentation

- **Swagger UI**: Accessible at `http://localhost:3001/api/docs`
- **Authentication Testing**: Use Swagger's "Authorize" button to test protected endpoints
- **API Testing Scripts**: Manual testing scripts in `tests/backend/` for validation

### Task Focus

- Complete requested tasks and end conversation after updating documentation.
- Always run relevant tests after making changes to ensure system integrity.
- Update test documentation when adding new test categories or modifying test infrastructure.

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
