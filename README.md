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

## Requirements

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)
- [Git](https://git-scm.com/downloads)
- A GitHub account (to fork/clone)

That's it. Node.js, MongoDB, and everything else is handled inside Docker containers.

## Clone & Run with Docker

### 1. Fork the repository (optional but recommended)

Go to [https://github.com/ignaciobecher/orkpad](https://github.com/ignaciobecher/orkpad) and click **Fork**. This gives you your own copy under your GitHub account.

### 2. Clone your fork

```bash
git clone https://github.com/<YOUR_USERNAME>/orkpad.git
cd orkpad
```

If you didn't fork, clone the original repo directly:

```bash
git clone https://github.com/ignaciobecher/orkpad.git
cd orkpad
```

### 3. Create the environment file

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` in any text editor. The **only values you must change** are the two JWT secrets — replace them with long random strings:

```env
JWT_SECRET=replace-this-with-a-long-random-string-at-least-16-chars
JWT_REFRESH_SECRET=replace-this-with-another-long-random-string-16+
```

Everything else can stay as-is for local development. The defaults work out of the box:

- `MONGODB_URI` is overridden by Docker Compose to point to the internal Mongo container.
- `FRONTEND_URL` defaults to `http://localhost:8080`.
- OAuth, email, and push notification vars are optional — leave them empty.

### 4. Start the stack

```bash
docker compose up --build
```

This builds and starts **three containers**:

| Service | What it does | URL |
|---------|-------------|-----|
| `mongo` | MongoDB 7 database | — (internal) |
| `backend` | NestJS API + Swagger docs | http://localhost:3000 |
| `frontend` | Vue 3 SPA served via nginx | http://localhost:8080 |

The first run takes a few minutes (downloading images, installing deps, building). Subsequent starts are fast.

### 5. Open the app

- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend API docs**: [http://localhost:3000/docs](http://localhost:3000/docs)

Register a new account and start using Orkpad.

### 6. Stop the stack

Press `Ctrl+C` in the terminal where Docker is running, or run:

```bash
docker compose down
```

Your data persists in a Docker volume (`orkpad_mongo_data`). To wipe everything and start fresh:

```bash
docker compose down -v
```

## Development (without Docker)

If you prefer to run without Docker, you need:

- Node.js `^20.19.0` or `>=22.12.0`
- A MongoDB instance (local, Docker, or a cloud cluster like [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in JWT_SECRET and JWT_REFRESH_SECRET
npm run start:dev           # API + Swagger on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL points to the backend
npm run dev                 # app on http://localhost:5173
```

## Environment Variables

### Required

The app won't start without these:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/orkpad` |
| `FRONTEND_URL` | Origin of the frontend app (used for CORS, emails, auth redirects) | `http://localhost:8080` |
| `JWT_SECRET` | Secret for signing access tokens (min 16 chars) | any long random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 16 chars) | any long random string |

### Optional

Everything else has sensible defaults or can be left empty to disable:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP port the API listens on |
| `NODE_ENV` | `development` | Runtime mode (`development` / `test` / `production`) |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `API_URL` | `http://localhost:3000` | Public base URL of the API (for email links) |
| `FROM_EMAIL` | `no-reply@orkpad.com` | Sender address for outgoing emails |

### Optional services

Leave empty to disable. Configure only if you need the feature:

| Service | Env vars | Purpose |
|---------|----------|---------|
| GitHub OAuth | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` | Login with GitHub |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Login with Google + Calendar/Gmail |
| Resend | `RESEND_API_KEY` | Transactional emails (verification, password reset) |
| Web Push | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Browser push notifications |
| Google Places | `GOOGLE_PLACES_API_KEY` | Lead scraping enrichment |

## Deploy to production

### Docker (VPS / self-hosted server)

1. Clone the repo on your server
2. Create `backend/.env` with production values:
   - Set real random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`
   - Set `FRONTEND_URL` to your public domain (e.g. `https://app.yourdomain.com`)
   - Set `API_URL` to your public API domain (e.g. `https://api.yourdomain.com`)
3. Run with Docker Compose:

```bash
docker compose up -d --build
```

4. Put a reverse proxy (nginx, Caddy, Traefik) in front of ports 8080 and 3000 to handle HTTPS.

### Railway / Render / Fly.io

- Point the service to the `backend/` directory
- Set the required env vars in the platform's dashboard
- MongoDB: use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available) or a managed MongoDB service

### Netlify (frontend only)

The `frontend/` directory includes a `netlify.toml` with SPA redirect rules. Deploy the frontend to Netlify and point `VITE_API_URL` to your backend URL.

## Repository layout

```
orkpad/
  frontend/   # Vue 3 web application
  backend/    # NestJS API
```

Each application has its own `README.md`, `.env.example`, and conventions. See [`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md).

## Contributing

Contributions are welcome! Read [`CONTRIBUTING.md`](CONTRIBUTING.md) to get started, and please follow our [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

Found a security issue? Do **not** open a public issue — report it via the [Security Advisories](https://github.com/ignaciobecher/orkpad/security/advisories) page. See [`SECURITY.md`](SECURITY.md).

## License

Licensed under the [Apache License, Version 2.0](./LICENSE). Copyright 2026 Orkpad contributors.
