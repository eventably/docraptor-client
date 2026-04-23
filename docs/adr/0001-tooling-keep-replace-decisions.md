# ADR 0001: Tooling keep-vs-replace decisions for issue #33

## Status

Accepted — 2026-04-23

## Context

Issue #33 proposes adopting a standardized quality/security/a11y/performance
tooling stack across Eventably projects. The issue's ground rules explicitly
state:

> Do not replace anything that already exists in this project unless the new
> proposal leads to a demonstrably higher quality outcome.

This project (`docraptor-client`) is a small CommonJS Node.js Express API — not
a React/TypeScript frontend. Many tools in the issue (React plugins, Stylelint,
Lighthouse, Playwright, Vitest, size-limit, `@afix/a11y-assert`, SEO/AIEO) do
not apply. This ADR documents what we kept, what we added, and what we
explicitly chose not to adopt.

## Decisions

### Kept as-is (no replacement)

| Tool                        | Why kept                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| Jest + supertest            | Works for this single-route API. Replacing with Vitest would be churn with no measurable benefit. |
| Bunyan                      | Working logger. Replacing with pino would be churn; both produce structured JSON logs.            |
| `markdownlint-cli`          | Functionally equivalent to `markdownlint-cli2` for this repo. Kept existing.                      |
| ESLint flat config          | Already in place with sensible Node rules; expanded rather than replaced.                         |
| Prettier                    | Already in place; config preserved.                                                               |
| jscpd                       | Already in place.                                                                                 |
| Husky                       | Already in place; hooks expanded.                                                                 |
| CommonJS (`require`)        | Migrating to ESM is out of scope; the runtime works.                                              |
| JavaScript (not TypeScript) | TS migration is a separate, larger decision. The codebase is ~120 LOC across three files.         |

### Added (genuinely new)

| Tool                                           | Purpose                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `eslint-plugin-security`                       | Node/Express-specific vulnerability patterns                      |
| `eslint-plugin-sonarjs`                        | Cognitive complexity, code smells, duplicate detection            |
| `eslint-plugin-n`                              | Node-specific rules (deprecated APIs, sync calls)                 |
| `eslint-plugin-promise`                        | Async/promise correctness                                         |
| `eslint-plugin-import-x`                       | Import hygiene (no self-import, no duplicates)                    |
| `eslint-plugin-no-secrets`                     | Catches pasted API keys/tokens                                    |
| `eslint-plugin-unicorn`                        | Modern JS patterns (tuned for CJS Node — many rules disabled)     |
| `eslint-plugin-jsdoc`                          | Validates JSDoc tags/params on documented functions               |
| `commitlint` + conventional                    | Enforces conventional commit messages via `commit-msg` hook       |
| `gitleaks`                                     | Pre-commit secret scanning (graceful skip if not installed)       |
| `osv-scanner`                                  | Dependency vulnerability scanning (via `npm run security:osv`)    |
| `semgrep`                                      | SAST with OWASP Top 10 ruleset (via `npm run security:semgrep`)   |
| `lychee`                                       | Markdown link checker (via `npm run links`)                       |
| `license-checker-rseidelsohn`                  | License compliance (allowlist approach)                           |
| Husky `commit-msg` / `pre-push` / `post-merge` | Conventional-commit enforcement, pre-push gates, post-merge audit |
| `scripts/bootstrap.sh`                         | Installs binary tools (gitleaks, osv-scanner, semgrep, lychee)    |

### Explicitly skipped — not applicable to this project

| Tool / Topic                                                             | Reason                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| TypeScript, `ts-reset`, `tsc-files`                                      | Project is CommonJS JavaScript                                                        |
| `eslint-plugin-react*`, `jsx-a11y`                                       | No React / no JSX                                                                     |
| Stylelint, `@double-great/stylelint-a11y`                                | No CSS/SCSS                                                                           |
| Vitest, React Testing Library, MSW                                       | No browser-side code; Jest + supertest sufficient                                     |
| Playwright, `@afix/a11y-assert`                                          | No UI to test end-to-end                                                              |
| Lighthouse CI, `size-limit`, `web-vitals`                                | No frontend bundle                                                                    |
| SEO/AIEO tooling (`react-helmet-async`, `schema-dts`, sitemap, llms.txt) | No web pages served                                                                   |
| `helmet`, `express-rate-limit`, `cors`, `zod`, `envalid`                 | Initially deferred; now adopted — see [ADR 0002](./0002-express-runtime-hardening.md) |
| `pino`                                                                   | Bunyan is already in use and working                                                  |
| React Compiler, Vite, tsup                                               | No build step required                                                                |

### Explicitly skipped — conflicts with existing project decisions

| Tool / Topic                                                      | Reason                                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Dependabot                                                        | Intentionally disabled in commit `a0dd2ea`                                    |
| CodeQL (scheduled)                                                | Intentionally disabled in commit `a0dd2ea`                                    |
| Scheduled GitHub Actions (`docs.yml`, `security.yml` weekly runs) | Intentionally disabled in commit `a0dd2ea`                                    |
| Committed `.npmrc`                                                | `.npmrc` is gitignored in this project (line 8/39 of `.gitignore`); respected |

## Consequences

- Tooling stays focused on what this tiny Node.js API actually benefits from.
- Binary-dependent scripts (gitleaks, semgrep, etc.) skip gracefully when tools
  aren't installed. New contributors should run `bash scripts/bootstrap.sh`.
- The Express runtime-hardening items (helmet, rate-limit, zod, envalid) are
  left for a follow-up issue since they change runtime behavior and deserve
  their own review.
- `docs/` is no longer wholesale gitignored; only `docs/generated/` is. This
  enables checking in ADRs and templates.

## Follow-ups

- ~~Adopt Express runtime hardening~~ — done in [ADR 0002](./0002-express-runtime-hardening.md).
