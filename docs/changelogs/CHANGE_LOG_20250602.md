# CHANGE LOG – 2025-06-02

## [Frontend] Device Fingerprinting for Authentication

- Integrated device fingerprint collection into login and registration forms.
- Device fingerprint is now sent to backend for every login and registration, enabling advanced session analytics and security.
- Updated `auth-service.ts`, Zustand store, and both auth forms to support this feature.
- Documentation updated in `FRONTEND_PROGRESS.md`.

## Impact

- Professional-grade session analytics and device tracking for all user authentication events.
- No breaking changes for users; all device data is collected transparently.
