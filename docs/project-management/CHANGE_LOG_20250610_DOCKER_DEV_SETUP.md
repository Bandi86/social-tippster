# CHANGE LOG – 2025-06-10: Docker fejlesztői környezet fejlesztés

## Lényeges változások

- Minden backend_new mikroszolgáltatás fejlesztői Dockerfile-jába bekerült a Nest CLI globális telepítése (`npm install -g @nestjs/cli`).
- Ez biztosítja, hogy a `nest` parancs minden dev konténerben elérhető, így a hot reload (`npm run start:dev`) és a fejlesztői workflow hibamentesen működik.
- A fejlesztői Dockerfile szakasz mindenhol egységes, új mikroszolgáltatásnál is ezt a mintát kell követni.
- Dokumentáció frissítve: `backend_new/DOCKER_SETUP.md` és `docs/setup-guides/ENVIRONMENT_SETUP.md`.

## Miért fontos?

- A fejlesztői élmény egységes, minden dev konténerben működik a hot reload és a Nest CLI.
- Új fejlesztők gyorsan be tudnak kapcsolódni, nincs többé "nest: not found" hiba.
- A projekt dockerizálása mostantól teljes, fejlesztőbarát és jövőbiztos.

---

_Dátum: 2025-06-10_
_Felelős: Copilot_
