# Modern JWT + HttpOnly Refresh Token + Szerveroldali Session Auth Minta (NestJS + Prisma)

Ez a dokumentum lépésről lépésre végigvezet egy biztonságos, szerveroldali session trackinget használó JWT alapú authentikációs rendszer megvalósításán **NestJS** backenddel és **Prisma** ORM-mel.
A minta támogatja:

- Token rotációt
- Session expiry-t
- Forced logout-ot
- Device fingerprinting-et
- Edge case-ek kezelését

---

## 1. **Session Prisma séma**

A session táblát a következőképp bővítsd:

```prisma
model Session {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  token      String   @unique
  ipAddress  String?
  userAgent  String?
  isValid    Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  rotatedAt  DateTime?
  expiresAt  DateTime
}
```

**File:**
`prisma/schema.prisma`

---

## 2. **Token generálás és ellenőrzés**

**File:**
`backend/src/auth/jwt.util.ts`

```typescript
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as { userId: string };
  } catch {
    return null;
  }
};
```

---

## 3. **Session service – session CRUD és token rotáció**

**File:**
`backend/src/auth/session.service.ts`

- Session létrehozás (login/refresh)
- Token rotáció (refresh endpoint)
- Session érvénytelenítés (logout/forced logout)
- Device/IP/userAgent mentése

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string,
) {
  return prisma.session.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function invalidateSession(token: string) {
  return prisma.session.updateMany({
    where: { token },
    data: { isValid: false },
  });
}

export async function rotateSession(oldToken: string, newToken: string) {
  return prisma.session.updateMany({
    where: { token: oldToken, isValid: true },
    data: { token: newToken, rotatedAt: new Date() },
  });
}
```

---

## 4. **Auth Guards – access és refresh token ellenőrzés**

**File:**
`backend/src/auth/guards/access-token.guard.ts`
`backend/src/auth/guards/refresh-token.guard.ts`

- **AccessTokenGuard**: csak JWT access token-t ellenőriz (stateless)
- **RefreshTokenGuard**: JWT refresh token + session DB ellenőrzés (isValid, expiry, IP, userAgent)

---

## 5. **Auth Controller – endpointok**

**File:**
`backend/src/auth/auth.controller.ts`

- `/auth/login` – access + refresh token kiadása, session létrehozás
- `/auth/refresh` – refresh token ellenőrzés, új tokenek, session rotáció
- `/auth/logout` – session érvénytelenítés

---

## 6. **Frontend Auth Flow (Next.js)**

- Csak az access tokent kezeli (pl. Zustand store)
- Refresh token HttpOnly cookie-ban, automatikus session management
- Auth store: `/frontend/src/store/auth.ts`

---

## 7. **Edge case-ek és biztonsági javaslatok**

- **Token reuse detection**: ha egy refresh tokent többször használnak, minden session-t érvényteleníteni kell az adott usernél.
- **Forced logout**: admin vagy user által bármikor érvényteleníthető a session.
- **Device/session lista**: user láthatja aktív sessionjeit, ki tud jelentkezni eszközről.

---

## 8. **Tesztelés**

- Minden auth/session logikához írj teszteket:
  `tests/backend/auth/`
- Futtatás:
  ```bash
  npm run test:auth:run
  ```

---

## 9. **Dokumentáció és naplózás**

- Frissítsd a következő dokumentumokat:
  - `docs/implementation-reports/AUTHENTICATION.md`
  - `docs/implementation-reports/BACKEND_PROGRESS.md`
  - `docs/project-management/CHANGE_LOG_YYYYMMDD.md` (pl. mai nap)

---

## 10. **Ajánlott fájlstruktúra**

```
backend/
  src/
    auth/
      auth.controller.ts
      auth.service.ts
      session.service.ts
      jwt.util.ts
      guards/
        access-token.guard.ts
        refresh-token.guard.ts
frontend/
  src/
    store/
      auth.ts
prisma/
  schema.prisma
tests/
  backend/
    auth/
      session.spec.ts
      auth-flow.spec.ts
docs/
  implementation-reports/
    AUTHENTICATION.md
    BACKEND_PROGRESS.md
  project-management/
    CHANGE_LOG_YYYYMMDD.md
```

---

## 11. **Lépésről lépésre összefoglaló**

1. **Prisma séma frissítése**
2. **Session service és JWT util implementálása**
3. **Guardok létrehozása**
4. **Auth controller endpointok**
5. **Frontend auth store kialakítása**
6. **Tesztelés**
7. **Dokumentáció frissítése**

---

> **Tipp:** Mindig kövesd a projekt dokumentációs és tesztelési szabályait!
> Ha elakadsz, nézd meg a `docs/implementation-reports/AUTHENTICATION.md`-t vagy kérj segítséget.
