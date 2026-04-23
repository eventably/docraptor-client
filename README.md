# DocRaptor Client

This project is a Node.js-based API that proxies the [DocRaptor](https://docraptor.com/) service. It provides routes for creating, retrieving, checking, and deleting PDFs. The resulting PDFs are stored in an Amazon S3 bucket.

The PDFs created by DocRaptor should be accessible. However, the level of accessibility is predicated upon the service being fed accessible HTML to begin with. Furthermore, you should be aware that there are some inherent limits in PDF for making certain kinds of content accessible. That said, clean, well-structured HTML should result in an accessible PDF from the DocRaptor service.

## Features

- **POST**: Accepts an HTML string and UUID, generates a PDF using DocRaptor, and uploads it to an S3 bucket.
- **GET**: Retrieves and downloads the PDF from the S3 bucket.
- **HEAD**: Checks if the PDF exists in the S3 bucket.
- **DELETE**: Deletes the PDF from the S3 bucket.
- Uses Bunyan for logging.
- Uses Nodemon for development.
- Uses PM2 for production.
- Uses Jest and Supertest for testing.
- Uses dotenv for environment variable management.

## Installation

1. Clone the repository:

   ```sh
   git clone git+ssh://git@github.com/eventably/docraptor-client.git
   cd docraptor-client
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root of the project using `.envSAMPLE` as your guide for the content needed.

4. Ensure that your S3 bucket permissions are correct.

5. (Optional) Install local security and link-checking binaries used by the
   `security:*` and `links` scripts:

   ```sh
   bash scripts/bootstrap.sh
   ```

   The scripts skip gracefully on machines without these binaries, so bootstrap
   is only required if you want pre-commit secret scanning and the full
   `npm run check:all` pipeline to run.

## Usage

### Development

To start the server in development mode with Nodemon:

```sh
npm run dev
```

### Production

To start the server in production mode with PM2:

```sh
pm2 start ecosystem.config.js --env production
```

### API Endpoints

- **POST /pdf**
  - Request Body: `{ "html": "<html content>", "uuid": "unique-id" }`
  - Response: `201 Created`

  Note: You are responsible for generating the UUID when POSTing the request

- **GET /pdf/:uuid**
  - Response: PDF file

- **HEAD /pdf/:uuid**
  - Response: `200 OK` if exists, `404 Not Found` if not

- **DELETE /pdf/:uuid**
  - Response: `200 OK` if deleted, `500 Internal Server Error` if error

### Testing

To run tests:

```sh
npm run test
```

### Quality gates

| Script                 | What it runs                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run lint`         | ESLint                                                |
| `npm run format:check` | Prettier check                                        |
| `npm run lint:md`      | markdownlint                                          |
| `npm run check`        | lint + format check + markdown lint                   |
| `npm run check:all`    | `check` + tests + duplication + license check + links |
| `npm run security`     | npm audit + OSV + Semgrep + secret scan               |

Husky hooks run `lint-staged` + secret scan on commit, commitlint on the
commit message, and `npm run check` on push. Binary-dependent steps
(gitleaks, osv-scanner, semgrep, lychee) skip gracefully when the binaries
aren't installed; run `scripts/bootstrap.sh` to install them.

### Architecture Decision Records

Significant tooling and architecture decisions live in [`docs/adr/`](./docs/adr).
Templates for new ADRs and READMEs are in [`docs/templates/`](./docs/templates).

## Logging

The application uses Bunyan for logging. Logs are printed to the console _and_ to file by default. Feel free to modify this behavior in `./logger.js`

## Environment Variables

The application uses `dotenv` + [`envalid`](https://github.com/af/envalid) to
validate environment variables at boot. If any required variable is missing or
malformed, the process exits immediately with a descriptive error.

| Variable                | Required | Default        | Purpose                                                      |
| ----------------------- | -------- | -------------- | ------------------------------------------------------------ |
| `DOCRAPTOR_API_KEY`     | yes      | —              | API key for DocRaptor                                        |
| `AWS_ACCESS_KEY_ID`     | yes      | —              | AWS credentials                                              |
| `AWS_SECRET_ACCESS_KEY` | yes      | —              | AWS credentials                                              |
| `AWS_REGION`            | yes      | —              | AWS region for the S3 bucket                                 |
| `S3_BUCKET`             | yes      | —              | S3 bucket name for PDF storage                               |
| `PORT`                  | no       | `3000`         | Server port                                                  |
| `NODE_ENV`              | no       | `development`  | One of `development` \| `test` \| `production`               |
| `CORS_ORIGIN`           | no       | (empty)        | Comma-separated list of allowed origins; empty = same-origin |
| `RATE_LIMIT_WINDOW_MS`  | no       | `900000` (15m) | Rate limit window per IP                                     |
| `RATE_LIMIT_MAX`        | no       | `100`          | Max requests per window per IP                               |

See [`docs/adr/0002-express-runtime-hardening.md`](./docs/adr/0002-express-runtime-hardening.md)
for hardening details (helmet, rate limiting, zod input validation, CORS).

## License

This project is licensed under the MIT License.
