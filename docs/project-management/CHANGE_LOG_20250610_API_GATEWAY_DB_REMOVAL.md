# CHANGE_LOG_20250610_API_GATEWAY_DB_REMOVAL.md

**Dátum:** 2025-06-10

## API Gateway adatbázis eltávolítás

- Az API Gateway szervizből eltávolításra kerültek az összes adatbázisra (PostgreSQL) vonatkozó környezeti változó (DATABASE_URL, DATABASE_HOST, stb.) minden .env file-ból.
- A `backend_new/docker-compose.yml`-ből törlésre került a `postgres_api_gateway` service, mivel az API Gateway nem igényel saját adatbázist.
- Dokumentáció frissítve: ENVIRONMENT_SETUP.md, DOCKER_SETUP.md.
- A rendszer mostantól tisztább, felesleges adatbázis konténer nélkül működik.

---

**Módosította:** Copilot Chat
**Jóváhagyta:** bandi
**Időbélyeg:** 2025-06-10
