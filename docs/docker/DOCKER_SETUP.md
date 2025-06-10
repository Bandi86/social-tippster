# Docker Setup Guide - Social Tippster Microservices

## [2025-06-10] API Gateway prefix és DB tisztítás

- Az API Gateway route prefix javítva: megszűnt a dupla `/api/api` Swagger és endpoint útvonalakban, mostantól minden végpont helyesen `/api/...` formátumú.
- Prisma, saját adatbázis és minden kapcsolódó környezeti változó eltávolítva az API Gateway-ből.
- Docker Compose-ból törölve a `postgres_api_gateway` service és minden hivatkozás.
- Dockerfile-ból törölve a Prisma-ra vonatkozó build lépés.

## [2025-06-10] API Gateway adatbázis eltávolítás

- Az API Gateway-hez tartozó Postgres konténer (postgres_api_gateway) törölve lett a docker-compose.yml-ből.
- Az API Gateway .env file-jaiból minden adatbázisra vonatkozó környezeti változó eltávolítva.
- Mostantól az API Gateway nem használ saját adatbázist, csak Redis-t, RabbitMQ-t és a többi mikroszervizt.

## Adatbázis kérdés - FONTOS!

**Az adatbázisokat UTÁNA kell létrehozni, nem előtte!**

A Docker konténerek automatikusan létrehozzák az adatbázisokat az environment változók alapján, amikor elindulnak. **NEM kell** manuálisan pgAdminban létrehozni őket.

## Port konfigurációk javítva

A következő port problémákat javítottuk:

### Javított portok:

- **tipp service**: `3005` → `3006` (main.ts és docker-compose.yml)
- **data service**: `3007` → `3009` (main.ts és docker-compose.yml)

### Teljes port lista:

- API Gateway: 3000
- Auth: 3001
- User: 3003
- Post: 3004
- Stats: 3005
- Tipp: 3006 ✅ (javítva)
- Notifications: 3007
- Chat: 3008
- Data: 3009 ✅ (javítva)
- Image: 3010
- Live: 3011
- Log: 3012
- Admin: 3013

## Docker Compose javítások

### 1. PORT environment változók

- Minden szolgáltatáshoz hozzáadva explicit `PORT` environment változó
- Production és development verzióknál is

### 2. Admin dev szolgáltatás

- Hozzáadva az `admin_dev` szolgáltatás, ami hiányzott
- Teljes környezeti változó konfiguráció

### 3. Adatbázis kapcsolatok

- Minden szolgáltatás saját PostgreSQL adatbázissal
- Különböző portok: 5433-5445
- Különböző felhasználók és adatbázisnevek

## Indítási parancsok

### Production mód:

```bash
cd backend_new
docker compose up --build
```

### Development mód (hot reload):

```bash
cd backend_new
docker compose -f docker-compose.yml up --build api-gateway_dev auth_dev user_dev post_dev stats_dev tipp_dev notifications_dev chat_dev data_dev image_dev live_dev log_dev admin_dev frontend_new_dev
```

### Egy-egy szolgáltatás indítása:

```bash
# Csak auth service dev módban
docker compose up --build auth_dev

# Csak postgres és redis
docker compose up --build postgres_auth redis

# Minden postgres adatbázis
docker compose up --build postgres_auth postgres_user postgres_post postgres_stats postgres_tipp postgres_notifications postgres_chat postgres_data postgres_image postgres_live postgres_log postgres_admin
```

## Szolgáltatás URLs

### API Endpoints:

- API Gateway: http://localhost:3000/api
- Auth Service: http://localhost:3001/api
- User Service: http://localhost:3003/api
- Post Service: http://localhost:3004/api
- Stats Service: http://localhost:3005/api
- Tipp Service: http://localhost:3006/api
- Notifications: http://localhost:3007/api
- Chat Service: http://localhost:3008/api
- Data Service: http://localhost:3009/api
- Image Service: http://localhost:3010/api
- Live Service: http://localhost:3011/api
- Log Service: http://localhost:3012/api
- Admin Service: http://localhost:3013/api

### Swagger dokumentáció:

- API Gateway: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001/api/docs
- ... (minden service-hez)

### Frontend:

- Frontend: http://localhost:3002

### Infrastruktúra:

- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### PostgreSQL adatbázisok:

- Auth DB: localhost:5434
- User DB: localhost:5435
- Post DB: localhost:5436
- Stats DB: localhost:5437
- Tipp DB: localhost:5438
- Notifications DB: localhost:5439
- Chat DB: localhost:5440
- Data DB: localhost:5441
- Image DB: localhost:5442
- Live DB: localhost:5443
- Log DB: localhost:5444
- Admin DB: localhost:5445

## Hibakeresés

### Logs ellenőrzése:

```bash
# Minden szolgáltatás logja
docker compose logs -f

# Egy szolgáltatás logja
docker compose logs -f auth_dev

# PostgreSQL logok
docker compose logs -f postgres_auth
```

### Konténerek állapota:

```bash
# Futó konténerek
docker compose ps

# Összes konténer
docker compose ps -a
```

### Újraindítás:

```bash
# Minden leállítása
docker compose down

# Volumes törlése (adatbázis reset)
docker compose down -v

# Újraépítés
docker compose up --build
```

## Troubleshooting

### Port foglalt hiba:

Ha port foglalt hibát kapsz, ellenőrizd:

```bash
netstat -an | findstr :3001
```

### Adatbázis kapcsolat hiba:

1. Ellenőrizd hogy a postgres konténer fut-e
2. Nézd meg a postgres logokat
3. Ellenőrizd az environment változókat

### Build hibák:

1. Törölj minden Docker cache-t: `docker system prune -a`
2. Építsd újra: `docker compose build --no-cache`

## Következő lépések

1. Indítsd el a teljes stacket: `docker compose up --build`
2. Várj míg minden szolgáltatás elindul (1-2 perc)
3. Ellenőrizd a health endpoint-okat
4. Nyisd meg a frontend-et: http://localhost:3002
5. Teszteld az API-kat a Swagger felületen

**Megjegyzés**: Az első indítás tovább tart, mert letölti a Docker image-eket és felépíti a szolgáltatásokat.

## Fejlesztőbarát Dockerfile minta (NestJS dev környezethez)

A fejlesztői (dev) Dockerfile szakasz minden mikroszolgáltatásnál tartalmazza a Nest CLI globális telepítését, így a `nest` parancs minden dev konténerben elérhető, a hot reload (`start:dev`) hibamentesen működik.

**Példa fejlesztői szakasz:**

```dockerfile
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
COPY src ./src
COPY prisma ./prisma
# Függőségek és Nest CLI telepítése
RUN npm install --legacy-peer-deps && npm install -g @nestjs/cli
EXPOSE <PORT>
CMD ["npm", "run", "start:dev"]
```

- Ez minden backend_new/services/\*/Dockerfile-ban implementálva lett.
- A fejlesztői konténerekben így a `nest` parancs mindig elérhető, a hot reload stabil.
- Ha új mikroszolgáltatást hozol létre, ezt a mintát kövesd!
