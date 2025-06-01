# CHANGE_LOG_20250530_SEEDDATA.md

## [2025-05-30] Seed Data Bővítés

- Jelentősen bővítve lett a seed script (`backend/src/database/seed.ts`):
  - Minden posthoz legalább 7 változatos komment generálódik, több szerzőtől.
  - Minden posthoz 2-3 nested (válasz) komment is készül, így a kommentrendszer tesztelése valósághűbb.
  - A kommentek tartalma változatos, magyar és angol példamondatokkal.
- A változtatás célja, hogy a fejlesztés és tesztelés során minden funkció (kommentelés, válasz, szavazás) bőséges tesztadattal rendelkezzen.
- A seed script futtatása továbbra is: `npx ts-node backend/src/database/seed.ts`

**Készítette:** Copilot Chat, 2025-05-30
