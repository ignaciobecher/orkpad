# Security Policy

We take the security of Orkpad seriously.

## Supported versions

Only the latest release on the `main` branch is actively supported with security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report vulnerabilities privately through GitHub's Security Advisories:

**https://github.com/ignaciobecher/orkpad/security/advisories/new**

Include as much detail as possible:

- Project and version affected
- Type of issue (e.g., cross-tenant data access, auth bypass, injection, XSS)
- Steps to reproduce
- Impact and suggested remediation (if known)

You will receive an acknowledgement as soon as possible, and we will work with you to coordinate a fix and disclosure.

## Scope

Everything in this repository is in scope, especially:

- Workspace (tenant) data isolation
- Authentication, sessions, OAuth, WebAuthn and 2FA flows
- Authorization/guards (admin, project link access)
- Realtime (Socket.IO) channels

## Good practices for maintainers

- Never commit real secrets, `.env` files, or generated credentials.
- Configuration and credentials live in environment variables only. `.env.example` files contain placeholders.
- Rotate any credential that may have been exposed.
