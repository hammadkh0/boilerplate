# Boilerplate

Starting point for a new client project. The repo will hold a NestJS backend and a Next.js frontend, plus the Cursor rules those apps follow.

Phase 1 is the root tooling in this folder. `backend/` and `frontend/` are added in later phases. The full "start a new project" guide is written in phase 9.

## Requirements

Node 26, the active LTS. The version is pinned in `.nvmrc` and in `package.json` `engines`.

## Setup

From the repo root:

```powershell
npm install
```

That installs Husky, lint-staged, secretlint and Prettier. Git has to be initialized before `npm install`, because the `prepare` script sets Git's hooks path.

## Scripts

| Script                   | What it does                                                                  |
| ------------------------ | ----------------------------------------------------------------------------- |
| `npm run format`         | Formats the repo with Prettier                                                |
| `npm run format:check`   | Checks formatting without writing files                                       |
| `npm run secretlint`     | Scans the repo for committed secrets                                          |
| `npm run audit:security` | Runs `npm audit` at high severity for the root, then for each app that exists |

Before each commit, Git runs lint-staged. That formats the staged files, scans them with secretlint, and runs ESLint in `backend/` or `frontend/` once that app is installed. Before each push, Git runs `npm run audit:security`.

## Backend

From `backend/`, with Node 26:

```powershell
docker compose up -d
Copy-Item .env.example .env
npm install
npx prisma migrate dev
npm run dev
npm run seed
```

`npm run seed` creates the super admin from `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME`. Change those values before anyone else can reach the database.

Replace the two JWT secrets in `.env` before the API is used anywhere except your machine. The health check is `http://localhost:3001/health`. Swagger is `http://localhost:3001/api/docs` when `SWAGGER_ENABLED=true`. Postgres is on port 5432 and Adminer is on port 8080.

`docker compose up -d` also starts Mailpit. Its inbox is `http://localhost:8025`. Set `EMAIL_TRANSPORT=smtp` in `.env` to deliver mail there instead of through Resend.

## Frontend

From `frontend/`, with Node 26:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

The app runs at `http://localhost:3000` and rewrites `/api/v1` to `BACKEND_URL` (the API on port 3001). `src/proxy.ts` keeps signed-out visitors out of `/admin` and `/account`.

## End-to-end tests

From the repo root, with Docker already running the backend compose file:

```powershell
cd backend
docker compose up -d
cd ..\e2e
npm install
npx playwright install chromium
npm run typecheck
npm run test
```

Playwright builds the frontend and the backend, resets the `boilerplate_e2e` database, and drives a browser on port 4000. The dev servers on ports 3000 and 3001 can stay running. A failed test keeps a trace in `e2e/test-results/`. Open it with `npx playwright show-trace` from `e2e/`.

## Docs

- `docs/PLAN.md` is the build plan.
- `docs/RULES.md` maps each requirement to a Cursor rule.
- `.cursor/rules/` holds the rules.
