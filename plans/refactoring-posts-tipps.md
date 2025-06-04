## Terv arra hogy kezeljuk backenden a posztokat, tippeket es a kepet.

# POST Modul kezelése backend oldalon

# Alapfuncionalitás:

1. Posztok létrehozása
2. Posztok listázása
   - Nyilvános posztok listája szűrés rendezés
   - Felhasználó saját posztjainak listája szűrés rendezés
3. Posztok részleteinek megtekintése
   - Poszt részletei (tartalom, hozzászólások, fotók)
4. Posztok módosítása
   - Szerkesztés funkció a felhasználó saját posztjainál
   - Adminisztrátor által történő szerkesztés
   - Kép feltöltése és kezelése
   - Kép törlése
   - Felhasználó csak saját posztjait tudja szerkeszteni, adminisztrátor minden posztot szerkeszthet
5. Posztok törlése
    - Felhasználó csak saját posztjait tudja törölni, adminisztrátor minden posztot törölhet
    - Osszes posztok törlése funkció
6. Hozzászólások kezelése
   - Hozzászólások hozzáadása csak regisztrált felhasználóknak
   - Hozzászólások listázása posztok alatt szűrés rendezés
   - Hozzászólások részletei
   - Hozzászólások szerkesztése
   - Hozzászólások törlése
   - Felhasználó csak saját hozzászólásait tudja szerkeszteni vagy törölni, adminisztrátor minden hozzászólást kezelhet


## Tippes posztok kezelése backend oldalon

# Tipp module:

A tipp module arra szolgal, hogy a mar hozzaadott posztokbol informaciot nyerjen ki amibol a tipp adatbazisba tudjuk menteni a felhasznalo tippeit. A tipp module a posztokhoz kapcsolodo informaciokat dolgozza fel, es ez alapjan hozza letre a tippeket.

Hogy kezeljuk ezt?
1. Elso lepesben hozza kell ferni ahhoz adathoz amit a image scanner module feldolgoz a poszthoz hozza adott kepbol.
2. Megnezzuk van e valami relevans info a poszt kontentjeben ezt kulon kezeljuk.
3. Ennek a kettonek a kombinacioja es ertelmezese utan, megprobalunk kesziteni egy tippet idoponttal, csapatnevekkel, kimenetellel, oddsal, alaptettel, kombinaciokkal, osszes tett osszeggel, eredo oddsal, maximum nyeremeny osszeggel, szelveny szammal, jatekba kuldes idejével, jatek ervenyessegevel es jatek ara adatokkal.
4. Elmentjuk a tippet az adatbazisba, es a felhasznalo profiljan jelenitjuk majd meg.
5. Ha nem sikerult egy eleg adatot kinyerni a posztbol, akkor nem csinalunk semmit, vagy esetleg lehet letrehozni egy ures tippet ami azt jelenti hogy a felhasznalo nem adott meg eleg informaciot a tipphez.
6. Ez a module a hatterben dolgozik es nem latja a felhasznalo, csak akkor ha sikerult egy tippet letrehozni, akkor azt megjelenitjuk a felhasznalo profiljan.
7. Fontos pont hogy a tippet az adatbazis megfeleloen kell strukturazni, hogy kesobb konnyen lehessen keresni, szurni, rendezni es megjeleniteni a felhasznaloknak, es statisztikai elemzeseket kesziteni belole.
8. Megfelelo indexeket kell hozzaadni az adatbazisban, hogy a keresesi sebesseg optimalizalt legyen.
9. Az api vegpontok megfelelo dokumentalasa, hogy a frontend es mas rendszerek konnyen tudjak hasznalni a tipp adatokat.

## Kép feltöltése és kezelése backend oldalon

# A kepek feltolteset es kezelest az uploads module vegzi.
  - 2 fajta kepet kell kezelni az egyik a profile kep a masik a poszthoz tartozo kep.
  - A profile kepet a felhasznalo profiljan jelenitjuk meg, es csak a felhasznalo tudja szerkeszteni vagy torolni.
  - A poszthoz tartozo kepet a posztok alatt jelenitjuk meg, es csak a poszt letrehozoja tudja szerkeszteni vagy torolni.
  - uploads/posts mappban helyezzuk el a posztokhoz tartozo kepeket. A file nevuk egyedi kell legyen, hogy elkeruljuk az osszeutkozest. A file nev tartalmazhatja a poszt id-t, hogy konnyen azonosithato legyen.
  - A profile kepeket a uploads/profiles mappaban helyezzuk el. A file nevuk is egyedi kell legyen, hogy elkeruljuk az osszeutkozest. A file nev tartalmazhatja a felhasznalo id-t, hogy konnyen azonosithato legyen.

# image analysis module feladata:
 1. automatikusan viszgalja az uploads/posts mappaban levo kepeket.
 2. Minden kepet eloszor sharp modullal ellenoriz, hogy megfelel-e a szabvanyoknak (pl. meret, formatum)
 3. feljavitja a kepet, hogy megfeleljen a szabvanyoknak.
 4. Kivonja a relevans informaciokat a kepekbol.
 5. A kivont informaciokat eljuttatja a tipp modulehoz.


## Jelenlegi helyzet:

# Az uploads module es az image analysis module lehetseges problemai:

1. Az uploads module nem ellenorzi a feltoltott kepek formatumat es meretet, igy lehetnek olyan kepek, amik nem felelnek meg a szabvanyoknak.
2. a 2 module megegyezo logikat is tartmazhat az ezt szigoruan kette kell valasztani.
3. A uploads module csak a kepek feltolteset kezeli, de nem ellenorzi a kep tartalmat, igy lehetnek olyan kepek, amik nem relevansak a posztok szempontjabol.
4. Az image analysis module nem ellenorzi a feltoltott kepek formatumat mert azt mar korabban az uploads module elvegzi.
5. Strukturalni kell hogy ne legyenek redudans kodok, es a megfelelo logikat a megfelelo modul vegezze.

# Poszt module jelenlegi problemai:
1. A posztok letrehozasa es kezelese nem eleg hatekony, mert a posztok adatbazisban valo tarolasa nem optimalizalt.
2. A posztokhoz tartozo hozzaszolasok kezelese nem eleg hatekony, mert a hozzaszolasok adatbazisban valo tarolasa nem optimalizalt.
3. A module jelenleg vegyesen kezeli a poszt es a tipp viszonyat. A cel az lenne, hogy a poszt module csak a posztokkal foglalkozzon, a tipp module pedig csak a tippekkel. Szetosztani a feladatokat, hogy a posztok es tippek kezelese kulon modulokban tortenjen.

# Jelenleg a tipps module egy ures mappa
- ide kell at szervezni a posztmodulbol a megfelelo kodreszletek hogy egy atlhato strukturaja legyen a posztoknak es tippeknek.


## Javasolt refaktorálás menete:

1. **Uploads Module Refaktorálása:**
   - Ellenőrizzük a feltöltött képek formátumát és méretét.
   - Különválasztjuk a profilképek és posztokhoz tartozó képek kezelését.
   - A képek feltöltése után azonnal elvégezzük a képek feldolgozását (pl. méretezés, formátum ellenőrzés).
2. **Image Analysis Module Refaktorálása:**
   - Különválasztjuk a kép feltöltését és a kép tartalmának elemzését.
   - A kép elemzése után a releváns információkat átadjuk a tipp module-nak.
   - Optimalizáljuk a képek feldolgozását, hogy ne legyenek redundáns kódok.
3. Toroljuk a redudans kodokat es azokat a fileokat amikre mar nincs szukseg.
4. **Poszt Module Refaktorálása:**
   - Különválasztjuk a posztok és tippek kezelését.
   - A posztok adatbázisának struktúráját optimalizáljuk, hogy könnyen lehessen keresni, szűrni és rendezni.
   - A posztokhoz tartozó hozzászólások kezelését a comments module vegzi (nem tudom jelenleg hogy mennyire van kesz)
5. **Tipps Module Létrehozása:**
   - A tippek adatbázisának struktúráját úgy kell kialakítani, hogy az könnyen kereshető és szűrhető legyen.
   - A tippek létrehozásához és kezeléséhez szükséges funkciókat a tipp module fogja biztosítani.
6. **API Végpontok Dokumentálása:**
   - Az API végpontokat dokumentáljuk, hogy a frontend és más rendszerek könnyen tudják használni a tipp adatokat.
   - Biztosítjuk, hogy az API végpontok megfeleljenek a RESTful elveknek.

7. Surun elorfordul hogy a kod unsafe type value hibak vannak, ezeket mindenhol javítani kell, hogy a kód biztonságos legyen.
8. **Tesztelés:**
   - Kesobb tesztelunk a refaktorált modulokat, hogy megbizonyosodjunk a helyes működésről.
