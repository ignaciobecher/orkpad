# Orkpad

**Orkpad** is an open-source app for freelancers. It replaces the broken Excel, the outdated Notion, and the scattered WhatsApp reminders. CRM, projects, time tracking, and billing — in one self-hostable place, under your control.

The root URL (`/`) redirects to registration — there is no marketing landing page: a self-hosted instance opens directly into the product.

## Features

- **Work**: dashboard, clients, projects, Kanban tasks, and time tracking.
- **Sales**: visual pipeline to move prospects from first contact to close, plus leads and email campaigns.
- **Finance**: invoicing, expenses, quotes, balance and cash-flow reports, and recurring subscriptions.
- **Operations**: product catalog and recurring subscriptions.
- **Knowledge**: internal documentation (docs) and an interactive agenda.
- **Advanced**: automated task-completion notifications, client portal (coming soon), portfolio builder, marketing toolkit, and social identity manager.
- **Internationalization**: UI in Spanish and English (switchable from the app settings).
- **PWA**: installable offline-first web app.
- **Self-hosted & privacy-first**: each workspace is isolated and all data can be exported at any time.

## Tech Stack

- **Vue 3** (Options API) + **Vite**
- **Vuetify 3** (custom dark/premium theme with sharp edges)
- **Tailwind CSS**
- **Pinia** (state management)
- **vue-router** (typed routes with auth guards)
- **vue-i18n** (es/en)
- **Axios** (API client with JWT refresh)
- **Socket.IO** (realtime updates)
- **TypeScript** (strict mode)
- **PWA** via vite-plugin-pwa

## Requirements

- **Node.js** `^20.19.0` or `>=22.12.0`
- A running instance of the backend API (see the [`backend`](../backend) directory in this monorepo)`

## Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/ignaciobecher/orkpad.git
cd orkpad

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Script        | Description                                  |
| ------------- | -------------------------------------------- |
| `npm run dev` | Start the Vite dev server                    |
| `npm run build` | Build the app for production              |
| `npm run preview` | Preview the production build             |
| `npm run lint` | Lint the codebase (oxlint + eslint)        |
| `npm run format` | Format sources with Prettier              |
| `npm run test:e2e` | Run Playwright end-to-end tests         |

## Repository Structure

```
src/
  api/          # API service modules (one folder per domain)
  assets/       # Design tokens, CSS, and static assets
  components/   # UI, layout, and feature components
  composables/  # Reusable composition functions
  constants/    # Shared constants (e.g. community links)
  locales/      # vue-i18n translations (es/en)
  pages/        # Route-level pages (auth, app)
  router/       # Vue Router configuration and guards
  stores/       # Pinia stores
  utils/        # Formatting and helper utilities
e2e/            # Playwright end-to-end tests
public/         # Static assets (icons, og image, robots, sitemap)
```

## Contributing

Contributions are welcome! Open an issue, join a discussion, or submit a pull request. See [CONTRIBUTING](./CONTRIBUTING.md) for guidelines if present.

- Issues: https://github.com/ignaciobecher/orkpad/issues
- Discussions: https://github.com/ignaciobecher/orkpad/discussions
- Roadmap: https://github.com/ignaciobecher/orkpad/projects

## License

Licensed under the [Apache License, Version 2.0](./LICENSE). Copyright 2026 Orkpad contributors. See the [LICENSE](./LICENSE) file for details.

The frontend pairs with the [`backend`](../backend) API in the same monorepo.