# 🏈 Social Tippster

Egy modern közösségi platform sportfogadási tippek megosztására, követésére és értékelésére.

## 🚀 Technológiák

### Backend
- **NestJS** - Modern Node.js framework
- **TypeScript** - Type-safe fejlesztés
- **TypeORM** - Database ORM
- **PostgreSQL** - Adatbázis
- **JWT** - Autentikáció
- **bcrypt** - Jelszó titkosítás

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

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
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

### Aktuális entitások
- **User** - Felhasználók kezelése (teljes CRUD)
- További entitások fejlesztés alatt...

### Adatbázis séma
A projekt TypeORM-et használ, automatikus tábla generálással development módban.

### Migrációk
```bash
cd backend
npm run migration:generate -- -n CreateUsers
npm run migration:run
```

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
- [x] User entity (teljes séma)
- [x] CORS konfiguráció
- [x] Environment változók kezelése
- [x] Docker setup

### 🚧 Fejlesztés alatt
- [ ] Authentication (JWT)
- [ ] User CRUD API endpoints
- [ ] Frontend alapstruktúra
- [ ] Login/Register komponensek

### 📋 Tervezett funkciók
- [ ] Post entity és API
- [ ] Comment rendszer
- [ ] Vote/Rating rendszer
- [ ] Real-time chat
- [ ] Notification rendszer
- [ ] File upload (képek)
- [ ] Admin panel

## 🌐 API Endpointok

### Autentikáció
- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `POST /api/auth/logout` - Kijelentkezés
- `GET /api/auth/me` - Aktuális felhasználó

### Felhasználók
- `GET /api/users` - Felhasználók listája
- `GET /api/users/:id` - Felhasználó részletei
- `PUT /api/users/:id` - Felhasználó frissítése
- `DELETE /api/users/:id` - Felhasználó törlése

## 🏗️ Projekt struktúra

```
social-tippster/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/         # Funkcionális modulok
│   │   │   └── users/       # User modul
│   │   ├── common/          # Közös komponensek
│   │   ├── config/          # Konfigurációk
│   │   └── database/        # DB setup
│   └── package.json
├── frontend/                # Next.js alkalmazás
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/      # UI komponensek
│   │   └── lib/             # Utilities
│   └── package.json
├── docker-compose.yml       # Docker services
└── README.md               # Ez a fájl
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

- **Backend Lead** - NestJS, TypeORM, PostgreSQL
- **Frontend Lead** - Next.js, TypeScript, Tailwind CSS
- **DevOps** - Docker, CI/CD, deployment

---

**Státusz:** 🚧 Aktív fejlesztés alatt

**Utolsó frissítés:** 2025. május 24.

