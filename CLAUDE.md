# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js API service that proxies DocRaptor's HTML-to-PDF conversion service. It provides a REST API for creating, retrieving, checking, and deleting PDFs, with storage in Amazon S3. The service is specifically configured to generate accessible PDFs using PDF/UA-1 compliance.

## Development Commands

### Running the Application

- **Development mode**: `npm run dev` (uses nodemon for auto-restart)
- **Production mode**: `pm2 start ecosystem.config.js --env production`
- **Standard start**: `npm start`

### PM2 Management

- **Start**: `npm run start:prod`
- **Stop**: `npm run stop:prod`
- **Restart**: `npm run restart:prod`

### Testing

- **Run all tests**: `npm run test`
- Tests use Jest and Supertest
- Tests interact with real services (DocRaptor API and AWS S3) - no mocks are used
- Tests must clean up resources they create (PDFs are deleted after testing)

## Architecture

### Entry Point

- `index.js`: Express server setup, bootstraps the `/pdf` router

### Route Handler

- `routes/pdf.js`: Contains all PDF operations (POST, GET, HEAD, DELETE)
  - POST creates PDF via DocRaptor API and uploads to S3
  - GET retrieves PDF from S3
  - HEAD checks PDF existence in S3
  - DELETE removes PDF from S3

### Key Configuration

- **Accessibility features**: PDFs are generated with `accessibility: true`, `tag_svg: true`, and `pdf_profile: 'PDF/UA-1'`
- **Test mode**: DocRaptor API calls use `test: true` flag
- **AWS SDK**: Uses `@aws-sdk/client-s3` (v3) for S3 operations

### Logging

- `logger.js`: Bunyan logger configured to write to both stdout and `logs/app.log`

### Environment Variables

Required variables (see `.envSAMPLE`):

- `DOCRAPTOR_API_KEY`: API key for DocRaptor service
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_REGION`: AWS region for S3 bucket
- `S3_BUCKET`: S3 bucket name for PDF storage
- `PORT`: Server port (defaults to 3000)

## Git Workflow

This project follows Gitflow:

- **main**: Production-ready code
- **develop**: Latest development changes (default branch for PRs)
- **feature/**: Branch from develop for new features
- **bugfix/**: Branch from develop for bug fixes
- **release/**: Branch from develop for release preparation
- **hotfix/**: Branch from main for critical production fixes

Pull requests should target the `develop` branch.

## CI/CD

GitHub Actions workflow (`.github/workflows/test.yml`) runs Jest tests on PRs to `develop` branch. Tests require GitHub secrets for DocRaptor and AWS credentials.

## API Endpoints

- **POST /pdf**: Create PDF from HTML
  - Body: `{ "html": "<html>", "uuid": "unique-id" }`
  - Client must generate and provide UUID
- **GET /pdf/:uuid**: Retrieve PDF
- **HEAD /pdf/:uuid**: Check if PDF exists
- **DELETE /pdf/:uuid**: Delete PDF from S3
