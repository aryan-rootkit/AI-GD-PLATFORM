# Development log

Newest entries first (IST = UTC+5:30).

---

## [2026-04-27 20:15 IST] Fix — Logout and unauthenticated users land on home

- `AuthGuard` now `router.replace('/')` when there is no token (was `/login`), so it no longer races with logout.
- `logout` still clears `TOKEN_KEY`, `USER_KEY`, `roomMeta`, then state, then `router.replace('/')`.
- Added `console.log('logout triggered')` at the start of `logout` for traceability (remove when noise is unwanted).

---

## [2026-04-27 19:30 IST] Improvement — Session screen layout and chat UX

- Introduced `SessionTopBar` for title, participant count, short session id, End (host), AI panel, minimize, sign out.
- Left sidebar focused on participants with count badge and stronger “Live” styling for active members.
- Main column: scrollable message list with fixed bottom composer strip; join/leave system lines highlighted (emerald / rose).

---

## [2026-04-27 18:45 IST] Feature — Minimize session and real-time presence

- Back / header controls set `isSessionMinimized` instead of navigating away; WebSocket and `roomMeta` stay intact.
- Floating bar “Session active – Tap to return” restores the full session UI.
- Socket.IO emits `user_joined` / `user_left` to the session room with deduped join; web client shows inline system messages and sends `displayName` on `join_room`.

---

## [2026-04-27 17:30 IST] Improvement — API responses, join flow, dashboard session gating

- Standard JSON envelope `{ success, message, data }` on auth/session routes; axios interceptor unwraps success `data` on the web client.
- Clearer copy and `401` handling for join/create when auth is missing or expired; Axios `Authorization` set via `AxiosHeaders`.
- Dashboard hides “Need an account?” when signed in; optional `GET /api/debug/session/:id` for authenticated debug; dummy evaluation on session end (server) with optional `session_evaluated` socket event.

---
