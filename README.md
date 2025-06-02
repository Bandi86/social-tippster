# Social Tippster

A comprehensive social media platform for football tips and predictions, built with Next.js frontend and NestJS backend.

## 🏗️ Project Structure

This project follows a clean, organized structure for optimal maintainability and developer experience:

```
social-tippster/
├── backend/                    # NestJS API server
├── frontend/                   # Next.js web application
├── tests/                      # All test files and reports
│   ├── backend/               # Backend-specific tests
│   ├── frontend/              # Frontend-specific tests
│   ├── examples/              # Test examples
│   ├── images/                # Test screenshots
│   └── playwright-report/     # E2E test reports
├── docs/                      # Comprehensive documentation
│   ├── accessibility/         # Accessibility guidelines
│   ├── admin/                # Admin panel documentation
│   ├── api/                  # API documentation
│   ├── auth/                 # Authentication guides
│   ├── backend/              # Backend-specific docs
│   ├── changelogs/           # Project change logs
│   ├── database/             # Database & migration docs
│   ├── debug/                # Debug files & scripts
│   ├── frontend/             # Frontend-specific docs
│   ├── implementation-reports/ # Development progress
│   ├── setup-guides/         # Configuration guides
│   └── ui-changes/           # UI modification logs
└── [configuration files]      # Root-level configs only
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Development Server

Start both frontend and backend servers with a single command:

```bash
npm run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Alternative Commands

```bash
npm run frontend  # Frontend only (not recommended)
npm run backend   # Backend only (not recommended)
```

## 🛠️ Technology Stack

### Frontend

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand
- **Authentication:** NextAuth.js
- **Language:** TypeScript

### Backend

- **Framework:** NestJS
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT + Passport
- **Documentation:** Swagger/OpenAPI
- **Language:** TypeScript

### Testing

- **E2E Testing:** Playwright
- **Unit Testing:** Jest
- **API Testing:** Supertest

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **Setup Guides:** Installation and configuration
- **API Documentation:** Available at http://localhost:3001/api/docs
- **Implementation Reports:** Development progress and status
- **Change Logs:** Detailed project modification history

## 🧪 Testing

All tests are centralized in the `/tests` folder:

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run comprehensive test suite
./tests/run-comprehensive-tests.sh
```

## 🔧 Configuration

Environment variables and configuration files:

- Backend: `/backend/.env`
- Frontend: `/frontend/.env.local`
- Database: Configure in backend environment

## 📝 Contributing

1. Follow the established project structure
2. Place test files in `/tests` with appropriate subfolders
3. Add documentation to `/docs` in relevant categories
4. Keep backend and frontend folders clean of test/debug files
5. Update relevant documentation when making changes

## 🏆 Features

- **User Authentication & Authorization**
- **Football Tips & Predictions**
- **Social Media Integration**
- **Admin Panel & Management**
- **Real-time Updates**
- **Mobile-Responsive Design**
- **API-First Architecture**
- **Admin Session Management (NEW, 2025-06-01):**
  - View and manage all user sessions from the admin panel
  - Force logout or invalidate sessions for security and compliance
- **Analytics Dashboard (COMPLETED, 2025-06-01):**
  - Live analytics integration with backend endpoints
  - Comprehensive user, post, and comment statistics
  - Real-time data visualization and export capabilities
  - Interactive dashboard with beautiful UI components

## 🚀 Recent Improvements

### Post View Tracking Optimization (2025-06-02)

- ✅ **Fixed 429 "Too Many Requests" errors** on main page load
- ✅ **Improved performance** with 90% reduction in unnecessary API calls
- ✅ **Enhanced session persistence** with localStorage integration
- ✅ **Intelligent throttling** with 2-minute post view tracking intervals
- ✅ **Exponential backoff** for rate-limited requests
- ✅ **Better error handling** with graceful degradation

**Impact:** Eliminated console errors and significantly improved user experience during page navigation.

## 📄 License

See [LICENSE.md](docs/LICENSE.md) for details.

## 🤝 Support

For support and questions, check the documentation in `/docs` or create an issue in the project repository.

## [32mTest File Organization (2025-06-01)[0m

All test files are consolidated under the root `tests/` folder, with subfolders for:

- `tests/backend/` (backend tests)
- `tests/frontend/` (frontend tests)
- `tests/examples/` (example tests)
- `tests/images/` (test screenshots)
- `tests/playwright-report/` (E2E test reports)

No test files are present in the root of `frontend/` or `backend/` directories. This structure is up-to-date and compliant with project documentation standards.

---

**Project organized and maintained according to professional development standards** ✅
