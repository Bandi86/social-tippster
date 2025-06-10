# CHANGE_LOG_20250610_API_GATEWAY_PREFIX_FIX.md

**Dátum:** 2025-06-10

## API Gateway route prefix javítás

- Megszüntetve a dupla `/api/api` prefix az API Gateway Swagger dokumentációban és endpointokban.
- ProxyController-ből eltávolítva az extra 'api' prefix, mostantól minden végpont `/api/...` formátumú.
- Dockerfile, docker-compose, env file-ok, Prisma és DB hivatkozások teljesen letisztítva.
- Swagger UI és minden API endpoint mostantól egységes, átlátható.

---

**Módosította:** Copilot Chat
**Jóváhagyta:** bandi
**Időbélyeg:** 2025-06-10
