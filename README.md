# Tiny URL

A TypeScript and Express API for creating short links and redirecting visitors to their destinations. PostgreSQL stores links, and Redis caches JSON responses.

## Requirements

- Node.js 22 or newer
- npm
- PostgreSQL 15 or newer
- A Redis service available to the application

## Getting Started

Install dependencies, configure the database and Redis, then start the development server:

```bash
npm install
npm run dev
```

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/tiny_url
REDIS_URL=redis://localhost:6379
```

`DATABASE_URL` is required. `REDIS_URL` is optional in environment validation, but the application connects to Redis during startup, so a reachable Redis service is needed. The server listens on port `3000` by default; set `PORT` to override it.

## Docker

Build the production image and run it with PostgreSQL and Redis connection URLs supplied through the environment:

```bash
docker build -t tiny-url .
docker run --rm -p 3000:3000 --env DATABASE_URL --env REDIS_URL tiny-url
```

Set `DATABASE_URL` and `REDIS_URL` in the host environment before running the container. Both services must be reachable from the container; when they run in other containers, connect them to the same Docker network and use their service names as hostnames.

## Configuration

The environment loader selects a file using the `NODE_ENV` value already present in the process before dotenv loads:

- `development` checks `.env.dev`, `.env.development`, `.env.local`, then `.env`.
- `production` checks `.env.prod`, `.env.production`, then `.env`.
- `test` checks `.env.test`, then `.env`.
- If `NODE_ENV` is unset or unrecognized, only `.env` is checked. The validated runtime value defaults to `development`.

Existing process environment variables take precedence over values loaded from the selected file.

| Variable | Required | Default / validation | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development`; allowed values are `development`, `production`, and `test` | Selects the runtime mode and environment file. |
| `PORT` | No | `3000`; coerced to an integer | HTTP server port. |
| `DATABASE_URL` | Yes | Must be a non-empty string | PostgreSQL connection string used by the Prisma ORM client. |
| `REDIS_URL` | No | No schema default | Redis connection URL used by response caching. |

Do not commit real credentials or secrets.

## Database Schema

Prisma defines the PostgreSQL table `public."Link"` in `src/prisma/contract.ts`:

| Column | Type | Nullability | Constraint |
| --- | --- | --- | --- |
| `id` | `integer` | `NOT NULL` | Primary key; supplied by the application |
| `url` | `text` | `NOT NULL` | None |
| `slug` | `text` | `NULL` | None |

The contract currently declares no unique indexes or database defaults. The application creates the ID, derives a Base62 slug from it, then stores that slug on the link.

## API

### `POST /`

Creates a short link. The request body must contain a valid URL:

```json
{
  "url": "https://example.com"
}
```

Returns `201` with the generated slug:

```json
{
  "slug": "..."
}
```

If the URL is already stored, the existing slug is returned.

### `GET /:slug`

Looks up the slug and redirects to its HTTPS destination. If no link exists for the slug, the API returns `404`.

## Caching

The cache middleware runs before the link routes. It keys cached JSON responses by request method, path, query, and body, and stores them in Redis for 300 seconds. Redis must be reachable when the application starts.

## Project Structure

```text
src/
  app.ts                   Express app setup and route registration
  index.ts                 HTTP server entry point
  config/                  Environment, Redis, and Express app configuration
  controllers/             Link creation and redirect handlers
  lib/                     Shared utilities
  middlewares/             Cache, link, error, and handler middleware
  prisma/                  PostgreSQL ORM client and contract
  redis/                   Redis cache helpers
  routes/                  Link route registration
  types/                   Shared Express types
  validators/              Request validation
tests/
  unit/                    Unit tests
  integration/             HTTP integration tests
```

## Scripts

```bash
npm run dev        # Start the watch-mode development server
npm run build      # Compile TypeScript and resolve imports for native ESM
npm start          # Build and run the production application
npm test           # Run Jest tests
npm run typecheck  # Check types without emitting files
```

The build runs `tsc` followed by `tsc-alias --resolve-full-paths`. This rewrites configured aliases and adds `.js` extensions to resolvable extensionless imports in the emitted files, as required by native Node.js ESM.

Run the checks before submitting changes:

```bash
npm run typecheck
npm test -- --runInBand
npm run build
```
