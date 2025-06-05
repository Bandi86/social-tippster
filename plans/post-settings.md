## Posztolas backend oldalrol

# DTO (Data Transfer Object) a posztokhoz

1. CreatePostDTO
ENUMOK:
PostType: nem kotelezo?, de meglehet adni, hogy milyen tipusu a poszt (pl. tipp, elemzes, segitsegkeres, stb.)
PostStatus: nem kotelezo?, de meglehet adni, hogy milyen statuszban van a poszt (pl. aktiv, inaktiv, privat, reportolt, premium, torolt, stb.)
PostVisibility: nem kotelezo?, de meglehet adni, hogy a poszt milyen lathatosagi szinten van (pl. publikus, csak regisztralt felhasznaloknak, csak a poszt letrehozojanak, stb.)


   - id uuid
   - title (de ezt a backend generalja a content alapjan)
   - content: string (kotelezo)
   - type: PostType (nem kotelezo?)
   - status: PostStatus (alapbol aktiv)
   - visibility: PostVisibility (alapbol publikus)
   - createdAt: DateTime (alapbol most)
   - updatedAt: DateTime (alapbol most)   -
   - authorId: uuid (kotelezo, a poszt letrehozojanak az azonositoja)
   - categoryId: uuid (opcionalis, a poszt kategoriainak az azonositoja)
   - tags: string[] (opcionalis, a poszt cimeinek az azonositoi)
   - imageUrl: string (opcionalis, a poszthoz feltoltott kep url-je)
   - commentsEnabled: boolean (alapbol true, ha a poszthoz lehet hozzaszolni)
   - likesCount: number (alapbol 0, a poszthoz adott like-ok szama)
   - commentsCount: number (alapbol 0, a poszthoz adott hozzaszolasok szama)
   - isFeatured: boolean (alapbol false, ha a poszt kiemelt)
   - isPinned: boolean (alapbol false, ha a poszt rögzített)
   - isReported: boolean (alapbol false, ha a poszt jelentve van)
   - isPremium: boolean (alapbol false, ha a poszt premium)
   - isDeleted: boolean (alapbol false, ha a poszt torolve van)
   - shareCount: number (alapbol 0, a poszt megosztasok szama)
   - viewsCount: number (alapbol 0, a poszt megtekintesek szama)
   - sharingUrl: string (opcionalis, a poszt megosztasi url-je)
   - createdBy: string (kotelezo, a poszt letrehozojanak neve backend intezi a felhasznalo azonositojabol)
   - sharingEnabled: boolean (alapbol true, ha a poszt megoszthato)
   - sharingPlatforms: string[] (opcionalis, a poszt megoszthato platformok listaja, pl. Facebook, Twitter, stb.)

   Képek - külön fájl feltöltésen keresztül kezelve
   minden tipp reszletet a contentbol szedi majd ki a tipps modul es a kepbol ha van.

   2.Filterezes: (nem kell mind egyszerre csak a fontosak)
   - category: string (opcionalis, a poszt kategoriainak szurese)
   - tags: string[] (opcionalis, a poszt cimeinek szurese)
   - author: uuid (opcionalis, a poszt letrehozojanak szurese)
   - type: PostType (opcionalis, a poszt tipusanak szurese)
   - status: PostStatus (opcionalis, a poszt statuszanak szurese)
   - visibility: PostVisibility (opcionalis, a poszt lathatosagi szintjenek szurese)
   - createdAt: DateTime (opcionalis, a poszt letrehozasanak ideje szerinti szurese)
   - updatedAt: DateTime (opcionalis, a poszt frissitesenek ideje szerinti szurese)
   - likesCount: number (opcionalis, a poszthoz adott like-ok szama szerinti szurese)
   - commentsCount: number (opcionalis, a poszthoz adott hozzaszolasok szama szerinti szurese)
   - isFeatured: boolean (opcionalis, a kiemelt posztok szurese)
   - isPinned: boolean (opcionalis, a rögzített posztok szurese)
   - isReported: boolean (opcionalis, a jelentett posztok szurese)
   - isPremium: boolean (opcionalis, a premium posztok szurese)
   - isDeleted: boolean (opcionalis, a torolt posztok szurese)
   - shareCount: number (opcionalis, a poszt megosztasok szama szerinti szurese)
   - viewsCount: number (opcionalis, a poszt megtekintesek szama szerinti szurese)
   - sharingUrl: string (opcionalis, a poszt megosztasi url-je szerinti szurese)
   - sharingEnabled: boolean (opcionalis, a megoszthato posztok szurese)
   - sharingPlatforms: string[] (opcionalis, a megoszthato platformok szurese, pl. Facebook, Twitter, stb.)

3. post by id valtozatlan
4. posts query valtozatlan
5. posts comment valtozatlan
6. post interaction valtozatlan

7. post responsebol  a tip specialis reszleteket a tipps modul fogja kezelni, es a contentbol szedi ki a tippeket, tehat ide nem kell a tobbi oke
8. post stats szerintem rendben van de lehet at kell nezni.
9. posts query rendben van de nem tudom kell e 2. mar van egy get posts query
10. report post szerintem oke.
11. share post szerintem oke.
12. update-post itt csak a status van nem tudom eleg e?

# Entity resz:

1. PostEntity
   - id: uuid (kotelezo, a poszt egyedi azonositoja)
   - title: string (kotelezo, a poszt cime)
   - content: string (kotelezo, a poszt tartalma)
   - type: PostType (nem kotelezo?, alapbol tipp)
   - status: PostStatus (alapbol aktiv)
   - visibility: PostVisibility (alapbol publikus)
   - createdAt: DateTime (alapbol most)
   - updatedAt: DateTime (alapbol most)
   - authorId: uuid (kotelezo, a poszt letrehozojanak azonositoja)
   - categoryId: uuid (opcionalis, a poszt kategoriainak azonositoja)
   - tags: string[] (opcionalis, a poszt cimeinek az azonositoi)
   - imageUrl: string (opcionalis, a poszthoz feltoltott kep url-je)
   - commentsEnabled: boolean (alapbol true, ha a poszthoz lehet hozzaszolni)
   - likesCount: number (alapbol 0, a poszthoz adott like-ok szama)
   - commentsCount: number (alapbol 0, a poszthoz adott hozzaszolasok szama)
   - isFeatured: boolean (alapbol false, ha a poszt kiemelt)
   - isPinned: boolean (alapbol false, ha a poszt rögzített)
   - isReported: boolean (alapbol false, ha a poszt jelentve van)
   - isPremium: boolean (alapbol false, ha a poszt premium)
   - isDeleted: boolean (alapbol false, ha a poszt torolve van)
   - shareCount: number (alapbol 0, a poszt megosztasok szama)
   - viewsCount: number (alapbol 0, a poszt megtekintesek szama)
   - sharingUrl: string (opcionalis, a poszt megosztasi url-je)
   - createdBy: string (kotelezo, a poszt letrehozojanak neve backend intezi a felhasznalo azonositojabol)
   - sharingEnabled: boolean (alapbol true, ha a poszt megoszthato)
   - sharingPlatforms: string[] (opcionalis, a poszt megoszthato platformok listaja, pl. Facebook, Twitter, stb.)
   - comments: CommentEntity[] (a poszthoz tartozó hozzászólások, opcionális)
   - likes: LikeEntity[] (a poszthoz tartozó like-ok, opcionális)
   - reports: ReportEntity[] (a poszthoz tartozó jelentések, opcionális)
   - category: CategoryEntity (a poszt kategóriája, opcionális)
   - author: UserEntity (a poszt szerzője, opcionális)

megjegyzés: minden ami  tipp az kikerul a poszt entitybol, es a tipp modul fogja kezelni. a tobbi maradjon meg.
A tobbi entitasnak nincs koze a tiphez maradhat de at lehet nezni.

# Guard
1. PostGuard
   - Ellenőrzi, hogy a felhasználó jogosult-e a poszt létrehozására, szerkesztésére vagy törlésére.
   - Ellenőrzi, hogy a poszt lathatosági szintje megfelel-e a felhasználó jogosultságainak.
   - Ellenőrzi, hogy a poszt státusza megfelel-e a műveletnek (pl. csak aktív posztokat lehet szerkeszteni).
 plusz egyeb?

# Service
- at kell nezni az egeszet a jogokat, es a poszt tipusokat
- minden tipp reszletet a tipps modul fogja kezelni, es a contentbol szedi ki a tippeket, tehat ide nem kell
- PostService
   - A posztokkal kapcsolatos üzleti logika kezelése.
   - A posztok létrehozása, frissítése, törlése és lekérdezése.
   - A posztokhoz tartozó hozzászólások, like-ok és jelentések kezelése.
   - A posztok szűrése és rendezése a megadott paraméterek alapján.
   - A posztok lathatosági szintjének ellenőrzése a felhasználó jogosultságai alapján.
   - A posztok státuszának ellenőrzése a műveletek előtt (pl. csak aktív posztokat lehet szerkeszteni).
# Modul
minden tipp reszletet a tipps modul fogja kezelni, es a contentbol szedi ki a tippeket, tehat ide nem kell
- PostModule
   - A posztokkal kapcsolatos üzleti logika kezelése.
   - A posztok létrehozása, frissítése, törlése és lekérdezése.
   - A posztokhoz tartozó hozzászólások, like-ok és jelentések kezelése.
# Controller
az egeszet at kell nezni, hogy minden megfeleljen az uj elvárásoknak
minden tipp reszletet a tipps modul fogja kezelni, es a contentbol szedi ki a tippeket, tehat ide nem kell
- PostController
   - A posztokkal kapcsolatos HTTP kérések kezelése.
   - A posztok létrehozása, frissítése, törlése és lekérdezése.
   - A posztokhoz tartozó hozzászólások, like-ok és jelentések kezelése.
   - A posztok szűrése és rendezése a megadott paraméterek alapján.
