# Frontend Architecture Overview

Orkpad frontend is a Vue 3 SPA built with Vite. This document covers the stack, folder layout, API patterns, state management, and routing conventions needed to work on any part of the codebase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API + Options API) |
| Build tool | Vite 8 |
| UI library | Vuetify 4 + custom `W*` components |
| CSS | TailwindCSS 4 + CSS custom properties |
| State | Pinia 3 |
| Routing | Vue Router 5 |
| HTTP | Axios 1 |
| WebSocket | Socket.io-client 4 |
| Rich text | TipTap 3 |
| i18n | vue-i18n 11 |
| Dates | date-fns 4 |

---

## Folder Structure

```
src/
├── api/                  # HTTP layer, one subfolder per backend module
│   ├── axios.config.ts   # Axios instances, interceptors, token refresh
│   ├── projects/
│   │   ├── projects.api.ts      # All API calls for the module
│   │   └── projects.types.ts    # TypeScript interfaces (DTOs, responses)
│   ├── messaging/
│   ├── clients/
│   └── ...
├── assets/               # Global CSS, fonts, images
├── components/
│   ├── ui/               # Design-system components: WButton, WCard, WTable, WBadge, WDrawer, WKpiCard…
│   ├── layout/           # AppShell, Sidebar, TopBar
│   └── onboarding/
├── composables/          # Vue 3 composables: useToast, useConfirm…
├── locales/              # i18n JSON files (es.json, en.json)
├── pages/
│   ├── app/              # Authenticated pages (require JWT)
│   │   ├── ProjectDetailPage.vue
│   │   ├── ProjectsPage.vue
│   │   └── ...
│   ├── auth/             # Login, register, OAuth callbacks
│   └── PublicProjectPage.vue   # Unauthenticated client-facing project view
├── plugins/              # Vue plugin setup (Vuetify, i18n, router)
├── router/
│   ├── index.ts          # Route definitions
│   ├── guards.ts         # Navigation guards (auth check)
│   └── routes/           # Split route files per domain
├── stores/               # Pinia stores, one per domain
│   ├── projects.store.ts
│   ├── clients.store.ts
│   └── ...
├── utils/                # Pure utility functions (date, currency, string)
├── App.vue
└── main.ts
```

---

## API Layer

### Two Axios instances

**`apiClient`** (`src/api/axios.config.ts`) — used for all authenticated endpoints:
- Base URL: `VITE_API_URL`
- `withCredentials: true` (sends auth cookies)
- Request interceptor: strips empty params
- Response interceptor: auto-refresh JWT on 401; shows global toast on POST/PATCH/PUT/DELETE (suppressed with `X-Hide-Global-Toast` header)

**`publicClient`** — an unauthenticated Axios instance created per-module (e.g., in `projects.api.ts`):
- Same base URL, no credentials
- Used for public endpoints like `/public/projects/:token`
- When a private link access token exists (stored in `sessionStorage`), it is passed as `Authorization: Bearer` in the individual call, not in the instance headers

### Convention

Every API module exports a plain object:
```ts
// src/api/projects/projects.api.ts
export const projectsApi = {
  getAll: (params?) => apiClient.get<PaginatedResponse<Project>>(BASE, { params }),
  getPublicView: (token, accessToken?) =>
    publicClient.get<PublicProjectView>(`/public/projects/${token}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
  // …
}
```

Types live in a sibling `*.types.ts` file. Never inline types inside the API file.

---

## State Management (Pinia)

One store per domain. Stores follow this shape:

```ts
export const useProjectsStore = defineStore('projects', {
  state: () => ({ items, loading, error, selected, overview, linkStatus, … }),
  actions: {
    async fetchAll() { … },
    async create(dto) { … },
    // actions call api layer, update state, and show toasts
  }
})
```

Rules:
- API calls only happen inside store actions or composables — never directly in component methods.
- `loading` is a boolean flag set before and after every async action.
- `error` stores the last error message string.
- Toast notifications are triggered from the store, not from components, except for component-local errors (e.g., form validation).

---

## Routing

### Route types

| Prefix | Auth required | Guard |
|---|---|---|
| `/app/…` | Yes | `JwtAuthGuard` via `router/guards.ts` |
| `/auth/…` | No | Redirects to `/app` if already logged in |
| `/p/:token` | No | None — public project view |

### Adding a new route

1. Define it in the appropriate file under `src/router/routes/`
2. Use `() => import('@/pages/…')` for lazy loading
3. If it's authenticated, nest it under the `/app` parent route which already applies the auth guard

---

## Component Conventions

### Design system components (`src/components/ui/`)

Prefix: `W`. Always use these instead of raw HTML or Vuetify components directly:

| Component | Usage |
|---|---|
| `WButton` | All buttons. Props: `variant` (primary/ghost/secondary), `size`, `loading`, `disabled` |
| `WCard` | Content panels |
| `WBadge` | Status labels. Prop: `color` (CSS var string) |
| `WTable` | Data tables. Props: `headers`, `items`, `empty-message`. Slots: `#item-<key>` |
| `WDrawer` | Side panels. Props: `v-model`, `title`, `width`. Slot: `#footer` |
| `WKpiCard` | Metric display. Props: `title`, `value` |

### Page component shape

```vue
<template>…</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useXyzStore } from '@/stores/xyz.store'

export default defineComponent({
  name: 'XyzPage',
  components: { … },
  data() { return { … } },
  computed: {
    ...mapState(useXyzStore, ['items', 'loading']),
    // local derived state
  },
  methods: {
    ...mapActions(useXyzStore, ['fetchAll', 'create']),
    // local handlers that call store actions
  },
  async mounted() { … },
})
</script>

<style scoped>…</style>
```

Avoid `<script setup>` — the codebase uses Options API uniformly for consistency.

---

## Public Project View

See [`docs/features/PROJECT_PUBLIC_LINK.md`](../features/PROJECT_PUBLIC_LINK.md) for the full feature documentation.

The page at `src/pages/PublicProjectPage.vue` handles three states:
- **Authenticated** (`project !== null`) → full dashboard
- **Requires auth** (`requiresAuth === true`) → login screen (private links)
- **Expired** (`linkExpired === true`) → expiry message
- **Loading / error** → spinner or "invalid link" screen

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:3000`) |
| `VITE_SOCKET_URL` | Socket.io server URL (defaults to `VITE_API_URL`) |

Set in `.env.development` for local development. Never commit `.env.production`.

---

## Running Locally

```bash
npm install
cp .env.development.example .env.development   # fill in VITE_API_URL
npm run dev
```

App runs at `http://localhost:5173` by default.

```bash
npm run build     # production build
npm run lint      # ESLint
npm run type-check  # vue-tsc
```
