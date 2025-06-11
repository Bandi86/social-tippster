# Project Prompt for Copilot Chat

# Project Copilot Instructions

- This document provides guidelines for file organization, development server usage, terminal best practices, testing, documentation updates, and quality assurance for the project.

### Important to know

- Monorepo structure: The project is organized as a monorepo, which means all related packages and services are stored in a single repository.
- frontend is the frontend_new folder, which contains the frontend code.
- backend is the backend_new folder, which contains the backend code.
note: ignore the old frontend and backend folders, they are not used anymore.

# Project Structure
- everything is docker containerized all services are running in docker containers.
- The project is structured as follows:
  - `frontend_new/`: Contains the frontend code.
  - `backend_new/`: Contains the backend code.
  - `docker-compose.yml`: Docker Compose file to run all services. path: backend_new `docker-compose.yml`.
  - `README.md`: Project documentation.

  ### how to use it? use mcp server devtools!

# Frontend code suggestions
 nextjs 15 latest version https://nextjs.org/docs
 - follow Next.js best practices for file organization and component structure.
- Use TypeScript for type safety and better development experience.
- Organize components into directories based on their functionality.
- Use taiwlindcss for styling, and shadcn/ui for UI components.
- Use `@tanstack/react-query` for data fetching and state management.
- Use `react-hook-form` for form handling and validation.
- Use `zod` for schema validation.
- Use `react-i18next` for internationalization.
- Use `eslint` and `prettier` for code linting and formatting.
- use `axios` for API requests.
- use `zustand` for state management.
- try use logical components structure if page file is too big, split it into smaller components.
- always try to use server components when possible, to reduce client-side bundle size and improve performance.
- care about performance every component and page should be optimized for performance.

# Backend code suggestions
backend_new is michroservices architecture, each service is a separate package its created by nestjs and its docker containerized.
- you can use the `nest` CLI to generate new services, controllers, and modules.
- Use TypeScript for type safety and better development experience.
- Organize services into directories based on their functionality.
- Use `@nestjs/swagger` for API documentation.
- using prisma for database can use `prisma generate` to generate types and client.
- using redis for caching and message brokering.
- the api getaway is the main entry point for the backend, it handles all incoming requests and routes them to the appropriate service.

# Testing suggestions
- Be careful with curl commands, they are not recommended for testing in this project because the project is dockerized and uses `docker-compose` to run all services. if you want to test try to use the devtools mcp server
- Use `jest` for unit testing and `supertest` for integration testing.
- Write tests for all new features and bug fixes.
- Aim for high test coverage, but prioritize testing critical functionality.
- Use `mocking` to isolate tests and avoid hitting external dependencies.
- the test folder is located at `tests` directory. have separated folders for frontend and backend tests and more.
- Frontend test should use playwright for e2e testing, and `@testing-library/react` for unit testing. located folder is samme /`tests` in root directory

# After task is finished update the documentation in docs folder

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
