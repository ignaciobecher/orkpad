# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Project billing plans (`single` / `installments`) with one-click installment
  invoice generation (`POST /projects/:id/generate-invoices`).
- Project detail reworked as lazy tabs (Resumen, Tareas, Finanzas, Archivos,
  GitHub) with billing progress and installment badges.
- Recurring income/expenses (servers, SaaS, client retainers).
- Extended onboarding: 6-step checklist, finance tour pillar, `?new=1`
  deep links, demo data with quote + retainer, guided empty states.
- Single root `.env` self-host setup, compose fail-fast secrets, mongo
  healthcheck, `docker-compose.override.yml.example`.

### Removed
- Marketing landing (root URL redirects to registration).
- Google integrations (OAuth login, Calendar, Gmail, Places).
- Lead scraping section and lead-searches.
- Infrastructure monitoring (Railway, Netlify, Supabase integrations).
- Sales pipeline, leads, portfolio, academy, products, growth/gamification.

## [0.1.0] - 2026-10-01

- Initial open-source monorepo release (Apache-2.0).
- Self-hostable Docker stack, contributing docs, community files.
