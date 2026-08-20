# Orkpad Backend — Technical Context

Orkpad is an open source multi-tenant SaaS backend for freelancers. It lets freelancers manage clients, projects, tasks, invoices, time tracking, leads, marketing, and more — all isolated per workspace. Multiple users can share a workspace, but data is always strictly scoped to that workspace.

## IMPORTANT: Before writing any code, read ALL files in the Required Reading section below.

Skipping any of these documents will result in security issues (data leaking between workspaces), broken architecture, or inconsistent patterns that block the rest of the team.

---

## Required Reading

Every contributor that touches this codebase MUST read these files before producing any code:

- [`docs/architecture/MULTI_TENANCY.md`](docs/architecture/MULTI_TENANCY.md) — The most critical document. Defines the workspaceId contract, BaseRepository, interceptor, and decorator.
- [`docs/architecture/MODULE_STRUCTURE.md`](docs/architecture/MODULE_STRUCTURE.md) — Exact folder layout, file naming, boilerplate templates, and registration steps for every module.
- [`docs/architecture/DATABASE.md`](docs/architecture/DATABASE.md) — MongoDB/Mongoose conventions: BaseSchema, soft delete policy, index strategy, naming rules.

---

## Absolute Rules (no exceptions)

1. **Every Mongoose document MUST include `workspaceId`.** No schema exists without it.
2. **Every repository query MUST filter by `workspaceId`.** Use `BaseRepository` — it enforces this automatically.
3. **Never hard-delete documents.** Always use soft delete (`isDeleted: true`, `deletedAt: now`). The only exception is an explicit, irreversible owner account-deletion flow.
4. **Never write raw `Model.find()` calls in services.** All database access goes through a repository class that extends `BaseRepository`.
5. **Every new module must be registered in `AppModule` imports.** Forgetting this silently breaks DI.
6. **Every controller must have a `@ApiTags()` Swagger decorator.** No untagged endpoints.
7. **DTOs must use `class-validator` decorators for all inputs.** Never trust raw request bodies.
8. **File names are kebab-case. Class names are PascalCase.** `invoice-line.service.ts` exports `InvoiceLineService`.
9. **Indexes are not optional.** Every new collection requires at minimum a `workspaceId` index and a compound index for its most common query pattern.
10. **No business logic in controllers.** Controllers only parse the request and delegate to the service.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS v11 |
| Language | TypeScript (strict mode) |
| Database | MongoDB via Mongoose |
| Auth | JWT (access + refresh tokens), GitHub OAuth, Google OAuth, WebAuthn, TOTP 2FA |
| Validation | class-validator + class-transformer |
| Emails | Resend |
| Push notifications | web-push (VAPID) |
| Realtime | Socket.IO (messaging + support) |
| API docs | Swagger / OpenAPI (`@nestjs/swagger`) |
| Testing | Jest + Supertest |
| Formatting | Prettier (single quotes, trailing commas) |
| Linting | ESLint |

---

## Running the Project Locally

Requirements: Node.js (>= 20) and a local or remote MongoDB instance.

```bash
# Install dependencies
npm install

# Create your local environment from the committed template
cp .env.example .env

# Fill in the required values in .env (at minimum MONGODB_URI)
# then start in watch mode (development)
npm run start:dev
```

The server starts on `http://localhost:3000` by default (or the `PORT` env var).

Swagger UI is available at `http://localhost:3000/api` when running in development mode.

---

## Running Tests

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

Unit test files live next to the source files they test (`*.spec.ts`). E2E tests live in `test/`.

---

## Environment Variables

A committed [`./.env.example`](./.env.example) file lists every variable the application reads. Copy it to `.env` and fill in the values for your setup.

Key variables:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default: 3000) |
| `NODE_ENV` | `development`, `test`, or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `FRONTEND_URL` | Origin of the frontend app (used for CORS, emails, and auth redirects) |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `FROM_EMAIL` | Sender address for transactional emails |
| `ADMIN_USER_ID` | User id of the platform admin (used by `AdminGuard`) |
| `ADMIN_EMAIL` | Email where admin notifications are sent |

---

## Project Structure Overview

```
src/
├── common/
│   ├── base/                # BaseRepository, BaseService, BaseSchema
│   ├── cors/                # Shared CORS origin builder
│   ├── decorators/          # @WorkspaceId(), @CurrentUser(), etc.
│   ├── filters/             # GlobalExceptionFilter
│   ├── guards/              # JwtAuthGuard, AdminGuard, WorkspaceGuard
│   ├── interceptors/        # WorkspaceTenantInterceptor
│   └── pipes/               # ValidationPipe config
├── modules/
│   ├── auth/                # Auth, JWT refresh, OAuth, WebAuthn, 2FA
│   ├── users/               # User profiles
│   ├── workspaces/          # Workspace lifecycle and membership
│   ├── clients/             # Client CRM
│   ├── projects/            # Projects and shareable project links
│   ├── tasks/               # Tasks and checklists
│   ├── task-columns/        # Kanban-style task columns
│   ├── invoices/            # Invoices with PDF generation
│   ├── quotes/              # Quotes / estimates
│   ├── time-tracking/       # Work sessions and time logs
│   ├── pipeline/            # Sales pipeline (deals)
│   ├── products/            # Reusable products / services
│   ├── subscriptions/       # Recurring billing models
│   ├── leads/               # Lead management
│   ├── lead-searches/       # Lead discovery lists
│   ├── lead-scraping/       # Lead enrichment sources (e.g. Google Places)
│   ├── lead-campaigns/      # Email outreach campaigns
│   ├── outreach/            # Outreach workflows
│   ├── planner-blocks/      # Planner / calendar blocks
│   ├── planner-tasks/       # Planner tasks
│   ├── planner-templates/   # Planner templates
│   ├── marketing/           # Marketing resources and templates
│   ├── social-identity/     # Social media accounts
│   ├── goals/               # Goals tracking
│   ├── growth-hub/          # Growth aggregates
│   ├── gamification/        # XP / achievements
│   ├── learning/            # Academy / learning content
│   ├── resources/           # Educational resources (Academy)
│   ├── testimonials/        # Client testimonials
│   ├── portfolio/           # Portfolio items
│   ├── notes/               # Notes
│   ├── dashboard/           # Dashboard aggregates
│   ├── messaging/           # Client<->admin realtime chat (Socket.IO)
│   ├── support/             # Support conversations (Socket.IO)
│   ├── notifications/       # In-app notifications
│   ├── push-subscriptions/  # Web push notifications (VAPID)
│   ├── mail/                # Transactional email templates (Resend)
│   ├── docs/                # Documents / resources
│   ├── infrastructure/      # Infrastructure resources
│   ├── agenda/              # Events / calendar
│   ├── work-sessions/       # Pomodoro-style sessions
│   ├── github-integration/  # GitHub API integration
│   ├── google-integration/  # Google OAuth, Gmail, Calendar, Places
│   ├── railway-integration/ # Railway Deployments API integration
│   ├── netlify-integration/ # Netlify API integration
│   └── supabase-integration/# Supabase API integration
├── app.module.ts
└── main.ts
```