# Contributing to Orkpad

Thanks for your interest in contributing! This project is open source (Apache-2.0) and community-driven. Whether you are fixing a bug, adding a feature, improving docs, or answering questions — all contributions are welcome.

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.

## Getting started

Requirements: Node.js `^20.19.0` or `>=22.12.0`, npm, and MongoDB (local, Docker, or a remote cluster).

### 1. Fork and clone

```bash
git clone https://github.com/ignaciobecher/orkpad.git
cd orkpad
```

Create a branch for your work:

```bash
git checkout -b fix/describe-the-fix
```

### 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

The API and Swagger will be available at `http://localhost:3000` (`/docs`).

### 3. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project structure

```
orkpad/
  backend/    # NestJS multi-tenant API (MongoDB, Socket.IO)
  frontend/   # Vue 3 application (Vite, Vuetify, Tailwind, Pinia)
```

Each app has its own `README.md` and `.env.example`.

## Conventions

- **TypeScript, strict mode** in both apps.
- **Formatting:** Prettier (single quotes, trailing commas). Run `npm run format` or the per-app `npm run lint`.
- **Backend file naming:** kebab-case files, PascalCase classes (`invoice-line.service.ts` → `InvoiceLineService`).
- **Multi-tenancy is non-negotiable:** every Mongo document carries a `workspaceId`, every query stays scoped to the workspace, and documents are soft-deleted, never hard-deleted.

## Commit messages

Use [conventional commits](https://www.conventionalcommits.org/):

```
feat: add X
fix: correct Y
docs: update Z
chore: ...
refactor: ...
```

## Opening a pull request

1. Make sure the app still builds and lints:
   - Backend: `npm run build` and `npm run lint`
   - Frontend: `npm run build` and `npm run lint`
2. Add tests where possible.
3. Fill out the pull request template.
4. Reference any related issue.

## Reporting bugs & security issues

- **Bugs and feature requests:** open a [GitHub issue](https://github.com/ignaciobecher/orkpad/issues).
- **Security vulnerabilities:** do **not** open a public issue. Use the [Security Advisories](https://github.com/ignaciobecher/orkpad/security/advisories) page — see [SECURITY.md](./SECURITY.md).
