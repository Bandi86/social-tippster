#!/bin/bash

echo "🚀 Social Tippster monorepo setup indul..."

# Ellenőrizzük, hogy vannak-e a mappák
if [ ! -d "frontend" ]; then
    echo "❌ Frontend mappa hiányzik! Futtasd előbb:"
    echo "npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --skip-git"
    exit 1
fi

if [ ! -d "backend" ]; then
    echo "❌ Backend mappa hiányzik! Futtasd előbb:"
    echo "npx @nestjs/cli new backend --package-manager npm --skip-git"
    exit 1
fi

### 🛠️ Globális alaprendszer
echo "🔧 Root projekt konfigurálása..."

# Root package.json és scriptek
npm pkg set name="social-tippster"
npm pkg set version="1.0.0"
npm pkg set description="Social betting tips platform"
npm pkg set main="index.js"
npm pkg set scripts.dev="concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
npm pkg set scripts.dev:frontend="cd frontend && npm run dev"
npm pkg set scripts.dev:backend="cd backend && npm run start:dev"
npm pkg set scripts.build:frontend="cd frontend && npm run build"
npm pkg set scripts.build:backend="cd backend && npm run build"
npm pkg set scripts.install:all="npm install && cd frontend && npm install && cd ../backend && npm install"
npm pkg set scripts.lint="eslint . --ext .ts,.tsx,.js,.jsx"
npm pkg set scripts.lint:fix="eslint . --ext .ts,.tsx,.js,.jsx --fix"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."

# Dev dependencies telepítése
npm install --save-dev husky lint-staged \
  commitlint @commitlint/config-conventional \
  commitizen cz-conventional-changelog \
  standard-version concurrently \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier eslint-config-prettier

# Husky és hookok
npm pkg set scripts.prepare="husky install"
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Lint-staged
npm pkg set lint-staged."frontend/**/*.{js,ts,tsx,jsx,json}"="[\"prettier --write\", \"eslint --fix\"]"
npm pkg set lint-staged."backend/**/*.{js,ts,json}"="[\"prettier --write\", \"eslint --fix\"]"

# Commitlint config
cat <<EOT > commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
EOT

# Commitizen
npm pkg set config.commitizen.path="cz-conventional-changelog"

# Standard-version release
npm pkg set scripts.release="standard-version"
npm pkg set scripts.commit="git-cz"

cat <<EOT > .versionrc.json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "chore", "section": "Chores", "hidden": true },
    { "type": "docs", "section": "Documentation" },
    { "type": "style", "section": "Styles", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring" },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "test", "section": "Tests" }
  ]
}
EOT

touch CHANGELOG.md

########################
# 🎨 Frontend setup
########################

echo "🔧 Frontend (Next.js) konfigurálása..."
cd frontend

# Prettier config
cat <<EOT > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf"
}
EOT

cat <<EOT > .prettierignore
node_modules
.next
out
coverage
public
*.log
EOT

# ESLint config frissítése
cat <<EOT > .eslintrc.json
{
  "extends": ["next", "next/core-web-vitals", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
EOT

# .env template
cat <<EOT > .env.example
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=Social Tippster
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Feature Flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PREMIUM=false
EOT

# Dockerfile
cat <<EOT > Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
EOT

# Docker ignore
cat <<EOT > .dockerignore
node_modules
.next
npm-debug.log
.git
.gitignore
README.md
Dockerfile
.dockerignore
EOT

cd ..

########################
# 🧱 Backend setup
########################

echo "🔧 Backend (NestJS) konfigurálása..."
cd backend

# Prettier config
cat <<EOT > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf"
}
EOT

cat <<EOT > .prettierignore
node_modules
dist
coverage
*.log
EOT

# ESLint config
cat <<EOT > .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@nestjs/eslint-config-standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
EOT

# .env template
cat <<EOT > .env.example
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=tippmix

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@social-tippster.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads

# API Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# External APIs
SPORTS_API_KEY=your-sports-api-key
ODDS_API_KEY=your-odds-api-key

# CORS
FRONTEND_URL=http://localhost:3000
EOT

# Main.ts módosítása portra
if [ -f "src/main.ts" ]; then
    sed -i 's/await app.listen(3000);/await app.listen(process.env.PORT || 3001);/' src/main.ts

    # CORS hozzáadása
    sed -i '/const app = await NestFactory.create(AppModule);/a\\n  app.enableCors({\n    origin: process.env.FRONTEND_URL || '\''http://localhost:3000'\'',\n    credentials: true,\n  });' src/main.ts
fi

# Dockerfile
cat <<EOT > Dockerfile
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=\${NODE_ENV}

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=development /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
EOT

# Docker ignore
cat <<EOT > .dockerignore
node_modules
dist
npm-debug.log
.git
.gitignore
README.md
Dockerfile
.dockerignore
coverage
.env
EOT

cd ..

########################
# 🐳 Docker Compose
########################

echo "🧩 Docker Compose létrehozása..."

cat <<EOT > docker-compose.yml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5433/tippmix
      - JWT_SECRET=dev-jwt-secret-key
      - FRONTEND_URL=http://localhost:3000
      - PORT=3001
    volumes:
      - ./backend:/app
      - /app/node_modules
      - /app/dist
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tippmix
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
EOT

# Docker Compose development override
cat <<EOT > docker-compose.override.yml
version: "3.9"

services:
  frontend:
    command: npm run dev

  backend:
    command: npm run start:dev
EOT

########################
# 📁 .gitignore
########################

echo "📁 .gitignore frissítése..."

cat <<EOT > .gitignore
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment files
.env
.env.*
!.env.example
backend/.env
backend/.env.*
!backend/.env.example
frontend/.env.local
frontend/.env.*
!frontend/.env.example

# Build outputs
dist/
build/
backend/dist/
frontend/.next/
frontend/out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage
coverage/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker
docker-compose.override.yml

# Uploads
uploads/
EOT

########################
# 🔄 GitHub Actions CI/CD
########################

echo "⚙️ GitHub Actions workflow létrehozása..."

mkdir -p .github/workflows

cat <<EOT > .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: 20

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tippmix
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: Lint frontend
        working-directory: ./frontend
        run: npm run lint

      - name: Lint backend
        working-directory: ./backend
        run: npm run lint

      - name: Type check frontend
        working-directory: ./frontend
        run: npm run build

      - name: Test backend
        working-directory: ./backend
        run: npm run test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5433/tippmix

  build-and-deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Build frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run build

      - name: Build backend
        working-directory: ./backend
        run: |
          npm ci
          npm run build

      # Itt lehet hozzáadni a deployment lépéseket
EOT

########################
# 📝 Environment fájlok másolása
########################

echo "📝 Environment fájlok beállítása..."

# Backend .env
if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "✅ backend/.env létrehozva .env.example alapján"
else
    echo "⚠️  backend/.env.example nem található"
fi

# Frontend .env.local
if [ -f "frontend/.env.example" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ frontend/.env.local létrehozva .env.example alapján"
else
    echo "⚠️  frontend/.env.example nem található"
fi

########################
# 🎉 Befejezés
########################

echo ""
echo "🎉 Social Tippster setup befejezve!"
echo ""
echo "📝 Következő lépések:"
echo "1. Szerkeszd a .env fájlokat a valós értékekkel:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Indítsd el a fejlesztői környezetet:"
echo "   npm run install:all  # Telepíti az összes függőséget"
echo "   npm run dev          # Indítja frontend + backend"
echo ""
echo "3. Docker használata (opcionális):"
echo "   docker-compose up --build"
echo ""
echo "4. Első commit készítése:"
echo "   git add ."
echo "   npm run commit       # Commitizen használata"
echo ""
echo "🌐 Elérhetőségek:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5432"
echo ""
