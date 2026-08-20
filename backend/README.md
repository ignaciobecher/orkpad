# Orkpad

**Orkpad** is an open source, multi-tenant SaaS backend for freelancers. It provides a single place to run the operational side of a freelance business: clients, projects, tasks, invoices, quotes, time tracking, leads, a sales pipeline, a planner, and marketing tools.

Data is isolated per workspace: multiple users can collaborate inside a workspace, and every query is enforced to stay within it.

> This repository contains the **backend API**. It is designed to be consumed by a frontend application and exposes a Swagger/OpenAPI surface plus realtime Socket.IO channels for messaging and support.

## Features

- **Client CRM** — manage clients and their contact information.
- **Projects & tasks** — projects with shareable external links, tasks, checklists, and kanban-style columns.
- **Invoices & quotes** — invoicing with PDF generation and quote/estimate tracking.
- **Time tracking** — work sessions and time logs per project/task.
- **Leads & outreach** — lead searches, scraping sources (e.g. Google Places), email campaigns, and outreach workflows.
- **Pipeline** — sales pipeline (deals) with stages.
- **Planner** — planner blocks, tasks, and reusable templates.
- **Marketing** — marketing templates, social identity tracking, goals, growth hub, gamification, and an academy/resources area for learning content.
- **Realtime** — Socket.IO channels for client↔admin messaging and support conversations.
- **Notifications** — in-app notifications and web push (VAPID).
- **Authentication** — email/password with JWT access + refresh tokens, GitHub OAuth, Google OAuth, WebAuthn passkeys, and TOTP two-factor auth.
- **Integrations** — GitHub, Google (OAuth, Gmail, Calendar, Places), Railway Deployments, Netlify, and Supabase.

## Architecture

Built with **NestJS** and **MongoDB via Mongoose**, Orkpad follows a strict multi-tenant architecture:

- **Workspace isolation** — every document carries a `workspaceId`, and the `WorkspaceTenantInterceptor` attaches the tenant context from the JWT on every request. See [`docs/architecture/MULTI_TENANCY.md`](docs/architecture/MULTI_TENANCY.md).
- **Repository pattern** — services never touch raw Mongoose models. All data access goes through repository classes that extend `BaseRepository`, which enforces the `workspaceId` filter and soft-delete automatically.
- **Soft deletes** — documents are soft-deleted (`isDeleted`, `deletedAt`) instead of hard-deleted.
- **Module layout** — every feature lives in its own module under `src/modules/` with a strict file convention. See [`docs/architecture/MODULE_STRUCTURE.md`](docs/architecture/MODULE_STRUCTURE.md) and [`docs/architecture/DATABASE.md`](docs/architecture/DATABASE.md).
- **Code style** — TypeScript, kebab-case file names, PascalCase class names, Prettier with single quotes and trailing commas.

For a full contributor-oriented guide, read [`CLAUDE.md`](CLAUDE.md).

## Requirements

- Node.js >= 20
- MongoDB (local or remote), or a free Atlas cluster

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment from the template
cp .env.example .env

# 3. Fill in the required values in .env (at minimum MONGODB_URI)

# 4. Start in watch mode (development)
npm run start:dev
```

The server runs on `http://localhost:3000` by default (configurable via `PORT`).

## Environment Variables

All environment variables are documented with comments in [`.env.example`](.env.example). Key ones:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default: 3000) |
| `NODE_ENV` | `development`, `test`, or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `FRONTEND_URL` | Origin of the frontend app (CORS, emails, auth redirects) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets for signing access / refresh tokens |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Access / refresh token TTLs |
| `FROM_EMAIL` | Sender address for transactional emails |
| `RESEND_API_KEY` | Resend API key for emails |
| `ADMIN_USER_ID` / `ADMIN_EMAIL` | Platform admin user id and notification email |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web push configuration |

## Swagger / API Docs

With the server running, the OpenAPI documentation is available at:

```
http://localhost:3000/api
```

## Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e
```

## Repository Structure

```
├── docs/architecture/   # Multi-tenancy, module structure, and DB conventions
├── scripts/             # Helper scripts (e.g. resource seeding)
├── src/
│   ├── common/          # Base repository, guards, decorators, interceptors, filters
│   ├── modules/         # Feature modules (auth, clients, projects, invoices, ...)
│   ├── app.module.ts    # Root module
│   └── main.ts          # Bootstrap (CORS, validation, Swagger)
├── test/                # E2E tests
├── .env.example         # Committed environment template
├── CLAUDE.md            # Contributor guide
└── package.json
```

## License

Licensed under the [Apache License 2.0](LICENSE). Copyright 2026 Orkpad contributors.