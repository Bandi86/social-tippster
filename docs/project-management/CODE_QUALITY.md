# Code Quality Management

## Overview

This document outlines the code quality standards, tools, and processes used in the Social Tippster project.

## Code Quality Tools

### Linting

- **ESLint**: Primary linting tool for TypeScript/JavaScript
- **Configuration**: `eslint.config.js` (root), separate configs for frontend/backend
- **Rules**: TypeScript-specific rules with customized severity levels
- **Integration**: VS Code integration with auto-fix on save

### Code Formatting

- **Prettier**: Automated code formatting
- **Configuration**: `.prettierrc` with consistent styling rules
- **Integration**: Format on save enabled in VS Code
- **Ignore Files**: Comprehensive `.prettierignore` files

### Type Checking

- **TypeScript**: Strict type checking enabled
- **Configuration**: Multiple `tsconfig.json` files for different contexts
- **Strict Mode**: Enabled with `strictNullChecks` and `noImplicitAny`
- **Build Validation**: TypeScript compilation required for builds

## File Organization Standards

### Project Structure

- **Clean Root**: No test, debug, or documentation files in root directory
- **Organized Tests**: All test files in `/tests` with appropriate subfolders
- **Documentation**: Centralized in `/docs` with organized subfolders
- **Debug Files**: Isolated in `/docs/debug/`

### Archived Content Management (Updated June 5, 2025)

- **Complete Isolation**: All `archived/` folders ignored by development tools
- **Git Ignore**: Archived folders excluded from version control
- **Build Exclusion**: TypeScript, ESLint, Prettier ignore archived content
- **Test Exclusion**: Jest and Playwright skip archived folders
- **IDE Integration**: VS Code hides archived folders from explorer and search

### Tool Configuration for Archived Folders

#### Version Control

```gitignore
# Archived folders - ignore completely
**/archived/
**/archived/**
archived/
```

#### TypeScript Compilation

```json
"exclude": [
  "node_modules",
  "dist",
  "**/*.test.ts",
  "**/archived/**",
  "archived/**",
  "docs/archived/**",
  "tests/archived/**"
]
```

#### ESLint Checking

```javascript
ignores: [
  // ...other patterns...
  '**/archived/**',
  'archived/**',
  'docs/archived/**',
  'tests/archived/**',
];
```

#### Testing Frameworks

- **Jest**: `testPathIgnorePatterns` excludes archived folders
- **Playwright**: `testIgnore` configuration prevents E2E testing of archived content

#### Code Formatting

- **Prettier**: `.prettierignore` patterns exclude archived folders from formatting

#### IDE Configuration

- **VS Code**: Comprehensive exclusion in `settings.json`:
  - `files.exclude` - Hides from file explorer
  - `search.exclude` - Excludes from search results
  - `files.watcherExclude` - Prevents file watching

## Pre-commit Hooks

### Husky Integration

- **Setup**: Git hooks configured via Husky
- **Lint-staged**: Runs quality checks only on staged files
- **Validation**: Prevents commits that fail quality standards

### Quality Gates

1. **Linting**: ESLint must pass without errors
2. **Formatting**: Prettier formatting must be applied
3. **Type Checking**: TypeScript compilation must succeed
4. **Tests**: Relevant tests must pass

## Development Workflow

### Code Standards

- **Consistent Formatting**: Prettier enforces uniform code style
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Prevention**: ESLint catches potential issues
- **Clean Organization**: Structured file placement

### Quality Metrics

- **Zero Linting Errors**: All code must pass ESLint validation
- **Type Coverage**: 100% TypeScript coverage for new code
- **Test Coverage**: Maintained testing standards
- **Documentation**: Up-to-date documentation for all changes

## Continuous Integration

### Build Process

- **Multi-stage Validation**: Linting, type checking, and testing
- **Quality Reports**: Automated generation of quality metrics
- **Failure Handling**: Build fails on quality standard violations

### Monitoring

- **Code Quality Tracking**: Regular assessment of quality metrics
- **Technical Debt**: Identification and prioritization of improvements
- **Performance Impact**: Quality tools optimized for development speed

## Recent Updates

### June 5, 2025: Archived Folders Isolation

- Implemented comprehensive ignore patterns for archived content
- Updated all development tools to exclude archived folders
- Enhanced VS Code integration for clean workspace experience
- Documented archived folder management standards

---

**Last Updated**: June 5, 2025
**Maintained By**: Development Team
**Next Review**: Monthly quality assessment
