# Zustand Store-ok szerkezete

Ez a mappa tartalmazza a frontend összes állapotkezelő (Zustand) store-ját.

## Főbb store-ok

- `users.ts`: Felhasználói és admin funkciók egy helyen, magyar kommentekkel.
- `comments.ts`: Komment és admin komment funkciók egy helyen, magyar kommentekkel.
- `posts.ts`: Poszt és admin poszt funkciók, magyar kommentekkel.
- `auth.ts`: Authentikációs logika, magyar kommentekkel.

## Szerkezeti elvek

- Egy file = egy modul (nincs külön enhanced/original verzió)
- Mindenhol magyar szekció-kommentek
- Helper függvények, interface-k, state, actions jól elkülönítve

## Utolsó frissítés

2025-05-30
