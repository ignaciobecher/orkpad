# Project Public / Private Link

## Overview

Every project can expose a shareable URL that a client (without a workspace account) can visit to see project progress, tasks, invoices, documents, and chat with the team. The link is identified by a random 64-character `publicToken` stored on the project document.

Links have two visibility modes:

| Mode | Behavior |
|---|---|
| **Public** | Anyone with the URL can access. No password required. |
| **Private** | The URL requires a username + password set by the admin. A short-lived JWT (4h) is issued on successful login and stored in `sessionStorage`. |

---

## Admin Flow

### 1. Generate a link

In **Project Detail** (`/app/projects/:id`), click **"Generar link"** in the top-right header. This calls `POST /projects/:id/public-link` and stores the returned `publicToken` on the project.

Once a token exists, the header shows:
- A **Público** (green) or **Privado** (amber) badge reflecting the current visibility
- A copy button to copy the URL (`/p/<token>`)
- A ⚙️ button to open the **Link Settings drawer**
- A 🔗 button to revoke the token entirely

### 2. Configure visibility in the settings drawer

Click ⚙️ to open the drawer. The drawer has two states:

#### No credentials configured (Public mode)
A form to create credentials:
- **Usuario** (min 3 chars)
- **Contraseña** (min 8 chars, show/hide toggle)
- Click **"Activar acceso privado"** → calls `PUT /projects/:id/link-credential`, sets `linkVisibility: 'private'`

#### Credentials configured (Private mode)
Shows the active username and two actions:
- **Rotar contraseña** → calls `POST /projects/:id/link-credential/rotate`, generates a new random password and displays it once. The password is never stored as plaintext.
- **Hacer público** → calls `DELETE /projects/:id/link-credential`, removes the credential and reverts `linkVisibility` to `'public'`

### 3. Link expiry (optional)

A link can be given an expiry date by patching the project: `PATCH /projects/:id` with `{ linkExpiresAt: "2026-12-31T23:59:59Z" }`. After that date, both public and private access return 410 Gone and the client sees a "Enlace expirado" screen.

---

## Client Flow

### Public link

Client visits `/p/<token>`. The page fetches `GET /public/projects/<token>` with no auth header. If `linkVisibility === 'public'`, the backend returns the project view immediately.

### Private link

1. Client visits `/p/<token>`. The page first checks `sessionStorage` for a stored access token (`link_token_<token>`).
2. If no token is stored, `GET /public/projects/<token>` returns **401**. The page shows the **login screen**.
3. Client enters username and password → `POST /public/projects/<token>/auth` → backend validates credentials and returns `{ accessToken }` (JWT, 4h TTL).
4. The token is saved to `sessionStorage` and the project view is loaded.
5. Subsequent requests (view, task creation) attach `Authorization: Bearer <accessToken>`.
6. When the tab is closed, `sessionStorage` is cleared and the client must log in again.

### Lockout

After **5 consecutive failed login attempts**, the credential is locked for **15 minutes**. The client sees a message with the remaining wait time. The lockout state is stored in the `project_link_credentials` MongoDB document (not in memory), so it survives server restarts.

---

## API Reference

### Admin endpoints (require workspace JWT)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/projects/:id/public-link` | Generate `publicToken` |
| `DELETE` | `/projects/:id/public-link` | Revoke `publicToken` |
| `GET` | `/projects/:id/link-status` | Get `{ linkVisibility, publicToken, linkExpiresAt, hasCredential, username, permissions }` |
| `PUT` | `/projects/:id/link-credential` | Create/replace private credentials |
| `DELETE` | `/projects/:id/link-credential` | Remove credentials (revert to public) |
| `POST` | `/projects/:id/link-credential/rotate` | Rotate password — returns new plaintext once |

### Public endpoints (no workspace auth)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/public/projects/:token/auth` | Authenticate against private link — returns `{ accessToken }` |
| `GET` | `/public/projects/:token` | View project (pass `Authorization: Bearer` for private links) |
| `POST` | `/public/projects/:token/tasks` | Create task (pass `Authorization: Bearer` for private links) |

---

## Frontend Files

| File | Role |
|---|---|
| [`src/api/projects/projects.types.ts`](../../src/api/projects/projects.types.ts) | TypeScript types: `Project`, `LinkStatus`, `SetLinkCredentialDto`, `PublicProjectView` |
| [`src/api/projects/projects.api.ts`](../../src/api/projects/projects.api.ts) | All API calls. Public calls use a separate `publicClient` (no auth cookies). `getPublicView` and `createPublicTask` accept an optional `accessToken`. |
| [`src/stores/projects.store.ts`](../../src/stores/projects.store.ts) | Pinia store. Holds `linkStatus` and `linkStatusLoading`. Actions: `fetchLinkStatus`, `setLinkCredential`, `removeLinkCredential`, `rotateLinkCredential`. |
| [`src/pages/app/ProjectDetailPage.vue`](../../src/pages/app/ProjectDetailPage.vue) | Admin UI: link badge, settings drawer, credential form, rotate/remove actions. |
| [`src/pages/PublicProjectPage.vue`](../../src/pages/PublicProjectPage.vue) | Client UI: login screen (`requiresAuth`), expired screen (`linkExpired`), project dashboard. Token stored in `sessionStorage`. |

---

## Data Flow Diagram

```
Admin side
──────────
ProjectDetailPage
  └─ projectsStore.fetchLinkStatus(id)        → GET /projects/:id/link-status
  └─ projectsStore.generatePublicLink(id)     → POST /projects/:id/public-link
  └─ projectsStore.setLinkCredential(id, dto) → PUT /projects/:id/link-credential
  └─ projectsStore.removeLinkCredential(id)   → DELETE /projects/:id/link-credential
  └─ projectsStore.rotateLinkCredential(id)   → POST /projects/:id/link-credential/rotate
  └─ projectsStore.revokePublicLink(id)       → DELETE /projects/:id/public-link

Client side
───────────
PublicProjectPage
  └─ fetchProject()
      ├─ reads sessionStorage['link_token_<token>']
      ├─ GET /public/projects/:token  (+ Authorization header if token present)
      │   ├─ 200 → render dashboard
      │   ├─ 401 → show login screen
      │   └─ 410 → show expired screen
  └─ handleLogin()
      ├─ POST /public/projects/:token/auth
      │   ├─ 200 → save accessToken to sessionStorage → re-fetch project
      │   ├─ 401 → show "Usuario o contraseña incorrectos"
      │   └─ 429 → show lockout message
  └─ submitTask()
      └─ POST /public/projects/:token/tasks  (+ Authorization header if token present)
```

---

## Security Notes

- Access tokens are **scoped** to the specific `publicToken` — a token from project A cannot be used on project B (validated in the backend guard).
- `sessionStorage` is intentionally used over `localStorage` so the token is cleared when the browser tab closes.
- Passwords are hashed with bcrypt (12 rounds) and never returned in API responses (`select: false` on the `passwordHash` field).
- Revoking the `publicToken` (`DELETE /projects/:id/public-link`) immediately invalidates all existing client sessions — there is no refresh token.
