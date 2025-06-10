# Environment Setup – Docker & Microservices (2025-06-10)

## [2025-06-10] API Gateway prefix és DB tisztítás

- Az API Gateway route prefix javítva: megszűnt a dupla `/api/api` Swagger és endpoint útvonalakban, mostantól minden végpont helyesen `/api/...` formátumú.
- Prisma, saját adatbázis és minden kapcsolódó környezeti változó eltávolítva az API Gateway-ből.
- Docker Compose-ból törölve a `postgres_api_gateway` service és minden hivatkozás.
- Dockerfile-ból törölve a Prisma-ra vonatkozó build lépés.

## [2025-06-10] API Gateway adatbázis eltávolítás

- Az API Gateway szervizből eltávolítottuk az összes adatbázisra (PostgreSQL) vonatkozó környezeti változót.
- A docker-compose.yml-ből töröltük a postgres_api_gateway service-t.
- Az API Gateway mostantól nem igényel saját adatbázist, csak Redis-t, RabbitMQ-t és a többi mikroszervizt használja.

## Overview

As of June 10, 2025, the Social Tippster project uses a fully containerized microservices architecture for both backend and frontend, orchestrated via Docker Compose. This guide describes the environment setup for local development and production.

---

## Prerequisites

- Docker Desktop (latest)
- Node.js (LTS recommended)
- Bash-compatible shell (e.g., Git Bash, WSL, or VSCode integrated terminal)

---

## Directory Structure

- All backend microservices: `backend_new/services/`
- Frontend (Next.js): `frontend_new/`
- Central Docker Compose: `backend_new/docker-compose.yml`

---

## Environment Files

- Each service in `backend_new/services/*` and `frontend_new/` must have its own `.env` file (see `.env.example` for templates).
- Do not commit secrets. Use `.gitignore` to exclude `.env` and sensitive files.

---

## Starting the Stack

1. Ensure Docker Desktop is running.
2. From the project root, run:
   ```bash
   cd backend_new
   docker compose up --build
   ```
   This will start all backend microservices, their dedicated Postgres DBs, Redis, RabbitMQ, and the frontend.

---

## Development (Hot Reload)

- Dev-mode containers mount source code and run hot reload (NestJS/Next.js dev servers).
- Edit code locally; changes are reflected in running containers.

---

## Ports

- API Gateway: 3000
- Auth: 3001
- User: 3002
- Post: 3003
- Tipp: 3004
- ... (see `docker-compose.yml` for full list)
- Frontend: 3000 (Next.js)
- Postgres: 5433+ (one per service)
- Redis: 6379
- RabbitMQ: 5672 (UI: 15672)

---

## Troubleshooting

- If a port is in use, check for existing containers or processes.
- Use `docker compose logs <service>` for debugging.
- For environment variable issues, check `.env` files in each service.

---

## Admin Microservice Integration (2025-06-09)

- Az admin service mostantól teljesen konténerizált, saját Postgres DB-t, Prisma-t, Redis-t és RabbitMQ-t használ.
- Production és dev mód támogatott (hot reload, volume mount dev módban).
- docker-compose.yml-ben külön blokk: postgres_admin, admin, admin_dev.
- Prisma schema és kliens generálva, minden dependency telepítve.

---

## TypeORM, Prisma, Redis – Hybrid Stack Decision (2025-06-09)

- The backend currently uses a hybrid of TypeORM and Prisma. TypeORM and @nestjs/typeorm are still required for core modules (users, posts, comments, admin, league, auth, etc.).
- Removing TypeORM is not feasible without a full migration to Prisma, which is a major future task.
- **Decision:** Keep TypeORM and @nestjs/typeorm for now. Use `redis@4.7.1` everywhere for compatibility. Documented in `BACKEND_PROGRESS.md` and changelog.
- All Docker Compose builds and service starts tested with this stack; no critical dependency errors remain.
- Deprecation warnings (rimraf, glob, superagent, eslint, etc.) do not block builds, but root dev dependencies should be updated in the future.
- Continue to use `upgrade-nest.sh` for dependency management, ensuring redis@4.7.1 is used.
- Plan a phased migration to Prisma-only if desired in the future.

_Last updated: 2025-06-09 by GitHub Copilot_

---

## See Also

- `README.md` (project root)
- `docs/implementation-reports/BACKEND_PROGRESS.md`
- `docs/implementation-reports/FRONTEND_PROGRESS.md`
- `docs/project-management/CHANGE_LOG_20250609.md`

---

## NestJS fejlesztői Dockerfile minta

Minden backend_new mikroszolgáltatás fejlesztői Dockerfile-jában a Nest CLI globálisan telepítve van:

```dockerfile
RUN npm install --legacy-peer-deps && npm install -g @nestjs/cli
```

Ez biztosítja, hogy a `nest` parancs minden dev konténerben elérhető, így a hot reload (`npm run start:dev`) és a fejlesztői workflow hibamentesen működik.

Ha új mikroszolgáltatást hozol létre, ezt a mintát kövesd a Dockerfile dev szakaszában!
