# CHANGE LOG – 2025-05-31

## Élő meccsek API és sport típus integráció javítása

**Task Type:** Bug Fix, Data Model Update
**Time:** 2025-05-31

### Változások:

- League entitás bővítése sport_type mezővel (enum: football, basketball, tennis, baseball)
- /matches/live endpoint javítása: sport mező mostantól a League.sport_type alapján töltődik ki
- Seed script frissítése: sport_type helyes beállítása ligák létrehozásakor
- Frontend és backend LiveMatch típusok teljesen szinkronban
- Hibás hardcode-olt sport mező megszüntetése

### Tesztelés:

- Ellenőrizve, hogy a főoldali élő meccsek modul helyesen jeleníti meg a sport típusát
- Seed script futtatása után minden ligához helyes sport_type kerül

### Dokumentáció:

- Frissítve: API.md, BACKEND_PROGRESS.md, DB.md

---

**Responsible:** GitHub Copilot
**Date:** 2025-05-31
