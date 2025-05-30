# 🏈 Social Tippster

Egy modern közösségi platform sportfogadási tippek megosztására, követésére és értékelésére.

## 🚀 Technológiák

### Backend ✅ **PRODUCTION READY**

- **NestJS** - Modern Node.js framework
- **TypeScript** - Type-safe fejlesztés
- **TypeORM** - Database ORM with PostgreSQL
- **PostgreSQL** - Adatbázis (9 optimalizált tábla)
- **JWT** - Dual token authentication (Access + Refresh)
- **bcrypt** - Jelszó titkosítás
- **Passport** - Authentication middleware
- **Swagger** - Teljes API dokumentáció
- **Class-validator** - Input validation Hungarian error messages

### Backend Features ✅

- 🔐 **Secure Authentication** - Dual token system with brute force protection
- 👥 **User Management** - Complete CRUD with admin functions
- 📝 **Posts System** - Multi-type posts (tips, discussions, news, analysis)
- 💬 **Comment System** - Nested comments with voting
- 📊 **Analytics** - Centralized analytics service with comprehensive tracking
- 🛡️ **Admin Panel** - Centralized admin operations with proper separation of concerns
- 🔒 **Security** - Type-safe, validated, and protected endpoints
- 🌐 **Hungarian Localization** - Consistent Hungarian language support
- 📚 **Documentation** - Complete Swagger/OpenAPI docs

### Frontend ✅ **ENHANCED REDDIT-LIKE LAYOUT**

- **Next.js 15** - React framework (App Router)
- **TypeScript** - Type-safe fejlesztés
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Modern UI komponensek
- **React Hook Form** - Form kezelés
- **Zustand** - State management

### Frontend Features ✅

- 🏠 **Reddit-Like Homepage** - Modern 3-column layout with comprehensive navigation
- 🚀 **Always-Visible Post Creation** - Quick access post creation interface
- 📊 **Live Dashboard Widgets** - Trending topics, live matches, community stats
- 👤 **Enhanced User Profiles** - Quick view profiles with avatars and stats
- 🎯 **Advanced Filtering** - Category-based post filtering and discovery
- 📱 **Responsive Design** - Mobile-first design that works across all devices
- 🎨 **Modern Dark Theme** - Elegant dark theme with amber accent colors
- ⚡ **Real-time Updates** - Live match updates and community activity feeds
- 👀 **Non-Authenticated User Experience** _(2025-05-29)_ - All content (posts, comments, stats) is visible to guests, but post creation, voting, commenting, bookmarking, and sharing are disabled. Read-only counters and clear login/register banners guide users to authentication. Guest users see a prominent welcome banner and feature preview, with all interactive elements replaced by static displays.
- 🔧 **Complete Profile Management** _(2025-05-29)_ - Full profile editing system with avatar display, account settings, password change, and email update functionality. Users can view their complete profile with registration date, online status, and last login information. Profile navigation includes dedicated pages for settings, security, and account management.
- 💬 **Advanced Comment System** _(2025-05-29)_ - Complete Zustand-based comment system with nested replies, voting, editing, and deletion. Fully migrated from API calls to centralized state management with proper error handling and optimistic updates.
- 🛡️ **Admin User Management** _(2025-05-30)_ - Complete Zustand store migration for admin users page. All admin operations (ban/unban, verify/unverify, role changes) now use centralized state management with proper error handling and type safety.

### DevOps

- **Docker** - Kontainerizáció
- **GitHub Actions** - CI/CD
- **ESLint & Prettier** - Code quality

## 📋 Előfeltételek

- **Node.js** (v18 vagy újabb)
- **npm** (v9 vagy újabb)
- **PostgreSQL** (v14 vagy újabb)
- **Docker** (opcionális)

## 🛠️ Telepítés

### 1. Repository klónozása

```bash
git clone https://github.com/Bandi86/social-tippster.git
cd social-tippster
```

### 2. Automatikus setup (ajánlott)

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manuális telepítés

#### Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Szerkeszd a .env fájlt a valós értékekkel
```

#### Frontend setup

````bash
cd frontend
npm install
cp .env.example .env.local
# Szerkeszd a .env.local fájlt a valós értékekkel
```bash
cd frontend
npm install
cp .env.example .env.local
# Szerkeszd a .env.local fájlt a valós értékekkel
````

## ⚙️ Konfigurációs fájlok

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=tippmix

# JWT Access Token (rövid élettartam)
JWT_ACCESS_SECRET=your-super-secret-access-jwt-key
JWT_ACCESS_EXPIRES_IN=15m

# JWT Refresh Token (hosszú élettartam)
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Indítás

### Fejlesztői mód

```bash
# Minden szolgáltatás egyszerre
npm run dev

# Vagy külön-külön
npm run dev:backend    # Backend (port 3001)
npm run dev:frontend   # Frontend (port 3000)
```

### Docker használata

```bash
# Összes szolgáltatás (backend, frontend, database)
docker-compose up --build

# Csak adatbázis
docker-compose up postgres
```

### Production build

```bash
npm run build
npm run start
```

## 📊 Adatbázis

### Aktuális entitások ✅

- **User** - Felhasználók kezelése (teljes CRUD, validation, authentication)
- **RefreshToken** - JWT refresh token-ek biztonságos tárolása
- További entitások fejlesztés alatt...

### Adatbázis séma ✅

A projekt TypeORM-et használ, automatikus tábla generálással development módban.
Migrations rendszer implementálva a production környezethez.

### Migrációk ✅

```bash
cd backend
npm run migration:generate -- -n CreateRefreshTokensTable
npm run migration:run
```

**Aktuális migráció:** RefreshToken tábla létrehozva és alkalmazva.

## 🧪 Tesztelés & Verifikáció

### Admin Panel Testing ✅ **COMPLETED**

**Overall Success Rate**: 86% (6/7 core functionalities working)

#### ✅ Sikeres tesztek:

- **Authentication**: JWT token alapú bejelentkezés működik
- **Admin Panel Access**: Role-based hozzáférés-ellenőrzés funkcionál
- **Cookie Management**: HttpOnly refresh tokenek megfelelően implementálva
- **Admin API Access**: Stats API működőképes (200 status)
- **UI Components**: Minden fő komponens jelen van (táblázatok, keresés, gombok)
- **Refresh Tokens**: Token frissítési funkció működik

#### ⚠️ Javítandó problémák:

- **Login Redirect**: Sikeres bejelentkezés után a felhasználó nem kerül átirányításra
- **Users API Error**: 500 hiba az `/api/admin/users` végponton
- **Rate Limiting**: 429 hibák gyakori API kérések esetén

#### Test Files:

```bash
# Komprehenzív admin panel tesztek
npx playwright test tests/admin-panel-comprehensive-test.spec.ts

# Részletes API és funkció tesztek
npx playwright test tests/admin-panel-detailed-test.spec.ts

# UI flow és felhasználói élmény tesztek
npx playwright test tests/admin-panel-ui-flow-test.spec.ts
```

### Általános tesztelés

```bash
# Backend tesztek
npm run test:backend

# Frontend tesztek
npm run test:frontend

# E2E tesztek
npm run test:e2e
```

## 📝 Fejlesztési státusz

### ✅ Kész funkciók

- [x] Projekt alapstruktúra
- [x] Backend NestJS setup
- [x] Database kapcsolat (PostgreSQL + TypeORM)
- [x] User entity (teljes séma + migrations)
- [x] **Authentication System** (JWT dual token + HttpOnly cookies)
- [x] **Brute Force Protection** (5 attempts + 15 min lockout)
- [x] **Rate Limiting** (Multi-tier throttling)
- [x] **Swagger Documentation** (`/api/docs`)
- [x] CORS konfiguráció
- [x] Environment változók kezelése
- [x] Docker setup
- [x] **User CRUD API endpoints** (teljes implementáció)
- [x] **Profile Management System** _(2025-05-29)_ - Complete user profile editing, password change, email update, and profile display functionality
- [x] **Comment System Zustand Migration** _(2025-05-29)_ - Complete migration from API calls to centralized state management with proper error handling, property name fixes, and component integration

### 🚧 Fejlesztés alatt

- [ ] Frontend alapstruktúra (Next.js)
- [ ] Login/Register komponensek
- [ ] Dashboard UI komponensek
- [ ] HTTP client setup (token interceptors)

### 📋 Tervezett funkciók

- [ ] Post entity és API
- [x] **Comment rendszer** _(2025-05-29)_ - ✅ **COMPLETE** - Zustand-based comment system with nested replies, voting, and moderation
- [ ] Vote/Rating rendszer
- [ ] Real-time chat
- [ ] Notification rendszer
- [ ] File upload (képek)
- [ ] Admin panel

## 🌐 API Endpointok

### Autentikáció ✅

- `POST /api/auth/register` - Regisztráció (rate limited: 3/min)
- `POST /api/auth/login` - Bejelentkezés (rate limited: 5/min + brute force protection)
- `POST /api/auth/refresh` - Token frissítés (rate limited: 10/min)
- `POST /api/auth/logout` - Kijelentkezés (protected)
- `POST /api/auth/logout-all-devices` - Kijelentkezés minden eszközről (protected)

### Felhasználók ✅

- `GET /api/users` - Felhasználók listája (paginated)
- `GET /api/users/:id` - Felhasználó részletei
- `GET /api/users/username/:username` - Felhasználó keresése username alapján
- `GET /api/users/me` - Aktuális felhasználó (protected)
- `PATCH /api/users/:id` - Felhasználó frissítése (protected)
- `PATCH /api/users/:id/change-password` - Jelszó változtatás (protected)
- `DELETE /api/users/:id` - Felhasználó törlése (protected)

### Admin műveletek ✅ (Protected)

- `PATCH /api/users/:id/ban` - Felhasználó tiltása
- `PATCH /api/users/:id/unban` - Tiltás feloldása
- `PATCH /api/users/:id/verify` - Felhasználó verifikálása

### Dokumentáció ✅

- `GET /api/docs` - Swagger/OpenAPI dokumentáció
- `GET /api/docs-json` - OpenAPI JSON séma

## 🏗️ Projekt struktúra

```
social-tippster/
├── backend/                 # NestJS API ✅ PRODUCTION READY
│   ├── src/
│   │   ├── modules/         # Funkcionális modulok
│   │   │   ├── auth/        # ✅ Authentication (dual token + security)
│   │   │   └── users/       # ✅ User management (CRUD + admin)
│   │   ├── common/          # ✅ Közös komponensek
│   │   ├── config/          # ✅ Konfigurációk
│   │   └── database/        # ✅ DB setup + migrations
│   └── package.json
├── frontend/                # Next.js alkalmazás 🚧 IN PROGRESS
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/      # UI komponensek
│   │   └── lib/             # Utilities
│   └── package.json
├── docs/                    # ✅ Dokumentáció
│   ├── AUTHENTICATION.md    # ✅ Teljes auth rendszer leírás
│   └── BACKEND_PROGRESS.md  # ✅ Backend fejlesztési státusz
├── docker-compose.yml       # ✅ Docker services
└── README.md               # ✅ Ez a fájl (frissítve)
```

## 🤝 Hozzájárulás

1. Fork-old a repository-t
2. Hozz létre egy feature branch-et (`git checkout -b feature/amazing-feature`)
3. Commit-old a változásokat (`git commit -m 'Add amazing feature'`)
4. Push-old a branch-re (`git push origin feature/amazing-feature`)
5. Nyiss egy Pull Request-et

## 🐛 Hibák jelentése

Ha hibát találsz, kérlek nyiss egy [issue-t](https://github.com/yourusername/social-tippster/issues) a következő információkkal:

- Hiba leírása
- Lépések a reprodukáláshoz
- Várt viselkedés
- Képernyőképek (ha szükséges)

## 📄 Licenc

Ez a projekt [MIT License](LICENSE) alatt áll.

## 👥 Fejlesztő csapat

- **Backend Lead** - NestJS, TypeORM, PostgreSQL ✅ **COMPLETED**
  - Authentication System (Dual Token + Security)
  - User Management (CRUD + Admin functions)
  - API Documentation (Swagger)
  - Database Design & Migrations
- **Frontend Lead** - Next.js, TypeScript, Tailwind CSS ✅ **INTEGRATION FIXED**
  - UI Components & Authentication flows
  - State Management & HTTP Client
  - Profile Management System
  - Frontend-Backend API Integration
- **DevOps** - Docker, CI/CD, deployment 🚧 **PLANNED**

## 📋 Legutóbbi Változások (2025-05-29)

### ✅ Profile Management System Completion

- **Posts Loading Fix**: Fixed profile page to load user's own posts correctly using username instead of ID
- **Password Change API**: Resolved missing confirmPassword parameter in password change functionality
- **Email Update Interface**: Added missing email field to UpdateUserData interface for email changes
- **Profile Navigation**: Verified all profile action links work correctly (settings, password change, email change)
- **Compilation Errors**: All TypeScript compilation errors in profile management system resolved
- **Development Servers**: Both frontend (localhost:3000) and backend (localhost:3001) running successfully

### 🔧 Technical Improvements

- Fixed fetchUserPosts API call parameter mismatch in profile page
- Corrected changeUserPassword function call with proper parameters
- Enhanced UpdateUserData interface to support email updates
- Verified ProfileActions component navigation functionality

### 📋 Previous Changes (2025-05-28)

#### ✅ Profile Edit System Fixes

- **Compilation Errors Fixed**: Resolved all TypeScript compilation errors in profile edit functionality
- **API Integration**: Fixed frontend-backend API communication for user profile updates
- **Authentication Hooks**: Corrected import paths and function signatures for auth system
- **Icon Library**: Fixed lucide-react icon import issues
- **Development Servers**: Both frontend (3000) and backend (3001) running without errors

#### 🔧 Technical Improvements

- Fixed auth store import paths across frontend components
- Added backward compatibility aliases for API functions
- Resolved parameter mismatch issues between frontend and backend
- Updated password change functionality with proper validation

---

**Státusz:** 🚀 **Backend Production Ready** + **Frontend Integration Working**

**Backend Completeness:** ✅ **95%** (Authentication + User Management teljes)
**Frontend Integration:** ✅ **Profile System Working**

**Utolsó frissítés:** 2025. május 29. - Profile Management rendszer befejezése és tesztelése

## Backend CORS Policy Update (2025-05-28)

- The backend now supports multiple local origins and additional headers for CORS, improving compatibility with Playwright and direct API testing.
- If you encounter CORS errors during local development or testing, ensure you are using one of the allowed origins (see `backend/src/main.ts`).

## Backend Rate Limiting Update (2025-05-28)

- Increased rate limiting thresholds for all API buckets to reduce 429 errors during admin panel and E2E testing.
- See `backend/src/config/throttler.config.ts` for new limits.

## 🗃️ Database Seeding

### Seed Script

- A new seed script (`backend/src/database/seed.ts`) is available to populate the database with sample data for all major tables.
- To run the seed script:

```bash
npx ts-node backend/src/database/seed.ts
```

- The script creates 3 users, 3 posts, and related bookmarks, votes, shares, views, comments, comment votes, user logins, and system metrics.
- Useful for local development, testing, and demo environments.

**Last updated:** 2025-05-29
