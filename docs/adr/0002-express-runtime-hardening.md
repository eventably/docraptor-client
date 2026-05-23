# ADR 0002: Express runtime hardening

## Status

Accepted — 2026-04-23

## Context

Issue #33 proposed several Express runtime-hardening items
(`helmet`, `express-rate-limit`, `cors`, `zod` input validation, `envalid`
boot-time env validation). ADR 0001 deferred these from the tooling-only PR
because they change runtime behavior and deserve their own review. This ADR
documents the decisions made when adopting them.

## Decisions

### `envalid` — boot-time env validation

All env vars are validated at boot via `config/env.js`. The process fails
fast if any required variable is missing or malformed, rather than erroring
later at the call site. Added variables with defaults: `NODE_ENV`,
`CORS_ORIGIN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`. Existing required
variables (`DOCRAPTOR_API_KEY`, `AWS_*`, `S3_BUCKET`) have no defaults and
will fail boot if missing.

### `zod` — request validation

Inlined per route rather than via a `validate(schema, source)` helper.
Rationale: the helper required dynamic property access (`req[source]`),
which trips `eslint-plugin-security/detect-object-injection` and adds
indirection for little gain across four routes. Direct `safeParse` calls
are clearer, statically analyzable, and remove the need for disable
comments.

Schemas:

- `PostBodySchema`: `html` (non-empty string up to 10MB), `uuid` (UUID v4).
- `UuidParamSchema`: `uuid` (UUID v4). Applied to all route params.

The prior manual `if (!html || !uuid)` check was removed — zod covers it
and returns a structured `flatten()` error payload.

### `helmet` — security headers

Default config. Also sets `app.disable('x-powered-by')` explicitly (helmet
does this too, but the disable is documented in the source). No CSP
customization — this API serves JSON only, no HTML to inline-script.

### `cors` — cross-origin policy

Reads `CORS_ORIGIN` env var as a comma-separated list of allowed origins.
Empty (default) → CORS is disabled (`origin: false`), same-origin only.
Methods explicitly allowlisted to `GET`, `HEAD`, `POST`, `DELETE`.

### `express-rate-limit` — per-IP rate limiting

Configurable via `RATE_LIMIT_WINDOW_MS` (default 15 minutes) and
`RATE_LIMIT_MAX` (default 100 requests per window). Emits standard
`RateLimit-*` headers and disables the legacy `X-RateLimit-*` variants.
Applied to all routes; a tighter limit for `POST /pdf` specifically can be
layered later if abuse is observed.

### `express.json` body limit

Set to `10mb`, matching the zod `MAX_HTML_BYTES` ceiling. Without this the
default is 100kb — too small for any non-trivial HTML document.

### Skipped from issue #33

- **`express-slow-down` for auth endpoints** — no auth endpoints exist in
  this service.
- **CSP in report-only mode** — this API returns JSON and PDF bytes, never
  HTML; there is nothing to CSP-protect.

## Consequences

- New required dev-time behavior: `.env` must contain the existing six
  required variables or `node index.js` exits at boot. This was already
  effectively required (the service would 500 on first request) — now the
  failure is explicit.
- Rate limiting applies to all routes including `GET/HEAD/DELETE`. If the
  service is ever placed behind a CDN or proxy, the limit will be scoped to
  the proxy's IP unless `trust proxy` is configured. Not set here since
  deployment topology is unknown.
- The CORS default is strict (same-origin only). Browser consumers from
  other origins must be added via `CORS_ORIGIN`.
- The 10MB body limit is conservative for HTML-to-PDF. Raise if large
  documents with inline images become common.

## Follow-ups

- Consider `app.set('trust proxy', …)` when deployment topology is known
  (PM2 behind nginx / ALB).
- Consider a stricter rate limit on `POST /pdf` specifically (DocRaptor
  calls cost money; GETs from S3 are cheap).
