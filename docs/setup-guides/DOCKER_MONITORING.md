# Docker Container Monitoring Guide - VS Code

**Dátum:** 2025-06-10

## VS Code Docker Extension használata

### 1. 🔧 Telepítés

- ✅ **Docker Extension telepítve**: `ms-azuretools.vscode-docker`
- **Helye**: VS Code Extensions → Docker

### 2. 📊 Container monitoring

#### Docker Explorer panel:

- **Megnyitás**: Activity Bar → Docker ikon
- **Containers** lista → minden futó container látható
- **Images** lista → helyi Docker image-ek

#### Live monitoring funkciók:

- **View Logs**: Right-click container → élő logok real-time
- **Attach Shell**: Right-click container → terminal access
- **Inspect**: Container részletek és config
- **Restart/Stop**: Container lifecycle management

### 3. 🔍 API Gateway monitoring

#### Jelenlegi konfiguráció:

- **Container**: `api-gateway_dev`
- **Port**: `3000` (host) → `3000` (container)
- **Health**: `http://localhost:3000/api/health`
- **Docs**: `http://localhost:3000/api/docs`

#### Live logging példa:

```log
[Nest] 46 - 06/10/2025, 11:47:25 AM LOG [LoggingInterceptor]
  Incoming Request: GET /api/health - curl/8.8.0 [576ce96b-2c41-40c1-85f1-c09ef40f01bb]
[Nest] 46 - 06/10/2025, 11:47:25 AM LOG [LoggingInterceptor]
  Outgoing Response: GET /api/health - 200 - 2ms [576ce96b-2c41-40c1-85f1-c09ef40f01bb]
```

### 4. 🛠️ Debugging workflow

#### Development módban:

1. **Code changes** → automatikus restart (watch mode)
2. **View Logs** → hibakeresés real-time
3. **Health check** → `curl localhost:3000/api/health`
4. **Swagger UI** → API tesztelés

#### Terminal access container-ben:

```bash
# VS Code Docker Explorer → Right-click → Attach Shell
$ npm run start:dev  # Manual restart ha szükséges
$ tail -f /root/.npm/_logs/...  # NPM logok
$ ps aux  # Futó processek
```

### 5. 📈 Performance monitoring

#### Request tracking:

- **Correlation ID**: Minden request egyedi azonosítóval
- **Response time**: Milliszekundum pontossággal
- **Status codes**: HTTP response kódok tracking
- **User agents**: Client azonosítás

#### Current metrics:

- **Health check**: ~2ms response time
- **Route mapping**: 8 mikroszerviz route
- **Rate limiting**: 100 req/min védelem
- **Memory**: Container resource usage VS Code-ban látható

## 6. 🚨 Troubleshooting

#### Gyakori problémák:

- **Container restart**: `docker compose restart api-gateway_dev`
- **Port conflict**: Ellenőrizd hogy más app nem használja a 3000-et
- **Build errors**: Check logs TypeScript compilation hibákért
- **Network issues**: Verify docker network connectivity

#### Log monitoring VS Code-ban:

1. **Docker Explorer** → `api-gateway_dev` → **View Logs**
2. **Real-time following** → automatikus frissülés
3. **Search/Filter** → Ctrl+F a log ablakban
4. **Copy logs** → teljes log kimásolható

---

**Készítette:** Copilot Chat
**Utolsó frissítés:** 2025-06-10
**Status**: ✅ API Gateway monitoring aktív
