# {Project name}

One-sentence description of what this project does and for whom.

## Features

- Bullet the key capabilities users/consumers care about.

## Installation

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd <project-dir>
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy `.envSAMPLE` (or equivalent) to `.env` and fill in required values.

4. Optional: install binary tooling used by security scripts:

   ```sh
   bash scripts/bootstrap.sh
   ```

## Usage

Describe the primary ways to run the project (dev, prod, CLI invocations).

## Scripts

| Script                 | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start in development mode                |
| `npm test`             | Run test suite                           |
| `npm run lint`         | Lint the codebase                        |
| `npm run format:check` | Verify Prettier formatting               |
| `npm run check`        | Lint + format check + markdown lint      |
| `npm run check:all`    | `check` + tests + duplication + licenses |
| `npm run security`     | Audit + OSV + Semgrep + secret scan      |

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

{MIT | Apache-2.0 | …}
