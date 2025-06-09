# Mikroszervizes Átállás Tervezési Kiindulópontok

A projekt mikroszervizes architektúrára való átalakítása jelentős lépés a skálázhatóság, a teljesítmény és a karbantarthatóság javítása felé. Ez a dokumentum egy lehetséges megközelítést vázol fel, figyelembe véve a jelenlegi rendszert és a felmerült technológiai igényeket (Redis, RabbitMQ, Socket.IO), valamint az authentikáció újragondolását.

## 1. Mikroszerviz Stratégia és Jelöltek

A jelenlegi moduláris felépítés (`backend/src/modules/`) kiváló kiindulási alapot biztosít. A `docs/project-management/POST_MODULE_REFACTORING_PLAN_20250605.md` dokumentumban tervezett modul szétválasztás (Posts, Tipps, Uploads, Image Analysis, Comments) tovább erősíti ezt az irányt.

### Potenciális Mikroszervizek Részletezése:

- **Auth Szerviz (Authentication Service):**
  - **Felelősségek:** Felhasználói regisztráció, bejelentkezés, kijelentkezés, jelszókezelés (reset, változtatás), access és refresh tokenek kiadása, tokenek validálása és frissítése.
  - **Alapja:** A jelenlegi `AuthService` (`backend/src/modules/auth/auth.service.ts`) logikája.
  - **Technológiák:** JWT, biztonságos jelszó hash-elés (pl. bcrypt).
- **User Szerviz (User Service):**
  - **Felelősségek:** Felhasználói profilok létrehozása, olvasása, frissítése, törlése (CRUD), felhasználói beállítások, jogosultságok és szerepkörök kezelése (ha nem az Auth Szerviz része).
  - **Interakciók:** Szorosan együttműködik az Auth Szervizzel.
- **Post Szerviz (Post Service):**
  - **Felelősségek:** Általános posztok létrehozása, kezelése, listázása, keresése. A `PostsService` (`backend/src/modules/posts/posts.service.ts`) egyszerűsített változata a refaktor terv szerint.
  - **Kapcsolódó entitások:** Kategóriák, címkék kezelése.
- **Tipp Szerviz (Tipp Service):**
  - **Felelősségek:** Tipp-specifikus logika, tippek létrehozása, eredmények rögzítése, statisztikák generálása, tippekhez kapcsolódó események kezelése.
  - **Adatbázis:** Saját adatmodell a tippek és eredményeik tárolására.
- **Comment Szerviz (Comment Service):**
  - **Felelősségek:** Hozzászólások létrehozása, moderálása, listázása posztokhoz vagy tippekhez kapcsolódóan.
  - **Funkciók:** Válaszadás, értékelés (like/dislike).
- **Notification Szerviz (Notification Service):**
  - **Felelősségek:** Felhasználói értesítések generálása és kézbesítése (pl. új komment, tipp eredménye, rendszerüzenetek). A meglévő notifikációs logika alapján.
  - **Integráció:** Socket.IO a valós idejű értesítésekhez, RabbitMQ az aszinkron események fogadásához.
- **Upload/Image Szerviz (Upload/Image Service):**
  - **Felelősségek:** Fájlfeltöltések kezelése (képek, videók, egyéb dokumentumok), alapvető képfeldolgozás (átméretezés, vágás, formátum konverzió), metaadatok kinyerése.
  - **Tárolás:** Integráció felhő alapú tárolókkal (pl. AWS S3, Azure Blob Storage) vagy helyi fájlrendszerrel.
- **Image Analysis Szerviz (Image Analysis Service):**
  - **Felelősségek:** Fejlettebb képelemzési feladatok, mint például objektumfelismerés, OCR (optikai karakterfelismerés), tartalom moderálás (pl. NSFW szűrés). A refaktor terv szerint.
  - **Technológiák:** Külső AI/ML szolgáltatások (pl. Google Vision AI, AWS Rekognition) vagy saját modellek integrálása.

## 2. Kommunikáció és API Gateway

A mikroszervizek közötti hatékony és biztonságos kommunikáció kulcsfontosságú.

- **API Gateway:**
  - **Szerepe:** Egyetlen, központi belépési pont a kliensalkalmazások (frontend, mobil) számára.
  - **Feladatai:**
    - Kérések továbbítása (Request Routing) a megfelelő mikroszervizekhez.
    - Authentikáció és Autorizáció: Bejövő tokenek validálása, jogosultságok ellenőrzése.
    - Rate Limiting és Throttling: Túlterhelés elleni védelem.
    - Caching: Gyakori válaszok gyorsítótárazása.
    - Request/Response transzformációk.
    - Load Balancing: Terheléselosztás a szerviz instanciák között.
    - Logging és Monitoring: Központi naplózás és metrikák gyűjtése.
  - **Implementációs lehetőségek:** Kong, NGINX, Express Gateway, vagy felhőszolgáltatók saját API Gateway megoldásai (pl. AWS API Gateway, Azure API Management).
- **Szervizek Közötti Kommunikáció:**
  - **Szinkron Kommunikáció:**
    - **REST API-k (HTTP/HTTPS):** Egyszerű, elterjedt, jól skálázható. Alkalmas CRUD műveletekre és kérés-válasz alapú interakciókra.
    - **gRPC:** Nagy teljesítményű, bináris protokoll, Protocol Buffers alapú séma definícióval. Hatékonyabb lehet a belső szerviz-szerviz kommunikációra, különösen ha a teljesítmény kritikus.
  - **Aszinkron Kommunikáció (RabbitMQ):**
    - **Eseményvezérelt Architektúra (Event-Driven Architecture):** A szervizek eseményeket publikálnak és iratkoznak fel rájuk, így lazán csatolódnak.
    - **Felhasználási esetek:**
      - Értesítések küldése (pl. új poszt létrehozásakor a Post Szerviz eseményt küld, amire a Notification Szerviz feliratkozik).
      - Hosszú ideig futó feladatok delegálása (pl. képfeldolgozás, riport generálás).
      - Adatkonzisztencia biztosítása több szerviz között (eventual consistency).
    - **Előnyök:** Skálázhatóság, hibatűrés, a szervizek függetlenségének növelése.

## 3. Technológiai Integrációk

A kiválasztott technológiák integrálása a mikroszervizes architektúrába.

- **Redis:**
  - **Caching:**
    - **Adatbázis lekérdezések eredményeinek gyorsítótárazása:** Csökkenti az adatbázis terhelését és gyorsítja a válaszidőket.
    - **Felhasználói munkamenetek (Sessions):** Bár a JWT refresh token HttpOnly cookie-s megoldás (`docs/auth/AUTHENTICATION.md`) az elsődleges, Redis használható alternatív vagy kiegészítő session tárolásra, ha szükséges.
    - **Gyakran használt adatok:** Pl. felhasználói profilok, konfigurációs adatok, népszerű posztok.
  - **Rate Limiting:** API Gateway szinten vagy egyes kritikus szervizekben a kérések számának korlátozása.
  - **Leaderboards/Statisztikák:** Valós idejű ranglisták, számlálók, analitikák (pl. legaktívabb felhasználók, legnépszerűbb tippek).
  - **Message Broker (alternatíva RabbitMQ-hoz kisebb igények esetén):** Redis Pub/Sub funkciója egyszerűbb eseménykezelésre.
- **RabbitMQ:**
  - **Feladat Várólisták (Task Queues):** Hosszabb ideig tartó, erőforrás-igényes műveletek (pl. videó kódolás, komplex riport generálás, tömeges email küldés) háttérben történő, aszinkron futtatása. A kliens azonnali választ kap, a feladat később fejeződik be.
  - **Eseményvezérelt Architektúra:** Lásd fentebb a "Szervizek Közötti Kommunikáció" résznél.
  - **Work Queues:** Terheléselosztás a worker instanciák között.
- **Socket.IO:**
  - **Valós Idejű Funkciók:**
    - Azonnali értesítések a kliensek felé (pl. új üzenet, új komment, tipp eredményének frissülése) a `docs/frontend/implement-notifications-to-frontend.md` terv alapján.
    - Élő chat funkciók.
    - Valós idejű adatfrissítések a felhasználói felületen (pl. sportesemények állásának követése).
  - **Integráció:** Dedikált Notification Szerviz vagy API Gateway komponens kezelheti a Socket.IO kapcsolatokat.

## 4. Authentikáció Újragondolása Mikroszervizes Környezetben

A jelenlegi JWT-alapú authentikáció (`docs/auth/AUTHENTICATION.md`) erős alap. A "session" említése valószínűleg a HttpOnly cookie-ban tárolt refresh tokenre utal, ami egy bevett és biztonságos gyakorlat, nem klasszikus szerveroldali session.

- **Dedikált Auth Szerviz:**
  - Ez a szerviz lesz a központi felelőse a tokenek (access, refresh) kiállításának, validálásának és menedzselésének.
  - Kezeli a felhasználói hitelesítési adatokat biztonságosan.
- **API Gateway Szerepe az Authentikációban:**
  - Az API Gateway minden bejövő kérést elfog.
  - Validálja a kérésben található access tokent (általában a `Authorization` headerben) az Auth Szervizzel kommunikálva vagy egy megosztott kulcs/mechanizmus segítségével.
  - Sikeres validáció után továbbíthatja a felhasználói kontextust (pl. user ID, szerepkörök) a belső mikroszervizeknek (pl. egyedi HTTP headerben, amit csak a belső hálózatról fogadnak el a szervizek).
- **Szervizek Közötti (Service-to-Service) Authentikáció és Autorizáció:**
  - Amikor a mikroszervizek egymással kommunikálnak, nekik is szükségük lehet authentikációra és autorizációra.
  - **Mechanizmusok:**
    - **OAuth 2.0 Client Credentials Grant:** Szervizek saját azonosítóval és titokkal authentikálnak.
    - **API Kulcsok:** Egyszerűbb megoldás, de kevésbé biztonságos és rugalmas.
    - **mTLS (Mutual TLS):** Kölcsönös TLS authentikáció, ahol mindkét kommunikáló fél tanúsítvánnyal igazolja magát.
    - **Token továbbítás:** Az API Gateway által validált és esetleg átalakított tokent továbbítják a belső hívások során.
- **Refresh Token Kezelése:**
  - Továbbra is történhet HttpOnly, Secure cookie-val, amit az Auth Szerviz állít ki és az API Gateway (vagy az Auth Szerviz egy dedikált végpontja) kezel a frissítési folyamat során. Ez védi a refresh tokent az XSS támadásoktól.

## 5. Refaktorálási Stratégia: Inkrementális Megközelítés

A teljes rendszer egyszerre történő átalakítása kockázatos és időigényes. Egy fokozatos, inkrementális megközelítés javasolt.

1.  **Részletes Tervezés és Priorizálás:**
    - Készítsen részletes tervet az új architektúráról: szervizhatárok, API szerződések (pl. OpenAPI/Swagger specifikációk), adatmodellek, kommunikációs minták.
    - Hozzon létre egy új dokumentumot erre a célra, pl. `docs/technical/MICROSERVICE_ARCHITECTURE_PLAN.md`.
    - Priorizálja a szervizeket a leválasztásra az üzleti érték és a komplexitás alapján.
2.  **API Gateway Bevezetése (Strangler Fig Pattern):**
    - Kezdje egy API Gateway bevezetésével a meglévő monolit elé. Kezdetben minden kérést egyszerűen továbbít a monolitnak.
    - Ez lehetővé teszi, hogy fokozatosan "fojtsa meg" a monolitot azáltal, hogy egyesével helyezi át a funkcionalitást az új mikroszervizekbe, miközben a kliensek továbbra is az API Gateway-en keresztül érik el a rendszert.
3.  **Első Mikroszerviz(ek) Leválasztása:**
    - Válasszon ki egy-két kevésbé kritikus, jól körülhatárolható modult (pl. Uploads vagy Comments).
    - Fejlessze ki őket önálló mikroszervizként, saját adatbázissal (ha szükséges) és API-val.
    - Frissítse az API Gateway konfigurációját, hogy az ezekhez a funkcionalitásokhoz tartozó kéréseket már az új szervizekhez irányítsa.
4.  **Authentikáció Központosítása:**
    - Az Auth Szerviz kialakítása korai prioritás legyen, mivel sok más szerviz függeni fog tőle.
    - Integrálja az API Gateway-jel az authentikációs folyamatok kezelésére.
5.  **Aszinkron Kommunikáció Bevezetése:**
    - Integrálja a RabbitMQ-t azokban a folyamatokban, ahol az eseményvezérelt kommunikáció, a szervizek függetlenítése és a terhelés elosztása előnyös (pl. értesítések, háttérfeladatok).
6.  **Folyamatos Migráció és Tesztelés:**
    - Fokozatosan migrálja a többi funkcionalitást a monolitból az új vagy meglévő mikroszervizekbe.
    - Minden lépésnél alapos tesztelés szükséges:
      - **Unit tesztek:** Az egyes szervizek belső logikájához.
      - **Integrációs tesztek:** A szervizek közötti kommunikáció és adatbázis interakciók tesztelésére.
      - **Kontraktus tesztek:** Annak biztosítására, hogy a szervizek API-jai megfelelnek az elvárt szerződéseknek.
      - **End-to-End (E2E) tesztek:** A teljes felhasználói folyamatok tesztelése az API Gateway-en keresztül.
7.  **Monitoring és Logging:**
    - Vezessen be központosított logging (pl. ELK stack - Elasticsearch, Logstash, Kibana) és monitoring (pl. Prometheus, Grafana) megoldásokat a mikroszervizek állapotának és teljesítményének nyomon követésére.
8.  **Dokumentáció Folyamatos Frissítése:**
    - Minden változtatást dokumentáljon. Lásd a következő szakaszt.

## 6. Dokumentáció Frissítései (Példák)

A projekt dokumentációjának naprakészen tartása elengedhetetlen.

- **Új Architektúra Dokumentum:** `docs/technical/MICROSERVICE_ARCHITECTURE_PLAN.md` (a részletes tervvel)
- **README.md:** Frissített projekt áttekintés, az új mikroszerviz-alapú indítási és deployment útmutató.
- **`docs/implementation-reports/BACKEND_PROGRESS.md`:** Az átalakítás egyes lépéseinek, a leválasztott szervizeknek a dokumentálása.
- **`docs/implementation-reports/API.md`:** Az API Gateway konfigurációjának és az egyes mikroszervizek API-jainak részletes leírása (OpenAPI/Swagger linkekkel).
- **`docs/setup-guides/DEPLOYMENT.md`:** Az új, mikroszerviz alapú deployment folyamat leírása (pl. Docker Compose, Kubernetes).
- **`docs/technical/SECURITY.md`:** Az authentikációs és autorizációs változások, a szerviz-szerviz biztonság részletezése.
- **`docs/project-management/CHANGE_LOG_YYYYMMDD_MicroserviceRefactor.md`:** Új change log fájl a refaktorálási folyamat főbb mérföldköveivel.
- **Egyedi Szerviz Dokumentációk:** Minden mikroszerviznek lehet saját `README.md` fájlja a saját repository-jában vagy egy dedikált mappában a fő projektben, leírva annak célját, API-ját, konfigurációját és indítását.

Ez egy komplex, de rendkívül hasznos átalakítási folyamat. A meglévő tervek, mint a `docs/project-management/POST_MODULE_REFACTORING_PLAN_20250605.md`, jó alapot adnak a modulok logikai szétválasztásához.
