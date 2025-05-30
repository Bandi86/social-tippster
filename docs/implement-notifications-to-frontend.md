# Notification rendszer frontend integrációs terv

**Dátum:** 2025-05-30

## 1. API végpontok használata

- `GET /notifications?user_id=...` – Saját értesítések lekérése
- `PATCH /notifications/:id/read` – Értesítés olvasottra állítása
- `POST /notifications` – Manuális értesítés létrehozása (admin funkció)
- `DELETE /notifications/:id` – Értesítés törlése
- `PATCH /notifications/mark-all-read?user_id=...` – Összes értesítés olvasottra állítása

## 2. Zustand store javaslat

- Hozz létre egy új store-t: `frontend/store/notifications.ts`
- Főbb action-ök:
  - `fetchNotifications(userId)` – értesítések lekérése
  - `markAsRead(notificationId)` – olvasottra állítás
  - `deleteNotification(notificationId)` – törlés
  - (opcionális) `addNotification(notification)` – új értesítés hozzáadása
- Állapot:
  - `notifications: Notification[]`
  - `unreadCount: number`
  - `isLoading: boolean`

## 3. Notification típus interface (példa)

```ts
export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  read_status: boolean;
  related_post_id?: string;
  related_comment_id?: string;
  related_user_id?: string;
  action_url?: string;
  priority: string;
}
```

## 4. UI komponensek

- Bell icon badge (unread count)
- Dropdown vagy külön oldal az értesítések listázásához
- Olvasott/olvasatlan vizuális különbség
- Kattintható értesítések (action_url vagy kapcsolódó post/comment)
- Admin dashboardon külön admin értesítési panel

## 5. Példa API hívás (fetch)

```ts
const res = await fetch(`/api/notifications?user_id=${userId}`);
const notifications = await res.json();
```

## 6. Jogosultság

- Csak saját értesítések jelenjenek meg
- Admin panelen admin típusú értesítések szűrése

## 7. Hibakezelés

- Hálózati hibák, üres lista, loading state

## WebSocket payload standard (2025-05-30)

A backend minden WebSocket értesítést egységes szerkezetben küld:

```ts
export interface WebSocketNotificationPayload {
  type: string; // esemény típusa (pl. 'new_notification', 'notification_read')
  notification?: Notification | null; // értesítés objektum vagy null
  meta?: Record<string, any> | null; // opcionális metaadat
  timestamp: string; // ISO dátum/idő
}
```

A frontend minden WebSocket üzenetet így dolgoz fel, a `type` mező alapján lehet bővíteni az eseménykezelést.

---

Utolsó frissítés: 2025-05-30
