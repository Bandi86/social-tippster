# Project Prompt for Copilot Chat

## File Organization Guidelines

- **Test Files**: All test files (e.g., `*.spec.ts`, `*.test.js`) must be placed in the `tests/` folder at the root
- **Test Images**: Test-generated images (screenshots, PNGs) go in `tests/images/`
- **Documentation**: All Markdown files (`*.md`) belong in the `docs/` folder, not in the root
- **Debug Files**: Debug PNGs and scripts (e.g., `debug-*.png`, `check-admin-status.js`) go in `docs/debug/`
- **Important Files**: Never ignore or delete the `cookies.txt` file - it must be stored in `docs/`
- **Root Directory**: Keep the root clean - no test, image, debug, or documentation files in the root

## Development Server Guidelines

- **Single Command**: Use `npm run dev` from root to start both frontend (localhost:3000) and backend (localhost:3001)
- **No Separate Terminals**: Do not create separate start scripts or terminals for backend/frontend
- **One Terminal Rule**: Run only one terminal with both servers - close unused terminals
- **Restart Process**: If servers need restarting, use `npm run dev` again in root directory
- **Alternative Commands**:
  - `npm run backend` (not recommended - frontend won't start)
  - `npm run frontend` (not recommended - backend won't start)

## Terminal Best Practices

- **Terminal Type**: Use `bash` or `zsh` for script compatibility
- **Encoding**: Ensure UTF-8 encoding for special characters
- **IDE Integration**: Use integrated terminal in VSCode for better development experience
- **Port Management**: If port conflicts occur, close conflicting processes before restarting
- **Error Handling**: Check terminal logs for errors and reset terminal if needed

## Testing & Documentation

- **E2E Testing**: Use Playwright for end-to-end testing
- **API Documentation**: Use Swagger UI accessible at `http://localhost:3001/api/docs`
- **Task Focus**: Complete requested tasks and end conversation after updating documentation

## Documentation Update Requirements

After completing any task, **always update**:

### Core Documentation

1. Main `README.md` in root directory
2. Relevant files in `/docs` directory related to changes
3. create change logs  with type of changed task and time like this: `UI_CHANGE_LOG_202505028.md`
4. When u update doc files, always read them first and fill them out logically, don't overwrite the whole thing with new data, but structure them appropriately.

### Specialized Documentation (when applicable)

- **Backend changes**: Update `BACKEND_PROGRESS.md`
- **Frontend changes**: Update `FRONTEND_PROGRESS.md`
- **Database changes**: Update `DB.md` and `DATABASE_MIGRATIONS.md`
- **Authentication changes**: Update `AUTHENTICATION.md`
- **UI components**: Update `SHADCN_SETUP.md`
- **Admin features**: Update `ADMIN_PANEL_IMPLEMENTATION.md`

### Documentation Standards

- Maintain consistent style with existing files
- Include relevant code examples
- Add timestamps for updates
- Group related changes together
- Be concise yet thorough
- Update implementation summaries for significant changes
- Ensure documentation consistency with code changes

## Quality Assurance

- Review all changes before committing
- Verify documentation accuracy
- Test functionality after changes
- Maintain high-quality standards throughout development
