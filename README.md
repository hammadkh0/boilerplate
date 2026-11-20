# Boilerplate

A NestJS API and a Next.js app in one repo, with Cursor rules for how new code should be written. Clone it, point it at your own name and database, and start the client project from a working site, accounts, and an admin portal.

## What you need

- Node 26, the version in `.nvmrc`.
- Docker, for Postgres, Adminer, and Mailpit.

## Start a new project

From the repo root:

```powershell
npm install
```

That installs Husky, lint-staged, secretlint, and Prettier. Git must already be initialized, because the `prepare` script sets the hooks path.

### Backend

```powershell
cd backend
Copy-Item .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Before you share the machine, replace the two JWT secrets in `.env` and change `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME`. `npm run seed` creates that super admin.

The API is `http://localhost:3001`. Health is `/health`. Swagger is `http://localhost:3001/api/docs` when `SWAGGER_ENABLED=true`. Postgres is on port 5432. Adminer is on port 8080.

`docker compose up -d` also starts Mailpit. Its inbox is `http://localhost:8025`. `EMAIL_TRANSPORT=smtp` delivers mail there. Set `EMAIL_TRANSPORT=resend` and `RESEND_API_KEY` when you want real email. Production refuses `smtp` and refuses a disabled rate limiter.

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

The site is `http://localhost:3000`. It rewrites `/api/v1` to `BACKEND_URL`. Sign in with the seed admin to open `/admin/dashboard`. Any other account opens `/account`.

### Make it yours

| What                                          | Where                                                             |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Site name, tagline, contact email, legal date | `frontend/src/config/site.config.ts`                              |
| Product name in emails and the API            | `APP_NAME` in `backend/.env`                                      |
| Green color                                   | `--primary` in `frontend/src/app/globals.css`, light and dark     |
| Privacy and terms                             | `frontend/src/constants/copy/marketing.ts`                        |
| Favicon                                       | `frontend/src/app/icon.png` and `frontend/src/app/apple-icon.png` |

## Day to day

| Script                   | Where                     | What it does                                           |
| ------------------------ | ------------------------- | ------------------------------------------------------ |
| `npm run format`         | root                      | Formats the repo with Prettier                         |
| `npm run secretlint`     | root                      | Scans for committed secrets                            |
| `npm run audit:security` | root                      | `npm audit` at high severity for the root and each app |
| `npm run dev`            | `backend/` or `frontend/` | Starts that app                                        |
| `npm run lint`           | either app                | ESLint                                                 |
| `npm run typecheck`      | either app                | TypeScript                                             |
| `npm test`               | `backend/`                | Jest unit tests                                        |
| `npm run test:e2e`       | `backend/`                | Jest API tests                                         |
| `npm run test`           | `e2e/`                    | Playwright browser tests                               |

Before each commit, Git runs lint-staged. Before each push, Git runs `npm run audit:security`.

## End-to-end tests

With Docker already running:

```powershell
cd e2e
npm install
npx playwright install chromium
npm run typecheck
npm run test
```

Playwright builds both apps, resets the `boilerplate_e2e` database, and drives a browser on port 4000. The dev servers on 3000 and 3001 can stay up. The first run takes a few minutes because it builds both apps. A failed test keeps a trace in `e2e/test-results/`. Open it with `npx playwright show-trace` from `e2e/`.

## Docs

- `docs/PLAN.md` is the build plan.
- `docs/RULES.md` maps each requirement to a Cursor rule.
- `.cursor/rules/` holds the rules.
