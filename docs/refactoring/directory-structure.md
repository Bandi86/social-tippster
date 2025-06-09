<!-- filepath: c:\Users\bandi\Documents\code\social-tippster\social-tippster\docs\refactoring\directory-structure.md -->

# Mikroszervizes Projekt Könyvtárstruktúra

Ez a dokumentum a projekt mikroszervizes architektúrára való átállása során javasolt könyvtárstruktúrát vázolja fel. A cél egy tiszta, jól szervezett és skálázható struktúra kialakítása, ahol minden mikroszerviz önálló egységként kezelhető.

## Javasolt Gyökér Struktúra

A jelenlegi `frontend` és `backend` gyökérmappák megmaradnak. A fő változások a `backend` mappán belül történnek.

```text
social-tippster/
├── backend/
│   ├── services/                 # ÚJ: Minden mikroszerviz itt kap helyet
│   │   ├── api-gateway/          # API Gateway (lehet NestJS vagy más technológia)
│   │   │   ├── src/
│   │   │   ├── Dockerfile
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── auth-service/         # Auth Mikroszerviz
│   │   │   ├── src/              # A jelenlegi backend/src/modules/auth tartalma ide kerülhet
│   │   │   ├── Dockerfile
│   │   │   ├── package.json      # Saját függőségek
│   │   │   └── tsconfig.json
│   │   ├── user-service/         # User Mikroszerviz
│   │   │   ├── src/
│   │   │   ├── Dockerfile
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── post-service/         # Post Mikroszerviz
│   │   │   └── ... (hasonló struktúra)
│   │   ├── tipp-service/
│   │   │   └── ...
│   │   ├── comment-service/
│   │   │   └── ...
│   │   ├── notification-service/
│   │   │   └── ...
│   │   ├── upload-service/       # Lehet, hogy az Upload/Image együttesen
│   │   │   └── ...
│   │   ├── image-analysis-service/
│   │   │   └── ...
│   │   └── ... (további szervizek)
│   │
│   ├── libs/                     # OPCIONÁLIS: Közös könyvtárak, DTO-k, segédfüggvények
│   │   ├── common-dtos/
│   │   │   └── src/
│   │   │   └── package.json
│   │   └── shared-utils/
│   │       └── src/
│   │       └── package.json
│   │
│   ├── Dockerfile                # Eredeti Dockerfile (lehet, hogy módosul vagy törlődik)
│   ├── nest-cli.json             # Eredeti (lehet, hogy módosul vagy törlődik)
│   ├── package.json              # Eredeti (valószínűleg a dev szerver indítására marad)
│   ├── tsconfig.build.json       # Eredeti
│   ├── tsconfig.json             # Eredeti
│   └── src/                      # Eredeti monolit forráskódja (fokozatosan kiürül)
│       ├── main.ts               # A monolit belépési pontja (fokozatosan csökken a szerepe)
│       ├── app.module.ts         # A monolit fő modulja
│       └── modules/              # A meglévő modulok (ezek kerülnek át a szervizekbe)
│           ├── auth/
│           ├── users/
│           └── ...
│
├── frontend/
│   └── ... (marad a jelenlegi struktúra)
│
├── docs/
│   ├── refactoring/
│   │   ├── starting-points.md
│   │   └── directory-structure.md  # Ez a fájl
│   └── ...
│
├── docker-compose.yml            # Itt kell majd definiálni az új szervizeket
├── package.json                  # Gyökér package.json (marad)
└── ...
```

## Részletes Magyarázat

### 1. `backend/services/` Mappa

Ez lesz a központi könyvtár az összes új mikroszerviz számára. Minden egyes önállóan telepíthető és futtatható szerviz (pl. `auth-service`, `user-service`, `api-gateway`) itt kap egy saját almappát.

### 2. Egyes Mikroszervizek Struktúrája (`backend/services/<service-name>/`)

Minden egyes `<service-name>` mappa egy önálló alkalmazásként (valószínűleg NestJS projektként, de lehet más technológia is) funkcionál:

- **`src/`**: A szerviz specifikus forráskódja. Az átállás során a monolit `backend/src/modules/` megfelelő moduljainak tartalma kerülhet ide, refaktorálás után.
- **`package.json`**: A szerviz saját, elkülönített függőségei. Ez biztosítja, hogy a szervizek függetlenül fejleszthetők és telepíthetők legyenek.
- **`Dockerfile`**: A szerviz konténerizálásához szükséges definíció.
- **`tsconfig.json`, `nest-cli.json` (NestJS esetén)**: Build és fejlesztési konfigurációk.
- **`.env.example`**: Környezeti változók sablonja.

### 3. API Gateway (`backend/services/api-gateway/`)

Ez a szerviz felel a külső kérések fogadásáért, authentikációért, autorizációért, és a kérések megfelelő mikroszervizekhez történő továbbításáért. Lehet NestJS alapú, vagy dedikált API Gateway technológia (pl. Kong, NGINX, Traefik, vagy felhőszolgáltatók saját megoldásai).

### 4. Közös Könyvtárak (`backend/libs/` - Opcionális, Megfontolandó)

Ha több mikroszerviz által használt közös kód (pl. DTO-k, segédfüggvények, interfészek, adatbázis sémák) merül fel, azok itt helyezhetők el, és lokális csomagként importálhatók a szervizekbe.

- **Megfontolandó:** A túlzott közös kód szoros csatolást eredményezhet a szervizek között, ami ellentmond a mikroszervizes elveknek. Alternatívaként ezek privát npm csomagként is kezelhetők, vagy kezdetben a kódduplikáció elfogadhatóbb lehet, és csak később, a közös mintázatok kikristályosodásával érdemes kiszervezni.

### 5. Eredeti `backend/src/` és `backend/package.json`

- A `backend/src/modules/` tartalma fokozatosan migrálódik az új mikroszervizek `src/` mappáiba.
- Az eredeti `backend/src/` mappa és annak tartalma (pl. `main.ts`, `app.module.ts`) az átállás végére kiürülhet vagy teljesen eltávolítható, ahogy a monolit funkcionalitása átkerül a mikroszervizekbe.
- Az eredeti `backend/package.json` szerepe is csökken. Hosszú távon a `backend` gyökérmappa `package.json`-je inkább a workspace szintű feladatokra (pl. monorepo eszközökkel történő buildelés, tesztelés koordinálása) fókuszálhat, vagy teljesen feleslegessé válhat, ha minden szerviz saját `package.json`-nel rendelkezik.

### 6. `docker-compose.yml`

Ezt a fájlt jelentősen át kell alakítani. Minden új mikroszervizt és az API Gateway-t külön `service`-ként kell definiálni a `docker-compose.yml`-ben. Meg kell adni:

- A build kontextusukat (az új `Dockerfile`-okra mutatva az egyes szervizmappákban).
- Szükséges portokat.
- Környezeti változókat.
- Hálózati beállításokat (pl. közös hálózat a szervizek közötti kommunikációhoz).
- Függőségeket (pl. adatbázisok, Redis, RabbitMQ).

## Átállási Stratégia és Fájlok Mozgatása

Az átállást inkrementálisan, lépésről lépésre javasolt végrehajtani:

1.  **Új Struktúra Létrehozása:** Hozd létre a `backend/services/` mappát és az elsőként leválasztandó szerviz(ek) almappáit (pl. `backend/services/auth-service/`).
2.  **Első Szerviz Kialakítása és Migrálása:**
    - **Inicializálás:** Hozz létre egy új, üres NestJS (vagy más választott technológiájú) projektet a szerviz mappájában (pl. `backend/services/auth-service/`).
    - **Kód Átemelése:** Másold át a releváns logikát, entitásokat, DTO-kat a monolit megfelelő moduljából (pl. `backend/src/modules/auth/`) az új szerviz `src/` mappájába.
    - **Függőségek:** Add hozzá a szervizspecifikus függőségeket az új szerviz `package.json` fájljához.
    - **Konfiguráció:** Készítsd el a szükséges konfigurációs fájlokat (`Dockerfile`, `.env` stb.).
    - **Refaktorálás:** Módosítsd az importokat. A monolitikus függőségeket (pl. más modulok direkthasználata) cseréld le API hívásokra (ha szinkron kommunikáció szükséges az API Gateway-en keresztül vagy közvetlenül más szervizzel) vagy üzenetküldésre (RabbitMQ-n keresztül aszinkron műveletekhez).
3.  **API Gateway Integráció:** Konfiguráld az API Gateway-t, hogy az adott funkcionalitáshoz tartozó kéréseket az új mikroszervizhez irányítsa.
4.  **Monolit Karcsúsítása:** Miután egy szerviz sikeresen működik önállóan és integrálva van az API Gateway-en keresztül, távolítsd el a megfelelő modult és annak hivatkozásait az eredeti `backend/src/modules/` mappából és a monolit fő moduljából (`app.module.ts`).
5.  **`docker-compose.yml` Frissítése:** Add hozzá az új szervizt a `docker-compose.yml`-hez.
6.  **Tesztelés:** Alaposan teszteld az új szervizt önmagában és az API Gateway-en keresztül is.
7.  **Iteráció:** Ismételd meg a 2-6. lépéseket a többi leválasztandó modullal.

## Monorepo Eszközök (Opcionális, de Javasolt)

Nagyobb számú mikroszerviz esetén (már 3-4 szerviznél is hasznos lehet) érdemes monorepo menedzsment eszközök (pl. **Nx**, Lerna, Turborepo) bevezetését megfontolni. Ezek segítenek:

- Egységes build, tesztelési és lintelési parancsok futtatásában.
- Függőségek hatékonyabb kezelésében.
- Kódmegosztás egyszerűsítésében (pl. a `libs` mappa tartalmának kezelése).
- Gyorsabb CI/CD folyamatok kialakításában (pl. csak az érintett szervizek újraépítése).

Ez a struktúra és átállási stratégia segít a projekt fokozatos és ellenőrzött átalakításában egy modernebb, skálázhatóbb és könnyebben karbantartható mikroszervizes architektúrára.

_Utolsó frissítés: 2025-06-09_
