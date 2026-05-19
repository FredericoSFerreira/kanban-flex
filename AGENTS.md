# AGENTS.md — KanbanFlex

## Project Layout

- `src/` — Vue 3 + Vite frontend (entry: `src/main.ts`)
- `backend/` — Express + Parse Server API (entry: `backend/index.js`)
- Both are **ESM** (`"type": "module"`).

## Frontend

### Commands (run from repo root)
- `npm install` — install deps
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — type-check + build for production (`run-p` parallelizes `build-only` and `type-check`)
- `npm run build-only` — build without type-check
- `npm run type-check` — `vue-tsc --build --force`
- `npm run lint` — ESLint with auto-fix (`eslint . --fix`)
- `npm run test:unit` — Vitest (jsdom environment, excludes `e2e/**`)

### Notes
- Uses `vue-tsc` instead of `tsc` for `.vue` type support.
- Vitest config merges with `vite.config.ts`; tests run in jsdom.
- Path alias `@/` maps to `src/`.

## Backend

### Commands (run from `backend/`)
- `npm install` — install deps
- `docker-compose up` — starts MongoDB, Redis, and LocalStack (S3)
- `npm run migrate` — run MongoDB migrations (`migrate-mongo up`)
- `npm start` — start production server (`node index.js`)
- `npm run dev` — dev server with nodemon

### Testing
- **All tests use Jest in ESM mode.**
  - `npm test` — full suite
  - `npm run test:unit` — `jest --testPathPatterns=tests/unit`
  - `npm run test:e2e` — `jest --testPathPatterns=tests/e2e`
  - `npm run test:coverage` — `jest --coverage`
- Jest is invoked as `node --experimental-vm-modules node_modules/.bin/jest` because the backend is ESM. Do not run `jest` directly without that flag.
- Coverage collects from `modules/**/*.js`, `middleware/**/*.js`, `utils/**/*.js`.

### Environment
- `backend/.env` exists but contains production credentials. For local dev, copy `backend/.env.sample` to `.env` and adjust.
- Required vars: `DATABASE_URI`, `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `JWT_SECRET_KEY`, `REDIS_URI`.
- S3 uses Magalu Objects in production; LocalStack (`localhost:4566`) in sample config.

### Architecture
- `backend/app.js` — Express app setup, routes mounted here.
- `backend/index.js` — boots Parse Server (mounted at `/parse`) + HTTP server with LiveQuery.
- `backend/cloud/main.js` — Parse Cloud Code entrypoint.
- `backend/modules/` — route modules: `boards`, `auth`, `users`, `attachments`, `admin`, `accessLogs`.
- `backend/migrations/` — `migrate-mongo` migration files.

## CI / Workflow
- `.github/workflows/tests.yml` runs backend tests only (with coverage) on `push`/`pull_request` to `main`.
- Backend tests in CI need env vars: `NODE_ENV=test`, `JWT_SECRET_KEY`, `AUTH_RATE_LIMIT`, `PARSE_APP_ID`, `PARSE_MASTER_KEY`.
- Deployment is triggered via webhook after tests pass on `main`.

## Important Constraints
- Do **not** commit changes to `backend/.env` (contains real secrets).
- Do **not** run backend `jest` without `--experimental-vm-modules`.
- Backend must run migrations before starting if the DB schema changed.
