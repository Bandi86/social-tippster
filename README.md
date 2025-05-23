# 🎯 Social Tippster

Modern social platform for betting tips and predictions.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL
- **DevOps**: Docker, GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky, Commitlint

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
git clone <repo-url>
cd social-tippster

# Create frontend and backend projects first
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --skip-git
npx @nestjs/cli new backend --package-manager npm --skip-git

# Run the setup script
chmod +x setup.sh
./setup.sh

# Copy and configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit .env files with your values, then:
npm run dev
```

### Manual Setup
```bash
# Root dependencies
npm install

# Frontend setup
cd frontend
npm install

# Backend setup  
cd ../backend
npm install

# Start development
npm run dev:frontend    # Terminal 1
npm run dev:backend     # Terminal 2
```

### Docker Setup
```bash
# Start entire stack with Docker
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Database: localhost:5432
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend & backend
- `npm run lint` - Lint all code
- `npm run format` - Format with Prettier
- `npm run commit` - Commitizen commit
- `npm run release` - Create new release
- `npm run prepare` - Setup Husky hooks

### Frontend (`/frontend`)
- `npm run dev` - Start Next.js dev server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint frontend code

### Backend (`/backend`)
- `npm run start:dev` - Start NestJS dev server (port 3001)
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests

## 📝 Environment Setup

### Required Files
```bash
# Backend environment
backend/.env              # Copy from .env.example

# Frontend environment  
frontend/.env.local       # Copy from .env.example
```

### Key Variables
```bash
# Backend (.env)
DATABASE_URL=postgres://user:pass@localhost:5432/social_tippster
JWT_SECRET=your-super-secret-key
PORT=3001

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
```

## 📁 Project Structure

```
social-tippster/
├── frontend/             # Next.js 15 application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   └── .env.local       # Frontend environment
├── backend/             # NestJS API
│   ├── src/             # Source code
│   ├── dist/            # Compiled output
│   └── .env             # Backend environment
├── .github/             # GitHub Actions workflows
├── .husky/              # Git hooks
├── docs/                # Documentation
├── docker-compose.yml   # Docker services
└── setup.sh            # Automated setup script
```

## 🔄 Development Workflow

### Commits
```bash
# Use commitizen for consistent commits
npm run commit

# Or manual with conventional format
git commit -m "feat: add user authentication"
```

### Releases
```bash
# Create new release with changelog
npm run release
```

## 🐳 Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚀 Deployment

### Prerequisites
Set GitHub repository secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

### Deploy
```bash
git push origin main  # Triggers GitHub Actions
```

## 📚 Next Steps

1. **Database Setup**: Configure PostgreSQL connection
2. **Authentication**: Implement NextAuth.js
3. **API Development**: Create betting tips endpoints
4. **UI Components**: Build with Tailwind CSS
5. **Testing**: Add Jest/Cypress tests

