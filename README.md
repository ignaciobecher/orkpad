# Orkpad

**Orkpad** is an open-source app for freelancers and small agencies. It replaces the broken Excel, the outdated Notion, and the scattered WhatsApp reminders. CRM, projects, time tracking, and billing — in one self-hostable place, under your control.

This is a **monorepo** with two applications:

| Directory  | Description                                         | Stack |
| ---------- | --------------------------------------------------- | ----- |
| `frontend/` | Web app (dashboard, landing, client portal, PWA)     | Vue 3, Vite, Vuetify, Tailwind, Pinia, vue-i18n |
| `backend/`  | Multi-tenant REST + realtime API                    | NestJS, MongoDB (Mongoose), Socket.IO, JWT |

- **Multi-tenant**: each workspace is isolated; data never leaks between workspaces.
- **Self-hostable**: run it on your own infrastructure.
- **License**: [Apache-2.0](./LICENSE).

## Quickstart

> Requirements: Node.js `^20.19.0` or `>=22.12.0`, MongoDB (local, Docker, or a remote cluster).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values
npm run start:dev           # API + Swagger on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL points to the backend
npm run dev                 # app on http://localhost:5173
```

## Repository layout

```
orkpad/
  frontend/   # Vue 3 web application
  backend/    # NestJS API
```

Each application has its own `README.md`, `.env.example`, and conventions. See [`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md).

## Contributing

Contributions are welcome. Open an issue, join a discussion, or submit a pull request in this repository.

## License

Licensed under the [Apache License, Version 2.0](./LICENSE). Copyright 2026 Orkpad contributors.
