# Post Module Teljes Refactoring Terv - 2025.06.05

## 📋 Áttekintés

Ez a dokumentum a felhasználói útmutató alapján készült teljes refactoring terv a Posts modul újragondolásához. A cél a modulok közötti felelősségek tiszta szeparálása és a redundáns kódok megszüntetése.

---

## 🎯 Fő Problémák és Célok

### Jelenlegi Problémák

- **Posts és Tipps modulok összekeveredése**: A posts module vegyesen kezeli a posztokat és tippeket
- **Kép kezelés redundanciája**: Uploads és Image Analysis modulok között átfedések
- **Type safety hiányosságok**: Unsafe type értékek és hiányos validáció
- **Modulok közötti felelősségek elmosódása**: Nem tiszta, hogy melyik modul mit csinál

### Refactoring Célok

1. **Tiszta moduláris szeparáció** - Minden modul egy felelősséggel
2. **Type safety javítása** - Strict TypeScript és proper error handling
3. **Redundancia megszüntetése** - DRY principle betartása
4. **Karbantarthatóság növelése** - Átlátható kód és dokumentáció

---

## 🏗️ Új Moduláris Architektúra

### 1. Posts Module (Egyszerűsített)

**Felelősség**: Csak általános poszt CRUD műveletek

```typescript
// Simplified Post Entity
interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  type: 'general' | 'discussion' | 'analysis'; // NINCS 'tip' típus
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'followers' | 'private';
  image_urls?: string[];
  created_at: Date;
  updated_at: Date;

  // Interaction counters
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
}
```

**API Endpoints:**

```
GET    /api/posts              // általános posztok listázása
POST   /api/posts              // új poszt létrehozása (NEM tipp)
GET    /api/posts/:id          // poszt részletei
PATCH  /api/posts/:id          // poszt szerkesztése
DELETE /api/posts/:id          // poszt törlése
POST   /api/posts/:id/vote     // szavazás
POST   /api/posts/:id/bookmark // könyvjelző
```

### 2. Tipps Module (Teljes Tipp Funkcionalitás)

**Felelősség**: Minden tipp-specifikus logika és üzleti szabály

```typescript
// Új Tipps Entity
interface Tip {
  id: string;
  post_id: string; // Kapcsolat a Posts táblához
  match_id?: string;
  match_name: string;
  match_date: Date;
  match_time?: string;
  outcome: string;
  odds: number;
  stake: number;
  confidence?: number;
  tip_category: TipCategory;
  tip_result: 'pending' | 'won' | 'lost' | 'void';
  submission_deadline?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**API Endpoints:**

```
GET    /api/tipps              // tippek listázása
POST   /api/tipps              // új tipp létrehozása (Post + Tipp egyszerre)
GET    /api/tipps/:id          // tipp részletei (Post + Tipp adatok)
PATCH  /api/tipps/:id          // tipp szerkesztése
DELETE /api/tipps/:id          // tipp törlése (Post + Tipp)
POST   /api/tipps/:id/result   // eredmény beállítása
GET    /api/tipps/leaderboard  // rangsor
GET    /api/tipps/my-stats     // felhasználó statisztikái
POST   /api/tipps/validate     // tipp validáció
```

### 3. Uploads Module (Kép Feltöltés + Validáció)

**Felelősség**: Fájl feltöltés, tárolás és alapvalidáció

**Funkciók:**

- Kép feltöltés és Sharp modullal optimalizálás
- Fájl formátum és méret validáció
- Biztonságos fájlnév generálás
- Külön mappák: `uploads/posts/`, `uploads/profiles/`
- **NINCS kép elemzés vagy OCR**

**API Endpoints:**

```
POST   /api/uploads/posts      // poszt képek feltöltése
POST   /api/uploads/profiles   // profil képek feltöltése
DELETE /api/uploads/:id        // kép törlése
GET    /api/uploads/formats    // támogatott formátumok
```

### 4. Image Analysis Module (Kép Elemzés + OCR)

**Felelősség**: Kép tartalom elemzése és tipp adatok kinyerése

**Funkciók:**

- OCR szövegfelismerés
- Tipp adatok automatikus parsing
- Strukturált adatok kinyerése képekből
- Kapcsolódás a Tipps module-hoz (NEM Posts-hoz)

**API Endpoints:**

```
POST   /api/image-analysis/extract-tip-data  // kép elemzése tipp adatokért
GET    /api/image-analysis/supported-formats // támogatott OCR formátumok
POST   /api/image-analysis/validate-image    // kép tartalom validáció
```

### 5. Comments Module (Hozzászólás Kezelés)

**Felelősség**: Poszt hozzászólások és válaszok kezelése

**Megtartott funkciók:**

- Nested comment system
- Comment voting
- Comment moderation
- Kapcsolódás mind Posts, mind Tipps posztokhoz

---

## 🗄️ Adatbázis Struktúra Változások

### Posts Table (Egyszerűsített)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'discussion', 'analysis')),
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  image_urls JSON,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Új Tipps Table

```sql
CREATE TABLE tipps (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  match_id UUID,
  match_name VARCHAR(255) NOT NULL,
  match_date DATE NOT NULL,
  match_time VARCHAR(10),
  outcome VARCHAR(255) NOT NULL,
  odds DECIMAL(6,2) NOT NULL,
  stake INTEGER NOT NULL,
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
  tip_category VARCHAR(50) NOT NULL,
  tip_result VARCHAR(20) DEFAULT 'pending',
  submission_deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tipps_post_id ON tipps(post_id);
CREATE INDEX idx_tipps_match_date ON tipps(match_date);
CREATE INDEX idx_tipps_tip_result ON tipps(tip_result);
CREATE INDEX idx_tipps_created_at ON tipps(created_at);
```

---

## 🔄 Service Layer Újratervezés

### TippsService Bővített Funkcionalitás

```typescript
@Injectable()
export class TippsService {
  constructor(
    private readonly postsService: PostsService,
    private readonly imageAnalysisService: ImageAnalysisService,
    private readonly tipValidationService: TipValidationService,
    @InjectRepository(Tip) private readonly tipRepository: Repository<Tip>,
  ) {}

  // Tipp létrehozás (Post + Tip egy műveletben)
  async createTip(createTipDto: CreateTipDto, authorId: string): Promise<TipCreationResult>;

  // Tipp eredmény beállítása
  async setTipResult(tipId: string, result: TipResult, userId: string): Promise<Tip>;

  // Felhasználó tipp statisztikái
  async getUserTipStats(userId: string): Promise<UserTipStats>;

  // Rangsor készítése
  async getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;

  // Tipp validáció
  async validateTip(tipData: CreateTipDto): Promise<ValidationResult>;

  // Képből tipp adatok kinyerése
  async createTipFromImage(imageUrl: string, authorId: string): Promise<TipCreationResult>;
}
```

### PostsService Egyszerűsített

```typescript
@Injectable()
export class PostsService {
  // Csak általános poszt CRUD műveletek
  async createPost(createPostDto: CreatePostDto, authorId: string): Promise<Post>;
  async findAllPosts(queryDto: GetPostsQueryDto): Promise<PostsResponse>;
  async findPostById(id: string): Promise<Post>;
  async updatePost(id: string, updateDto: UpdatePostDto): Promise<Post>;
  async deletePost(id: string, userId: string): Promise<void>;

  // Interakciók
  async votePost(postId: string, userId: string, voteType: VoteType): Promise<void>;
  async bookmarkPost(postId: string, userId: string): Promise<void>;
  async sharePost(postId: string, platform: SharePlatform): Promise<ShareResult>;

  // NINCS tipp-specifikus logika!
}
```

---

## 🚀 Migration Strategy

### Phase 1: Entitások Szeparálása (1-2 nap)

1. **Új Tipps entity létrehozása**
2. **Migration script írása** meglévő tip adatok áthelyezéséhez
3. **Posts entity tisztítása** - tipp mezők eltávolítása
4. **Database indexes** újratervezése a teljesítmény optimalizáláshoz

### Phase 2: Service Layer Refactor (2-3 nap)

1. **TippsService teljes kiépítése** (Posts service-ből átemelt logikával)
2. **PostsService tisztítása** (tip logika eltávolítása)
3. **UploadsService validation bővítése**
4. **ImageAnalysisService** tipp-specifikus funkcionalitás

### Phase 3: Controller és API Refactor (1-2 nap)

1. **TippsController endpoints** finalizálása
2. **PostsController tip endpoints** eltávolítása
3. **API dokumentáció** frissítése Swagger-ben
4. **Error handling** egységesítése

### Phase 4: Testing és Type Safety (2-3 nap)

1. **Unit tesztek** minden modulhoz
2. **Integration tesztek** module-ok közötti kommunikációhoz
3. **TypeScript strict mode** bekapcsolása
4. **Unsafe type értékek** javítása

### Phase 5: Frontend Adaptálás (3-4 nap)

1. **Frontend API hívások** frissítése új endpoints-okhoz
2. **Tipp komponensek** átírása új adatstruktúrára
3. **Form validáció** frissítése
4. **UI/UX tesztelés**

---

## 🔧 Type Safety Javítások

### Strict Interfaces

```typescript
// Tip creation result
interface TipCreationResult {
  success: boolean;
  tipId?: string;
  postId?: string;
  errors?: ValidationError[];
}

// Type guards használata
function isTipData(data: unknown): data is TipData {
  return typeof data === 'object' && data !== null && 'odds' in data && 'stake' in data;
}

// Enum használata string literálok helyett
export enum TipResult {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void',
}
```

### Error Handling Standardizálás

```typescript
// Egységes exception hierarchy
export class TipValidationException extends BadRequestException {
  constructor(errors: string[]) {
    super({ message: 'Tip validation failed', errors });
  }
}

export class TipNotFoundException extends NotFoundException {
  constructor(tipId: string) {
    super(`Tip with ID ${tipId} not found`);
  }
}
```

---

## 📊 Workflow Példák

### Tipp Létrehozás Képpel

```
1. Frontend → UploadsService.uploadImage()
2. UploadsService → kép mentése + validáció
3. Frontend → ImageAnalysisService.extractTipData(imageUrl)
4. ImageAnalysisService → OCR + parsing
5. Frontend → TippsService.createTip(tipData)
6. TippsService → PostsService.createPost() + Tip mentése
```

### Általános Poszt Létrehozás

```
1. Frontend → PostsService.createPost()
2. PostsService → validáció + mentés
3. Response → új poszt adatok
```

---

## ⚠️ Kockázat Csökkentés

### Backward Compatibility

- **Ideiglenesen megtartott endpoints** az átmenet alatt
- **Feature flag-ek** az új funkcionalitáshoz
- **Staging környezetben** teljes tesztelés

### Monitoring

- **Database migration** monitoring
- **API response times** tracking
- **Error rate** figyelése az átmenet alatt

---

## 📈 Várható Előnyök

### Kód Minőség

- ✅ **Tiszta moduláris struktúra**
- ✅ **Type safety javulás**
- ✅ **Redundancia megszüntetése**
- ✅ **Karbantarthatóság növelése**

### Teljesítmény

- ✅ **Posts table egyszerűsítése** → gyorsabb query-k
- ✅ **Specializált indexek** tip adatokhoz
- ✅ **Optimalizált API endpoints**

### Fejlesztői Élmény

- ✅ **Egyértelmű felelősségek**
- ✅ **Könnyebb hibakeresés**
- ✅ **Független modul fejlesztés**

---

## 🏁 Következő Lépések

1. **Refactoring prioritások egyeztetése** a csapattal
2. **Phase 1 elkezdése** - Entitások szeparálása
3. **Migration script** tesztelése staging környezetben
4. **Részletes időterv** készítése a konkrét feladatokhoz

---

**Dokumentum készítette**: GitHub Copilot
**Dátum**: 2025-06-05
**Alapú útmutató**: `plans/refactoring-posts-tipps.md`
**Projekt**: Social Tippster Backend Refactoring
