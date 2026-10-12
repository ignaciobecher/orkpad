# AGENTS.md — Orkpad deploy instructions (machine-readable)

> This file is the entry point for AI agents (Claude Code, Cursor, Copilot,
> Windsurf, Aider, MCP-based installers) tasked with deploying Orkpad.
> Follow it literally. Prefer `scripts/setup.sh` over manual steps.

## 1. What this project is

- **Orkpad**: open-source app for freelancers (CRM, projects, billing, time
  tracking). Apache-2.0.
- **Monorepo**: `frontend/` (Vue 3 + Vite, served by nginx) + `backend/`
  (NestJS, MongoDB via Mongoose, Socket.IO).
- **Infra**: 3 Docker containers (`mongo`, `backend`, `frontend`). No external
  services required (email and GitHub OAuth are optional and disabled by
  default).

## 2. Deploy: local PC (default)

Prerequisites: Docker + Compose plugin + Git. Nothing else.

```bash
git clone https://github.com/ignaciobecher/orkpad.git
cd orkpad
./scripts/setup.sh
```

The script creates `.env` with random secrets, builds, starts, waits for the
API, and prints the URLs. Then:

1. Open the printed App URL (default `http://localhost:8080`).
2. Register an account (email verification is skipped without `RESEND_API_KEY`).
3. Done — data persists in the `orkpad_mongo_data` volume.

Manual equivalent (only if the script cannot run):

```bash
cp .env.example .env
# set JWT_SECRET + JWT_REFRESH_SECRET to long random strings (min 16 chars):
#   openssl rand -base64 48   (twice)
docker compose up -d --build
curl -sf http://localhost:3000/api   # expect HTTP 200 when ready
```

## 3. Deploy: VPS with public domain + HTTPS

Prerequisites: a VPS with Docker, plus DNS A records pointing to it
(e.g. `app.example.com` and `api.example.com`).

```bash
git clone https://github.com/ignaciobecher/orkpad.git
cd orkpad
./scripts/setup.sh --domain app.example.com --api api.example.com
# copies Caddyfile.example -> Caddyfile, edit the two hostnames, then:
sudo docker run -d --name caddy --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  -v caddy_data:/data -v caddy_config:/config \
  caddy:2
```

Rules:

- `VITE_API_URL` is **baked into the frontend at build time**: it MUST be set
  in `.env` **before** `docker compose up --build`. Changing it later requires
  `docker compose up -d --build frontend`.
- `FRONTEND_URL` must be the exact public origin (`https://app.example.com`).
- If `--domain` was forgotten, re-run with the flags then
  `docker compose up -d --build` (the script never overwrites `.env`
  secrets on re-run).
- Single-domain variant: `--domain app.example.com` serves the API under
  `https://app.example.com/api/*` via the Caddyfile's `/api/*` route.

## 4. Repo map (for code tasks, not deploys)

| Path | Notes |
|---|---|
| `docker-compose.yml` | Source of truth for services/ports/network |
| `.env` / `.env.example` | Single self-host config file (root). Backend reads it via `env_file` |
| `backend/src/main.ts` | Entrypoint; Swagger UI at `/api` doubles as readiness probe |
| `backend/CLAUDE.md` | Mandatory rules before touching backend code (multi-tenancy, soft delete) |
| `frontend/nginx.conf` | SPA serving; edit if adding `/api` proxying |
| `Caddyfile.example` | HTTPS reverse-proxy template for VPS |

## 5. Constraints for agents

- NEVER commit `.env` or print its secrets. Secrets stay on the target machine.
- NEVER run `docker compose down -v` unless the user explicitly asks to wipe
  data (it deletes the Mongo volume).
- NEVER invent env vars: the full list lives in `.env.example` (root) and
  `backend/.env.example`. Required: `JWT_SECRET`, `JWT_REFRESH_SECRET`.
- Port conflicts: if `3000`/`8080` are taken, copy
  `docker-compose.override.yml.example` to `docker-compose.override.yml`
  (git-ignored) and adjust — do NOT edit `docker-compose.yml` ports.
- Verify at the end: `docker compose ps` (all `running/healthy`) +
  `curl -sf <api>/api` returns 200. Report the App URL + API docs URL.

## 6. Troubleshooting (run in order)

1. `docker compose ps` — is `mongo` healthy? Backend waits for it.
2. `docker compose logs backend --tail=100` — missing `JWT_*` shows a
   fail-fast message telling you to copy `.env.example`.
3. `docker compose logs mongo --tail=50` — disk/permissions on the volume.
4. Blank app or CORS errors → `VITE_API_URL`/`FRONTEND_URL` mismatch: check
   `.env`, rebuild frontend (`docker compose up -d --build frontend`).
5. Still stuck: `docker compose up --build` in foreground to see the error.
