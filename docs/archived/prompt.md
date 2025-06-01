---
mode: 'agent'
tools: ['codebase', 'terminal']
description: 'Create or modify code and automatically update documentation'
---

# Intelligent Documentation Maintainer

Your mission is to deliver the requested development task and ensure all related documentation is accurate, clear, and up-to-date.

## Primary Task

- Complete the user's main development request efficiently and correctly.

## Terminal and Test Management

- **Before starting a new terminal**, check if the frontend or backend is already running to avoid duplicate processes.
- Place all new or updated tests in the `/tests` folder.
- Use Playwright test MCP for end-to-end testing.

## Documentation Update Workflow

After completing the main task, **always**:

1. Update relevant Markdown files in the current document directory.
2. Update the main `README.md` in the root directory with a high-level summary of changes.
3. Update any specialized documentation in the `/docs` directory related to your changes.
4. For backend changes, update `BACKEND_PROGRESS.md`.
5. For frontend changes, update `FRONTEND_PROGRESS.MD`.
6. For database changes, update `DB.md` and `DATABASE_MIGRATIONS.md`.
7. For authentication changes, update `AUTHENTICATION.md`.
8. For shadcn/ui component library changes, update `SHADCN_SETUP.md`.
9. For admin panel changes, update `ADMIN_PANEL_IMPLEMENTATION.md`.
10. Update any other relevant documentation files as needed.
11. Ensure all documentation is clear, concise, and follows the existing style.
12. Keep the root `README.md` current and reflective of the latest project state.
13. Ensure all documentation is consistent with the code changes made.

## Documentation Best Practices

- Maintain a consistent documentation style with existing files.
- Include relevant code examples and usage instructions.
- Add a timestamp (YYYY-MM-DD) to each documentation update.
- Add a summary of the task and changes to `CHANGELOG.md` in the appropriate section.
- Group related changes together for clarity.
- Be concise yet thorough in explanations.
- Update implementation summaries when significant changes are made.
- For new features, document them in the appropriate file or create a new one if necessary.

## Project Organization and File Placement Rules

To keep the project organized and the root directory clean, adhere to the following rules:

- **All test files** (e.g., `*.spec.ts`, `*.test.js`) must be placed in the `tests/` folder at the root. Do not create or leave any test files in the project root or in unrelated folders.
- **Test images and artifacts** (e.g., screenshots, PNGs) must be placed in `tests/images/`. Do not place test images or artifacts in the project root.
- **Markdown documentation files** (`*.md`) should be placed in the `docs/` folder, not in the root directory.
- **When running the project**, always use `npm run dev` from the root. This starts both frontend and backend together (on `localhost:3000` and `localhost:3001`) in the same terminal. Do not create separate start scripts or terminals for backend or frontend.
- **Never ignore or delete the `cookies.txt` file.** It must be stored in the `docs/` folder, not in the root.
- **Debug PNG files and debug scripts** (e.g., `debug-*.png`, `check-admin-status.js`) must be placed in `docs/debug/`, not in the root.
- **Summary or cleanup files** (e.g., `CLEANUP_SUMMARY.md`) must be placed in `docs/`, not in the root.
- **Keep the root directory clean:** No test, image, debug, or documentation files should be placed here.

## Quality Commitment

Thank you for ensuring that both code and documentation remain high-quality, consistent, and easy to understand for all contributors!
