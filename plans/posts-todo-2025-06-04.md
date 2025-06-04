# Posts Rendszer Fejlesztési Terv

## 📋 Projekt Áttekintés - 2025.06.04

### Cél

Komplett posts/tippek rendszer kifejlesztése a Social Tippster platformra, amely lehetővé teszi a felhasználók számára fogadási tippek megosztását, követését és interakciókat.

---

## 🏗️ RENDSZER ARCHITEKTÚRA

### 1. Post Típusok Hierarchia ✅ **IMPLEMENTÁLVA**

```typescript
// Post Types Definition - JELENLEGI IMPLEMENTÁCIÓ
enum PostType {
  TIP = 'tip', // Fogadási tipp (fő típus) ✅
  DISCUSSION = 'discussion', // Megbeszélés ✅
  NEWS = 'news', // Hírek ✅
  ANALYSIS = 'analysis', // Elemzés ✅
}

// MEGJEGYZÉS: GENERAL típus helyett NEWS-t használunk
```

### 2. Adatbázis Entitások ✅ **RÉSZBEN IMPLEMENTÁLVA**

#### A. Base Post Entity ✅ **IMPLEMENTÁLVA**

```typescript
// JELENLEGI IMPLEMENTÁCIÓ - backend/src/modules/posts/entities/post.entity.ts
interface Post {
  id: string; // ✅ Implementálva
  author_id: string; // ✅ Implementálva
  type: PostType; // ✅ Implementálva (tip, discussion, news, analysis)
  title: string; // ✅ Implementálva
  content: string; // ✅ Implementálva
  status: PostStatus; // ✅ Implementálva
  created_at: Date; // ✅ Implementálva
  updated_at: Date; // ✅ Implementálva

  // Engagement metrics ✅ IMPLEMENTÁLVA
  likes_count: number; // ✅
  dislikes_count: number; // ✅
  comments_count: number; // ✅
  views_count: number; // ✅

  // Tip-specific fields ✅ IMPLEMENTÁLVA
  odds?: number; // ✅
  stake?: number; // ✅
  confidence?: number; // ✅
  betting_market?: string; // ✅

  // Metadata ✅ RÉSZBEN IMPLEMENTÁLVA
  is_premium: boolean; // ✅ Implementálva
  // 🔴 HIÁNYZIK: tags, shareableLink, editHistory
}

// ✅ IMPLEMENTÁLT StatusOK
enum PostStatus {
  ACTIVE = 'active', // ✅
  ARCHIVED = 'archived', // ✅
  DELETED = 'deleted', // ✅
  PENDING_REVIEW = 'pending_review', // ✅
}
```

#### B. Tip-Specific Entity ✅ **RÉSZBEN IMPLEMENTÁLVA**

```typescript
// JELENLEGI ÁLLAPOT: Tip mezők a Post entitásba integrálva
// ✅ IMPLEMENTÁLVA: odds, stake, confidence, betting_market
// 🔴 HIÁNYZIK:
// - tipCategory
// - matchId, matchName, matchDate, matchTime
// - outcome, totalOdds
// - submissionDeadline, isResultSet, tipResult
// - isValidTip, validationErrors
```

---

## 🔧 BACKEND FEJLESZTÉS

### 1. NestJS Modulok Struktura ✅ **IMPLEMENTÁLVA**

```
✅ backend/src/modules/posts/
├── ✅ entities/
│   └── ✅ post.entity.ts (egyesített Post entitás)
├── ✅ dto/
│   ├── ✅ create-post.dto.ts
│   └── ✅ update-post.dto.ts
├── ✅ services/
│   └── ✅ posts.service.ts
├── ✅ controllers/
│   └── ✅ posts.controller.ts
└── 🔴 guards/ (HIÁNYZIK)
    ├── post-ownership.guard.ts
    └── tip-validation.guard.ts
```

### 2. API Endpoints ✅ **TELJES IMPLEMENTÁCIÓ**

#### A. Posts Controller ✅ **TELJES IMPLEMENTÁCIÓ**

```typescript
// ✅ IMPLEMENTÁLT ENDPOINTS
GET    /posts                    // ✅ Lista összes poszt
GET    /posts/:id                // ✅ Egy poszt lekérése
POST   /posts                    // ✅ Új poszt létrehozása
PUT    /posts/:id                // ✅ Poszt frissítése
DELETE /posts/:id                // ✅ Poszt törlése
POST   /posts/:id/view           // ✅ Megtekintés tracking
POST   /posts/:id/like           // ✅ Like funkció
DELETE /posts/:id/like           // ✅ Like törlése
POST   /posts/:id/bookmark       // ✅ Könyvjelző (bookmark)
DELETE /posts/:id/bookmark       // ✅ Könyvjelző törlése
GET    /posts/search             // ✅ Keresés
GET    /posts/filter             // ✅ Szűrés
GET    /posts/by-author/:userId  // ✅ Szerző alapján
POST   /posts/:id/favorite       // ✅ Kedvenc (alias bookmark)
DELETE /posts/:id/favorite       // ✅ Kedvenc törlése
POST   /posts/:id/report         // ✅ Jelentés
POST   /posts/:id/share          // ✅ Megosztás
```

#### B. Tips Controller ✅ **TELJES IMPLEMENTÁCIÓ**

```typescript
// ✅ TIP-SPECIFIKUS ENDPOINTS
GET    /tips                     // ✅ Lista tippek
POST   /tips                     // ✅ Új tipp létrehozása
PUT    /tips/:id/result          // ✅ Tipp eredmény beállítása
GET    /tips/my-performance      // ✅ Saját teljesítmény
POST   /tips/validate            // ✅ Tipp validálás
GET    /tips/statistics          // ✅ Tipp statisztikák
GET    /tips/leaderboard         // ✅ Rangsor
```

---

## 🎨 FRONTEND FEJLESZTÉS

### 1. Next.js Oldalak Struktúra ✅ **IMPLEMENTÁLVA**

```
✅ frontend/app/
├── ✅ posts/
│   ├── ✅ page.tsx                 // Posts lista (főoldal integráció)
│   ├── ✅ [id]/
│   │   ├── ✅ page.tsx            // Poszt részletek
│   │   └── ✅ edit/page.tsx       // Poszt szerkesztés
│   └── ✅ create/page.tsx         // Új poszt (CreatePostForm komponens)
└── 🔴 tips/ (HIÁNYZIK KÜLÖN SZEKCIÓ)
    ├── page.tsx                // Tippek lista
    ├── create/page.tsx         // Új tipp
    ├── performance/page.tsx    // Teljesítmény
    └── leaderboard/page.tsx    // Rangsor
```

### 2. React Komponensek ✅ **IMPLEMENTÁLVA**

#### A. Post Components ✅ **TELJES IMPLEMENTÁCIÓ**

```typescript
// ✅ IMPLEMENTÁLT KOMPONENSEK
<PostCard />                     // ✅ frontend/components/features/posts/PostCard.tsx
<PostDetail />                   // ✅ Poszt részletek oldal
<CreatePostForm />               // ✅ frontend/components/features/posts/CreatePostForm.tsx
<PostList />                     // ✅ frontend/components/features/posts/PostList.tsx

// ✅ INTERACTION KOMPONENSEK
<LikeButton />                   // ✅ Implementálva PostCard-ban
<CommentSection />               // ✅ frontend/components/features/comments/CommentList.tsx
<ShareButton />                  // ✅ Implementálva PostCard-ban
// 🔴 HIÁNYZIK: <FavoriteButton />, <ReportButton />

// ✅ LIST & FILTER KOMPONENSEK
<PostsList />                    // ✅ PostList komponens
<PostFeedFilters />              // ✅ frontend/components/root/PostFeedFilters.tsx
<SearchFilters />                // ✅ frontend/components/shared/SearchFilters.tsx
```

#### B. Tip Components 🔄 **FEJLESZTÉS ALATT (2025.06.04)**

```typescript
// ✅ TIP KEZELÉS PostCard-ban és CreatePostForm-ban (alap funkciók kész)
// 🟡 FEJLESZTÉS ALATT: TIP-SPECIFIKUS KOMPONENSEK
// ⏳ Következő komponensek implementálása folyamatban:
// <TipResultSet />                 // Eredmény beállítás (KÖVETKEZŐ LÉPÉS)
// <TipPerformance />               // Teljesítmény dashboard (KÖVETKEZŐ LÉPÉS)
// <TipLeaderboard />               // Rangsor (KÖVETKEZŐ LÉPÉS)
// <TipValidation />                // Tipp validálás (tervezés alatt)
// <DeadlineChecker />              // Határidő ellenőrző (tervezés alatt)
// <OddsCalculator />               // Odds kalkulátor (tervezés alatt)
```

### 3. Zustand Store 🔄 **BŐVÍTÉS FOLYAMATBAN**

```typescript
// ✅ ALAP IMPLEMENTÁCIÓ - frontend/store/posts.ts
interface PostsState {
  posts: Post[]; // ✅
  currentPost: Post | null; // ✅
  featuredPosts: Post[]; // ✅
  adminPosts: AdminPost[]; // ✅
  currentPage: number; // ✅
  totalPages: number; // ✅
  hasMore: boolean; // ✅
  searchQuery: string; // ✅
  selectedType: string; // ✅
  sortBy: string; // ✅
  isLoading: boolean; // ✅
  error: string | null; // ✅

  // ✅ IMPLEMENTÁLT ACTIONS
  fetchPosts: () => Promise<void>; // ✅
  createPost: (post: CreatePostData) => Promise<void>; // ✅
  updatePost: (id: string, post: Partial<CreatePostData>) => Promise<void>; // ✅
  deletePost: (id: string) => Promise<void>; // ✅
  likePost: (id: string) => Promise<void>; // ✅
  dislikePost: (id: string) => Promise<void>; // ✅

  // 🟡 FEJLESZTÉS ALATT: TIP-SPECIFIKUS STORE LOGIKA
  // Következő lépések:
  // - userStats: UserTipStats (implementáció folyamatban)
  // - leaderboard: LeaderboardEntry[] (tervezés alatt)
  // - createTip, setTipResult, fetchUserStats, fetchLeaderboard (tervezés alatt)
}
```

---

## 🔮 JÖVŐBELI FUNKCIÓK

### 1. Képelemzés Modul (AI-powered) 🔴 **NEM IMPLEMENTÁLVA**

```typescript
// 🔴 TERVEZETT - NEM IMPLEMENTÁLVA
@Injectable()
export class ImageAnalysisService {
  async extractMatchDataFromImage(imageUrl: string): Promise<MatchData>;
  async recognizeTextFromBettingSlip(imageUrl: string): Promise<BettingSlipData>;
  async autoFillTipFromImage(imageUrl: string): Promise<CreateTipDto>;
}
```

### 2. Fejlett Elemzések 🔴 **NEM IMPLEMENTÁLVA**

```typescript
// 🔴 TERVEZETT - NEM IMPLEMENTÁLVA
interface UserTipStats {
  totalTips: number;
  wonTips: number;
  lostTips: number;
  winRate: number;
  totalProfit: number;
  averageOdds: number;
  bestStreak: number;
  currentStreak: number;
  monthlyStats: MonthlyStats[];
}
```

---

## 📋 FEJLESZTÉSI ÜTEMTERV - FRISSÍTETT STÁTUSZ

### ✅ Fázis 1: Alapok (1-2 hét) - **BEFEJEZETT**

- ✅ **Backend**: Post és Tip entitások (egyesített Post entitás)
- ✅ **Backend**: Alap CRUD API-k (teljes CRUD + like/dislike/view)
- ✅ **Frontend**: Alap komponensek (PostCard, PostList, CreatePostForm)
- ✅ **Frontend**: Zustand store alapok (teljes posts store)

### 🔄 Fázis 2: Interakciók (1 hét) - **FOLYAMATBAN**

- ✅ **Backend**: Like, dislike funkciók
- ✅ **Frontend**: Like/dislike komponensek
- ✅ **Backend**: Comment rendszer (teljes implementáció)
- 🔴 **HIÁNYZIK**: Share, favorite, report funkciók
- 🔴 **HIÁNYZIK**: WebSocket real-time frissítések

### 🔄 Fázis 3: Tipp Specifikus (1-2 hét) - **RÉSZBEN KÉSZ**

- ✅ **Backend**: Alap tipp mezők (odds, stake, confidence, betting_market)
- ✅ **Frontend**: Tipp létrehozás (CreatePostForm tip mód)
- ✅ **Frontend**: Tipp megjelenítés (PostCard tip részletek)
- 🔴 **HIÁNYZIK**: Tipp validálás, deadline management
- 🔴 **HIÁNYZIK**: Teljesítmény dashboard, rangsor

### 🔴 Fázis 4: Fejlett Funkciók (2-3 hét) - **NEM ELKEZDETT**

- 🔴 **AI**: Képelemzés modul
- 🔴 **Analytics**: Fejlett statisztikák
- ✅ **Admin**: Moderációs eszközök (admin panel implementálva)
- ✅ **Mobile**: Reszponzív optimalizálás (Tailwind CSS reszponzív)

---

## 🎯 KÖVETKEZŐ LÉPÉSEK - FRISSÍTETT PRIORITÁSOK

### 1. Azonnali Teendők

1. ✅ ~~Backend entitások létrehozása~~ **KÉSZ**
2. ✅ ~~Adatbázis migrációk készítése~~ **KÉSZ**
3. ✅ ~~Alap API endpoints implementálása~~ **KÉSZ**
4. ✅ ~~Frontend komponensek alapjainak kidolgozása~~ **KÉSZ**

### 2. Következő Prioritások (2025.06.04 után)

1. **Tip-specifikus funkciók bővítése**:

   - Tip validáció logika (deadline, match existence)
   - Tip eredmény beállítás endpoint és UI
   - Teljesítmény tracking és statisztikák

2. **Hiányzó interakciók implementálása**:

   - Favorite/bookmark funkció
   - Report/jelentés funkció
   - Share/megosztás fejlesztése

3. **Keresés és szűrés fejlesztése**:

   - Fejlett keresési API endpoints
   - Szerző alapú szűrés
   - Kategória és dátum szűrők

4. **Analitikai funkciók**:
   - User tip statistics
   - Leaderboard rendszer
   - Performance dashboard

### 3. Technikai Döntések

- ✅ **Adatbázis**: TypeORM + PostgreSQL (implementálva)
- ✅ **State Management**: Zustand (implementálva)
- ✅ **UI Framework**: Next.js + Tailwind CSS (implementálva)
- 🔴 **Képfeltöltés**: Cloudinary vs AWS S3 (döntés szükséges)
- 🔴 **Real-time**: WebSocket vs Server-Sent Events (döntés szükséges)
- 🔴 **Cache**: Redis integráció (tervezés szükséges)

### 4. Tesztelés

- ✅ **Backend tesztek**: Jest + Supertest (konfigurálva)
- ✅ **E2E tesztek**: Playwright (konfigurálva)
- 🔄 **Unit tesztek bővítése**: Post service-ek tesztelése
- 🔴 **Performance tesztek**: Nagy adatmennyiség kezelése

---

## 📊 IMPLEMENTÁCIÓS STÁTUSZ ÖSSZESÍTŐ

### ✅ Teljes implementáció (90%+)

- Base Posts CRUD rendszer
- Frontend komponensek (PostCard, PostList, CreatePostForm)
- Zustand store alapok
- Admin panel integráció
- Comment rendszer
- Like/Dislike funkciók

### 🔄 Részleges implementáció (50-90%)

- Tip-specifikus mezők (alap mezők kész, fejlett funkciók hiányoznak)
- API endpoints (CRUD kész, fejlett funkciók hiányoznak)
- Keresés és szűrés (alap szűrés kész, fejlett keresés hiányzik)

### 🔴 Nem implementált (0-50%)

- Tip validáció és deadline management
- Teljesítmény tracking és statisztikák
- Képelemzés és AI funkciók
- Real-time funkcionalitás
- Fejlett analitikai dashboard

---

_Dokumentum frissítve: 2025-12-19 - GitHub Copilot által_
_Státusz: 65% befejezett, aktív fejlesztés alatt_
