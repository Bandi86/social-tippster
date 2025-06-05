## Posztolas menete:

1. Registralt felhasznalo bejelentkezik.
2. Kattint a uj post letrehozasa gombra
3. Itt megadja a szukseges adatokat:
   - Cime
   - Tartalom
   - Kategoria (opcionalis)
   - Cimek (opcionalis)
   - foto (opcionalis)
4. A poszt letrehozasa gomb megnyomasaval a poszt elmentodik az adatbazisba.
5. A poszt megjelenik a felhasznalo profiljan, valamint a nyilvanos posztok listajaban.

## Posztok kezelese kulonbozo esetekkel:

1. Ha a felhasznalo nem jelentkezett be, akkor a poszt letrehozasa gomb nem elerheto.
2. Ha a felhasznalo bejelentkezett, de nem adott meg minden kotelezo adatot, akkor hiba uzenet jelenik meg.
3. Ha a poszt sikeresen letre lett hozva, akkor egy sikeres uzenet jelenik meg, es a felhasznalo visszairanyitodik a home pagere.
4. Ha a poszt letrehozasa sikertelen, akkor egy hiba uzenet jelenik meg, es a felhasznalo visszairanyitodik a poszt letrehozasa oldalra.
5. A posztok listaja frissul, es a felhasznalo lathatja az ujonnan letrehozott posztot.
6. A posztok szerkeszthetok es torolhetok a felhasznalo profiljan.
7. A posztok szerkesztese es torlese csak a poszt letrehozoja szamara elerheto.
8. A posztokhoz hozzaszolasokat lehet fuzni, melyet mindenki lathat, de csak a poszt letrehozoja tud torolni vagy szerkeszteni, illetve a hozzaszolo is torolheti a sajat hozzaszolasait.
9. ha a felhasznalo torolni szeretne a posztjat, akkor egy megerosito ablak jelenik meg, ahol megerositheti a torlest.
10. A posztokhoz feltoltott fotok megtekinthetok, de csak a poszt letrehozoja tudja torolni oket.

## Poszt esete ha tippet tolt fel es nincs hozza kep.

1. ilyenkor a meglevo adatok alapjan a poszt tartalmat vesszuk figyelembe es ez alapjan probaljuk a tartalmat a tipp adatbazisba menteni.

## Poszt ertelmezese ha felhasznalo ervenyes kepet tolt fel.

1. A feltoltott kepet ellenorizzuk, hogy megfelel-e a szabvanyoknak (pl. meret, formatum).
2. Ha a kep megfelel, akkor a poszt tartalmaba beillesztjuk a kepet, es a posztot elmentjuk az adatbazisba.
3. Ha a kep nem felel meg a szabvanyoknak, akkor hiba uzenetet jelenitunk meg, es a felhasznalo visszairanyitodik a poszt letrehozasa oldalra.
4. A poszt megjelenitesekor a kep is lathato lesz a poszt tartalmaban.
5. A hatterben elkezdjuk feldolgozni a feltoltott kepet. Az image scanner ellenorzi a kepet, es ha talal benne megfelelo tartalmat, akkor azt hozzadja a tipp adatbazishoz.
   Fontos struktura pelda milyen lehet egy tipp:

- merkezosek kezdesi idopontja: 2023-03-15 18:00
- ket csapat neve: csapat1, csapat2
- kimenetel : csapat1 nyer, csapat2 nyer, dontetlen
- odds : 1.5, 2.0, 3.0
- alaptett: 1000
- kombinaciok ez lehet tobbfele. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 vagy 3/4 stb
- osszes tett: 10000
- eredo odds: 35.99
- maximum nyeremeny: 10000
- szelveny szama: ami egy kod, hogy a felhasznalo tudja azonositani a tippeket
- jatekba kuldes ideje: 2023-03-15 18:00 ez azt jelenti az illeto mikor adta fel a tippeket
- jatek ervenyessege: 2023-03-15 20:00 ez azt jelenti, hogy a tipp mikor jar le az ido pont utan mar lehet tudni hogy a tipp nyero vagy vesztes
- jatek ara: 1000

6. A hatterben ezekre az adatokra vadaszunk ezekkel az adatokkal tudjuk feltolteni egy adott user tippjeit. Ezekbol az adatokbol csak a fontosabbakat kell figyelni a tetet az odssot a hataridoket az hogy a kombi szelveny vagy melyik csapat jatszik jelenleg nem relevans. Azt akarjuk menteni a tipp adatbazisba hogy ki mikor tippel, milyen tettel mekkora oddsal mennyit nyer ha nyer es ebbol az adatbol dolgozni.
7. Kesobb ha lesz api hozzaferes nyertes vagy vesztes tippeket mar nem kell a usernek kezzel megadni.

## Posztok kezelese adminisztrator szamara:

1. Az adminisztrator bejelentkezik az admin feluletre.
2. Itt megtekintheti az osszes felhasznalo posztjat.
3. Az adminisztrator szerkesztheti vagy torolheti a posztokat, ha azok nem felelnek meg a szabvanyoknak.
4. Az adminisztrator jogosult a posztok moderalasara, es ha talal olyan posztot, ami nem megfelelo, akkor azt eltavolitja.
5. Az adminisztrator jogosult a felhasznalok figyelmeztetesere vagy kitiltasara, ha azok tobb alkalommal is szabalysertest kovetnek el.
6. Az adminisztrator jogosult a posztokhoz fuzott hozzaszolasok moderalasara is, es eltavolitja azokat, amelyek nem megfelelok.
7. Az adminisztrator jogosult a felhasznalok figyelmeztetesere vagy kitiltasara, ha azok tobb alkalommal is szabalysertest kovetnek el.
8. Az adminisztrator jogosult a posztokhoz fuzott hozzaszolasok moderalasara is, es eltavolitja azokat, amelyek nem megfelelok.
9. Az adminisztrator jogosult a posztokhoz fuzott hozzaszolasok szerkesztesere is, ha azok nem megfelelok.
10. Az adminisztrator jogosult a posztokhoz fuzott hozzaszolasok torlesere is, ha azok nem megfelelok.

# ---

# 2025-06-05: Tesztelés, validáció és hibakezelés fejlesztése (automata tesztek, backend logika)

## Automatizált tesztelés és validációs követelmények

- A tip post létrehozásához a `bettingMarketId` mezőnek **érvényes v4 UUID**-nek kell lennie. Hibás UUID esetén a backend validációs hibát ad vissza.
- A backend globális validációs logikája (ValidationPipe) részletes hibákat logol, és minden hibás inputra megfelelő REST státuszkódot (pl. 400, 401) ad vissza.
- A tesztek minden futtatásnál **egyedi teszt user**-t generálnak, hogy ne legyen ütközés.
- A discussion post létrehozásánál fellépő belső szerverhiba (500) okát a service/entity mentési logok segítik feltárni (pl. kötelező mező hiánya, entitás constraint, DB constraint).
- A tesztek valid/invalid inputokat is ellenőriznek, minden esetben elvárt a részletes hibaüzenet és a helyes státuszkód.
- A backend logban minden input és hiba megjelenik, így a hibák gyorsan azonosíthatók.

## QA és fejlesztői workflow

- Minden kódmódosítás után a backend újraindítása szükséges (`npm run dev`).
- A tesztek futtatása: `node tests/backend/test-posts-validation.js`.
- A validációs hibák és logok ellenőrzése a backend terminálban történik.
- A REST API-nak minden valid/invalid esetben helyes státuszkódot és részletes hibakezelést kell adnia.
- A tesztelési és hibakezelési tapasztalatokat, edge case-eket folyamatosan dokumentálni kell a fejlesztési tervekben.

# ---
