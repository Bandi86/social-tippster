# API Gateway – Mikroszerviz Architektúra Tervezési Terv

## 1. Cél és szerep

Az API Gateway a Social Tippster mikroszerviz architektúra központi belépési pontja. Feladata, hogy a frontend és külső kliensek minden kérését fogadja, hitelesítse, naplózza, továbbítsa a megfelelő mikroszerviz(ek) felé, és egységesen kezelje a válaszokat, hibákat, biztonsági és teljesítménybeli szempontokat.

---

## 2. Kötelező funkciók és beállítások

### 2.1. Környezeti változók (.env)

- `PORT` – API Gateway portja (pl. 3000)
- `FRONTEND_URL` – CORS engedélyezéshez
- Mikroszerviz URL-ek: `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, stb.
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_URL` – cache/rate limit
- `RABBITMQ_URL`, `RABBITMQ_HOST`, stb. – üzenetkezeléshez
- `JWT_SECRET`, `JWT_EXPIRES_IN` – token validációhoz
- `RATE_LIMIT_TTL`, `RATE_LIMIT_REQUESTS` – rate limiting

### 2.2. Middleware-ek

- **CORS**: csak engedélyezett originről jöhet kérés
- **Helmet**: biztonsági HTTP fejlécek
- **Compression**: gzip tömörítés
- **Global ValidationPipe**: DTO validáció

### 2.3. Globális prefix

- `app.setGlobalPrefix('api')` – minden endpoint `/api/...`

### 2.4. Swagger/OpenAPI

- Automatikus API dokumentáció `/api/docs` alatt

### 2.5. Rate Limiting

- `@nestjs/throttler` vagy express-rate-limit
- Védelem túlterhelés ellen

### 2.6. Proxy/Forwarding logika

- Bejövő kérések továbbítása a megfelelő mikroszervizhez
- Auth middleware: access token validáció (Auth szervizzel)

### 2.7. Healthcheck endpoint

- `/api/health` – monitoring, Docker, load balancer számára

---

## 3. Ajánlott extra funkciók

- **Centralizált logging** (request ID, correlation ID)
- **Audit log forwarding** (fontos műveletek naplózása)
- **Request/response transzformáció** (ha szükséges)
- **Egységes hibakezelés**
- **Security headers** (CSP, XSS, stb.)
- **Service discovery** (ha dinamikus a szervizek elérhetősége)
- **API versioning** (ha több verziót kell támogatni)

---

## 4. Mit NEM szabad az API Gateway-be tenni?

- Saját adatbázis (kivéve audit log, de inkább külön szerviz)
- Business logic (minden üzleti logika a mikroszervizekben legyen)
- Állapotkezelés (session, cache – inkább Redis vagy dedikált szerviz)

---

## 5. Fejlesztési lépések (javasolt sorrend)

1. **Alap NestJS projekt létrehozása** (ha még nincs)
2. **Környezeti változók beállítása**
3. **Alap middleware-ek (CORS, Helmet, Compression, ValidationPipe)**
4. **Globális prefix beállítása**
5. **Swagger dokumentáció integrálása**
6. **Proxy/forwarding logika implementálása**
7. **Rate limiting hozzáadása**
8. **Healthcheck endpoint**
9. **Egységes hibakezelés, logging**
10. **Extra funkciók (audit log, versioning, stb.)**

---

## 6. Dokumentáció és referenciák

- `docs/implementation-reports/API.md` – API Gateway változások
- `backend_new/README.md` – architektúra, route mapping
- `docs/refactoring/starting-points.md` – kommunikációs stratégia
- `docs/setup-guides/ENVIRONMENT_SETUP.md`, `DOCKER_SETUP.md` – környezet, deployment

---

## 7. Ellenőrzőlista (kész projekt esetén)

- [x] **Swagger UI helyesen mutatja az endpointokat `/api/...` prefixszel** ✅ 2025-06-10
- [x] **Minden route forwarding működik (ProxyController implementálva)** ✅ 2025-06-10
- [x] **Rate limiting aktív (ThrottlerModule beállítva)** ✅ 2025-06-10
- [x] **Healthcheck endpoint elérhető (/api/health)** ✅ 2025-06-10
- [x] **Nincs saját DB, nincs Prisma/ORM (2025-06-10 eltávolítva)** ✅ 2025-06-10
- [x] **Biztonsági fejlécek, CORS, compression aktív** ✅ 2025-06-10
- [x] **Egységes hibakezelés, logging (GlobalExceptionFilter, LoggingInterceptor)** ✅ 2025-06-10
- [x] **Docker-ben futtatható és health check-el ellátva** ✅ 2025-06-10
- [ ] **Token validáció Auth szervizzel (Auth szerviz implementálásra vár)**
- [ ] **Redis cache integrálás (egyszerűsített in-memory cache használatban)**
- [ ] **RabbitMQ integráció (előkészítve, de mikroszervizek implementálásra várnak)**

---

## 8. Implementálási összefoglaló (2025-06-10)

### ✅ Elkészült funkciók

**Alapinfrastruktúra:**

- NestJS-alapú API Gateway architektúra ✅
- Docker support teljes konfigurációval ✅
- Környezeti változók (.env) teljes beállítása ✅
- TypeScript konfiguráció és build pipeline ✅

**Biztonsági réteg:**

- Helmet security headers ✅
- CORS konfiguráció ✅
- Rate limiting (ThrottlerModule) ✅
- Globális input validáció (ValidationPipe) ✅

**Proxy/Forwarding logika:**

- ProxyController minden mikroszervizhez ✅
- ProxyService fejlett hibakezeléssel ✅
- Request correlation ID tracking ✅
- Service availability monitoring ✅

**Monitoring és dokumentáció:**

- Swagger/OpenAPI dokumentáció ✅
- Health check endpoints (/api/health, /api/health/services) ✅
- Strukturált logging (LoggingInterceptor) ✅
- Globális hibakezelés (GlobalExceptionFilter) ✅

**Teljesítmény:**

- Gzip compression ✅
- Request/response interceptor ✅
- Timeout kezelés (30s) ✅

### 🔄 Következő lépések

1. **Auth Service implementálása** - Token validáció befejezéséhez
2. **User Service implementálása** - Felhasználókezelés
3. **Redis cache integrálás** - Production-ready caching
4. **RabbitMQ message queues** - Aszinkron kommunikáció
5. **Monitoring dashboard** - Metrics és alerting

### 📊 Tesztelési eredmények

```bash
# Health check: ✅ SIKERES
curl http://localhost:3000/api/health
# Response: {"status":"ok","timestamp":"2025-06-10T11:37:08.815Z","service":"api-gateway","version":"1.0.0"}

# Swagger docs: ✅ ELÉRHETŐ
curl http://localhost:3000/api/docs
# HTTP 200 OK

# Docker status: ✅ FUTÓ
docker ps | grep api-gateway
# api-gateway_dev running on 0.0.0.0:3000->3000/tcp
```

---

_Frissítve: 2025-06-10 (Copilot Chat)_
