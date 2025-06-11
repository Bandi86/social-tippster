# Social Tippster Project Learning & Memory System

> **Date Created:** June 11, 2025
> **Purpose:** AI Assistant Project Learning and Memory Documentation
> **Project Type:** Sports Betting/Tipping Platform with Microservices Architecture

## 🏗️ Project Architecture Overview

### **Monorepo Structure**

```
social-tippster/
├── frontend_new/          # Main Next.js 15 Frontend (Active)
├── frontend/              # Legacy Frontend (Backup/Comparison)
├── backend_new/           # Microservices Backend (Active)
├── backend/               # Legacy Backend (Deprecated)
├── docs/                  # Comprehensive Documentation
├── tests/                 # Test Suite (Frontend & Backend)
└── docker-compose.yml     # Located in backend_new/
```

### **Technology Stack**

#### **Frontend (frontend_new/)**

- **Framework:** Next.js 15 with Turbopack
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** Axios
- **Forms:** React Hook Form + Zod validation
- **Themes:** next-themes with custom theme provider
- **Icons:** Lucide React
- **Port:** 3002

#### **Backend (backend_new/)**

- **Framework:** NestJS (TypeScript)
- **Architecture:** Microservices
- **Database:** PostgreSQL (one per service)
- **Caching:** Redis
- **Message Broker:** RabbitMQ
- **ORM:** Prisma (implied from project structure)
- **API Gateway:** Custom NestJS service

## 🐳 Docker Infrastructure

### **Development Environment**

All services run in Docker containers with hot-reload enabled.

### **Core Infrastructure Services**

```yaml
# Infrastructure (Shared)
redis:          localhost:6379    # Caching & Sessions
rabbitmq:       localhost:5672    # Message Broker
                localhost:15672   # RabbitMQ Management UI

# Frontend
frontend_new:   localhost:3002    # Next.js App
```

### **Backend Microservices**

```yaml
# Gateway & Core
api-gateway: localhost:3000 # Main API Entry Point
auth: localhost:3001 # Authentication Service

# Business Logic Services
user: localhost:3003 # User Management
post: localhost:3004 # Posts/Content
stats: localhost:3005 # Statistics
tipp: localhost:3006 # Tips/Predictions
notifications: localhost:3007 # Notifications
chat: localhost:3008 # Chat/Messaging
data: localhost:3009 # Data Management
image: localhost:3010 # Image Handling
live: localhost:3011 # Live Events
log: localhost:3012 # Logging Service
admin: localhost:3013 # Admin Panel
```

### **Database Services**

```yaml
# Each service has its own PostgreSQL database
postgres_auth: localhost:5434
postgres_user: localhost:5435
postgres_post: localhost:5436
postgres_stats: localhost:5437
postgres_tipp: localhost:5438
postgres_notifications: localhost:5439
postgres_chat: localhost:5440
postgres_data: localhost:5441
postgres_image: localhost:5442
postgres_live: localhost:5443
postgres_log: localhost:5444
postgres_admin: localhost:5445
```

## 🎯 Project Focus & Purpose

### **Domain:** Sports Betting/Tipping Platform

- Users can create and share betting tips
- Live sports data integration
- Community features (chat, discussions)
- Statistics and analytics
- Admin panel for management

### **Key Features**

- Authentication & User Management
- Content Management (Posts/Tips)
- Real-time Chat & Notifications
- Live Sports Data
- Statistics Dashboard
- Admin Panel
- Image/Media Handling

## 🔄 Development Workflow

### **Starting the Project**

```bash
# Navigate to backend_new directory
cd backend_new

# Start all services in development mode
docker-compose up -d

# Or start specific services
docker-compose up api-gateway_dev auth_dev frontend_new_dev -d
```

### **Key Development Commands**

```bash
# Check all running containers
docker ps

# View logs for specific service
docker logs -f container_name

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

## 📁 Important File Locations

### **Configuration Files**

- `backend_new/docker-compose.yml` - Main orchestration
- `frontend_new/package.json` - Frontend dependencies
- `frontend_new/next.config.ts` - Next.js configuration
- `frontend_new/tailwind.config.js` - TailwindCSS setup

### **Frontend Structure**

```
frontend_new/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout with providers
│   ├── globals.css       # Global styles & CSS variables
│   └── page.tsx          # Homepage
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── header/          # Header components
│   └── theme-toggle.tsx # Theme switching
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── store/               # Zustand store
└── types/               # TypeScript types
```

### **Theme System**

- **Provider:** next-themes with custom wrapper
- **Toggle:** Custom theme toggle components
- **CSS:** CSS variables in globals.css
- **Colors:** Supports light/dark mode with smooth transitions

## 🚀 Recent Implementations

### **Theme Switcher (June 11, 2025)**

- ✅ Fixed CSS variables for proper dark mode support
- ✅ Enhanced theme toggle components with better UX
- ✅ Added smooth transitions and improved contrast
- ✅ Implemented for both frontend and frontend_new

### **Current Project State**

- **Active Development:** frontend_new + backend_new microservices
- **Docker Setup:** Fully containerized with dev/prod configs
- **Database:** Multiple PostgreSQL instances per service
- **Frontend:** Next.js 15 with modern React 19
- **Backend:** NestJS microservices architecture

## 🔧 Common Development Tasks

### **Adding New Features**

1. **Frontend:** Add components in `frontend_new/components/`
2. **Backend:** Create new service in `backend_new/services/`
3. **Database:** Each service has its own PostgreSQL instance
4. **API:** Routes go through API Gateway (port 3000)

### **Debugging**

1. **Container Logs:** `docker logs -f container_name`
2. **Service Health:** Check individual service endpoints
3. **Database:** Connect to specific PostgreSQL instance
4. **Redis:** Monitor cache at localhost:6379

### **Testing**

- **Frontend Tests:** Located in `/tests/frontend/`
- **Backend Tests:** Located in `/tests/backend/`
- **E2E Tests:** Playwright configuration available

## 📝 Documentation Locations

### **Implementation Reports**

- `docs/implementation-reports/` - Progress tracking
- `docs/project-management/` - Change logs and management
- `docs/setup-guides/` - Setup and configuration guides

### **Key Documentation Files**

- `docs/implementation-reports/FRONTEND_PROGRESS.md`
- `docs/implementation-reports/BACKEND_PROGRESS.md`
- `docs/setup-guides/ENVIRONMENT_SETUP.md`
- `docs/project-management/CHANGE_LOG_*.md`

## 🧠 AI Assistant Memory Points

### **Always Remember:**

1. **Active Folders:** Use `frontend_new/` and `backend_new/` (NOT legacy folders)
2. **Docker First:** All services run in containers
3. **Microservices:** Each backend service is independent
4. **Port Structure:** Follow the established port mapping
5. **Theme System:** CSS variables support both light/dark modes
6. **Documentation:** Update relevant docs after changes
7. **USING DEVTOOLS MCP TOOLKIT:** For advanced debugging and development tasks

### **Common Patterns:**

- **Frontend:** Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** NestJS + TypeScript + PostgreSQL + Redis
- **Development:** Docker Compose with hot-reload
- **State:** Zustand for client state, Redis for backend cache

### **Architecture Decisions:**

- **Database per Service:** Each microservice has its own PostgreSQL
- **API Gateway Pattern:** Single entry point for all backend services
- **Event-Driven:** RabbitMQ for async communication
- **Caching Strategy:** Redis for performance optimization

---

**Last Updated:** June 11, 2025
**Next Review:** When significant architectural changes occur
