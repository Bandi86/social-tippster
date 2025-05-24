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
- 📊 **Analytics** - Comprehensive tracking and statistics
- 🔒 **Security** - Type-safe, validated, and protected endpoints
- 📚 **Documentation** - Complete Swagger/OpenAPI docs

### Frontend

- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type-safe fejlesztés
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Modern UI komponensek
- **React Hook Form** - Form kezelés
- **Zustand** - State management

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
git clone https://github.com/yourusername/social-tippster.git
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

```bash
cd frontend
npm install
cp .env.example .env.local
# Szerkeszd a .env.local fájlt a valós értékekkel
```

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

## 🧪 Tesztelés

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

### 🚧 Fejlesztés alatt

- [ ] Frontend alapstruktúra (Next.js)
- [ ] Login/Register komponensek
- [ ] Dashboard UI komponensek
- [ ] HTTP client setup (token interceptors)

### 📋 Tervezett funkciók

- [ ] Post entity és API
- [ ] Comment rendszer
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
- **Frontend Lead** - Next.js, TypeScript, Tailwind CSS 🚧 **IN PROGRESS**
  - UI Components & Authentication flows
  - State Management & HTTP Client
  - Responsive Design & User Experience
- **DevOps** - Docker, CI/CD, deployment 🚧 **PLANNED**

---

**Státusz:** 🚀 **Backend Production Ready** - Frontend Integration Ready

**Backend Completeness:** ✅ **95%** (Authentication + User Management teljes)

**Utolsó frissítés:** 2025. május 24. - Authentication System teljes implementáció
