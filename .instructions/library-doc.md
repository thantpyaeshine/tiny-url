# Dependency Guide

Keep this guide aligned with the direct dependencies declared in the root `package.json`. Use each library's official documentation for API details; this file records how the project uses each package.

## Runtime dependencies

| Package | Declared version | Project use |
| --- | --- | --- |
| `@prisma/orm-postgres` | `^8.0.0-rc.21` | PostgreSQL contract builder and runtime ORM client in `src/prisma/`. |
| `base62` | `^2.0.2` | Encodes persisted link IDs as URL slugs in `src/controllers/link.controller.ts`. |
| `cookie-parser` | `^1.4.7` | Parses request cookies in `src/config/app.config.ts`. |
| `cors` | `^2.8.6` | Configures cross-origin request handling in `src/config/app.config.ts`. |
| `dotenv` | `^17.4.2` | Loads the selected environment file in `src/config/env.config.ts`. |
| `express` | `^5.2.1` | HTTP app, routers, middleware, and request handling. |
| `express-validator` | `^7.3.2` | Validates link URL and slug parameters in `src/validators/`. |
| `morgan` | `^1.12.1` | HTTP request logging in `src/config/app.config.ts`. |
| `pg` | `^8.23.1` | PostgreSQL driver dependency for the ORM runtime. |
| `redis` | `^6.3.0` | Redis connection and cache operations in `src/config/redis.config.ts` and `src/redis/`. |
| `zod` | `^4.6.5` | Runtime environment schema validation in `src/config/env.config.ts`. |

## Development and build dependencies

| Package | Declared version | Project use |
| --- | --- | --- |
| `@prisma/cli-engine` | `^0.9.0` | Prisma CLI tooling used by the contract workflow. |
| `@types/cookie-parser` | `^1.4.10` | Cookie-parser type definitions. |
| `@types/cors` | `^2.8.19` | CORS type definitions. |
| `@types/express` | `^5.0.6` | Express type definitions. |
| `@types/morgan` | `^1.9.10` | Morgan type definitions. |
| `@types/node` | `^22.20.5` | Node.js API and process types. |
| `add` | `^2.0.9` | Declared development utility; not used by the application build scripts. |
| `cross-env` | `^10.1.0` | Sets `NODE_ENV` portably in the `start` and `dev` scripts. |
| `jest` | `^30.2.0` | Test runner invoked by the `test` script. |
| `prisma` | `^8.0.0-rc.28` | Prisma CLI used by `contract:emit`. |
| `ts-jest` | `^29.1.2` | Transforms TypeScript tests with the ESM preset. |
| `tsc-alias` | `^1.9.7` | Rewrites emitted aliases and resolves extensionless imports for native ESM during `npm run build`. |
| `tsx` | `^4.23.15` | Runs and watches `src/index.ts` during development. |
| `typescript` | `~5.9.3` | Strict type checking and ESM compilation configured in `tsconfig.json`. |

## Dependency maintenance

- Add runtime libraries to `dependencies` and development/build/test tools to `devDependencies`.
- Use npm to change dependencies so `package-lock.json` remains synchronized.
- Before introducing a dependency, check whether Node.js or an existing package already provides the needed capability. Review compatibility with the project's Node.js 22+ and ESM setup.
- When adding or removing a direct dependency, update this guide with its role and usage location. Remove unused direct dependencies only after checking repository and tooling usage.
