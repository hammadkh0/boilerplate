# Boilerplate plan

Status: phases 6 through 8 are done. Phase 9 has not started.

This boilerplate is the starting point for new client projects. It holds a NestJS backend and a Next.js frontend in one repo. Its Cursor rules tell AI agents how to write code here, so the code they produce stays consistent, secure and fast.

It borrows from three reference repos.

| Repo | What we take from it |
|---|---|
| Driving-Test | The code layout and file structure, which is the best of the three. Also the admin portal look, the uploads service, the auth refresh flow, the soft-delete extension and the frontend services layer. |
| HumanityHub-Backend | The helpers in `common/`, which are the best of the three. Also Prisma 7 on Postgres with `@prisma/adapter-pg` and the global guards. |
| Fright-Marketplace | The table toolbar and the `useDebouncedValue` and `useTablePage` hooks. Also the Prettier config, the Prisma error helpers and the Mongo `unsetOrNull` helper. |

---

## 1. Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Null vs undefined | A Postgres rule plus helpers that handle Prisma's null vs undefined behavior. The Mongo `unsetOrNull` helper stays as an optional file, and the rule gets a short Mongo appendix. |
| 2 | Repo layout | One git repo with `backend/` and `frontend/` folders. Each folder is its own npm project. One root `.cursor/rules/` folder uses globs to scope each rule. |
| 3 | Auth tokens | Both the access token and the refresh token live in httpOnly cookies. The frontend calls the backend through a Next.js rewrite, so the browser treats the cookies as first-party. Refresh tokens rotate, and a `tokenVersion` counter revokes sessions. |
| 4 | Auth features | Register, login, logout, forgot and reset password, email verification, Resend with EJS templates, and a profile page with change password. No Google OAuth and no two-factor auth. |
| 5 | Roles | The Prisma `Role` enum starts with `USER` and `SUPER_ADMIN`. Global guards apply `@Public()` and `@Roles()`. Each admin handler lists its allowed roles with `@Roles(Role.SUPER_ADMIN)`. The frontend admin layout checks an `ADMIN_PORTAL_ROLES` list for portal access. Adding `ADMIN` later means one enum value, one edit to that list, and adding the role to the handlers it should reach. A `UserStatus` enum holds `ACTIVE` and `SUSPENDED`. No permissions table. |
| 6 | Admin scope | A users table with search, filters, sorting and page size, all stored in the URL. Row actions for details, suspend or activate, and soft delete. KPI cards on the dashboard. An audit log of admin actions. No chart, no create-user flow and no CSV export. The table copies the styling of the Driving-Test admin users page. |
| 7 | shadcn base | Radix, which composes components with `asChild`. |
| 8 | Admin layout | One admin portal shell. A left sidebar holds the main tabs. A top navbar holds the sidebar toggle, the theme toggle and the user menu. Section 5 has the full spec. |
| 9 | User landing | Regular users land on `/account`, which has the profile and change-password forms and uses the marketing navbar. Admins land on `/admin/dashboard` and also get `/admin/profile`. |
| 10 | S3 | The backend gets an `uploads` module ported from Driving-Test. An env flag turns it on. The frontend gets no upload UI yet. We use real AWS S3, with no MinIO. The backend avatar endpoint exists, and the UI for it comes later. |
| 11 | i18n | No i18n. Each feature keeps its user-facing copy in copy constants, so adding `next-intl` later means swapping those constants for message files. |
| 12 | Quality gates | Husky runs lint-staged on commit, which runs Prettier, ESLint and secretlint. A pre-push hook runs `npm audit --audit-level=high`. The backend gets Jest unit tests for helpers and an end-to-end auth test. No CI workflow, no frontend tests and no em-dash scan. |
| 13 | Deployment | `backend/docker-compose.yml` runs Postgres 17 for local development. It lives in the backend folder because only the backend uses it. The backend gets a multi-stage Dockerfile that runs as a non-root user and applies `prisma migrate deploy` on start. The backend also gets a `/health` endpoint. The frontend targets Vercel, and the README documents `output: 'standalone'` for self-hosting. |
| 14 | Logging | `nestjs-pino` writes structured logs to stdout, with redaction and request IDs. We port the DB request-log module but leave it off by default, and it gets a retention cron. The audit log is separate and always on. |
| 15 | Rules | Eight focused rule files. Each has a Must and Never list and a review checklist. `docs/RULES.md` maps your requirements to the rules. |
| 16 | React Compiler | On. The `react-hooks` compiler rules, including `set-state-in-effect`, run as errors. Components skip manual memoization by default. |
| 17 | Forms | React Hook Form, Zod and a React Query `useMutation`. Field errors render with shadcn `Field` components. When the backend returns a 400 with field details, `setError` maps them onto the form. Every submit uses a shared `LoadingButton`. |
| 18 | Landing | A hero with the CTA above the fold, a sticky CTA bar on mobile, a features grid, a "how it works" section, an FAQ with FAQ structured data, and a footer linking to Privacy and Terms. `/thank-you` is the page users see after registering, telling them to check their inbox. |

### Defaults I chose

Veto any of these during review.

| Topic | Default |
|---|---|
| IDs | UUIDs, stored as Postgres `uuid` columns with `@id @default(uuid(7)) @db.Uuid`. Version 7 is a standard UUID that also sorts by creation time, which keeps indexes compact. Sequential IDs let attackers guess other records. |
| Soft delete | The Driving-Test implementation, which Fright copied, adapted for Postgres. Section 3.9 explains the choice. Fright's tombstone helper frees a deleted user's email so it can register again. |
| API | Every route sits under `/api/v1`. Swagger lives at `/api/docs` and is off in production unless `SWAGGER_ENABLED=true`. |
| Envelope | Responses look like `{ success, data }`. Offset lists return `{ items, meta: { page, limit, total, totalPages } }`. Cursor lists return `{ items, meta: { nextCursor, hasMore, limit } }`. `limit` defaults to 20 and caps at 100. Section 3.5 says which strategy each list uses. |
| Env | A Zod schema validates env at boot, and the app refuses to start if a value is missing. Secrets have no fallback values. The frontend validates its public env the same way. |
| Sessions | No sessions table. Both tokens are JWTs, and `User` stores the refresh token hash and `tokenVersion`, as in Driving-Test. Section 3.4 has the flow. |
| HTTP client | Axios and `fetch` both, split the way Driving-Test splits them. Browser code uses an axios instance with an interceptor that queues requests during a 401 refresh. Server components use a `server-only` `fetch` client that forwards cookies and supports Next caching. Streaming responses also use `fetch`, because axios can't stream in the browser. Section 4.3 has the details. |
| Branding | Placeholder brand "Acme" with a short tagline in `site.config.ts`. shadcn's `neutral` base color with a deep green primary, close to the Driving-Test look, defined as CSS variables in `globals.css` for both light and dark mode. |
| Node | The latest LTS release at scaffold time, which is Node 26 as of November 2026. `.nvmrc` and `engines` pin it. |
| Versions | The latest stable release of every package at scaffold time. That means Nest 11, Prisma 7 or later, Next 16, React 19, Tailwind 4 and Zod 4. |
| Next file conventions | `proxy.ts`, which is the Next 16 name for middleware. |

---

## 2. Repo layout

```
Boilerplate/
  .cursor/rules/            8 rule files
  docs/RULES.md             maps each requirement to the rule that covers it
  .husky/                   pre-commit runs lint-staged, pre-push runs the audit
  docs/PLAN.md              this file
  package.json              root dev tooling only: husky, lint-staged, secretlint
  .nvmrc
  .editorconfig
  .gitignore
  README.md                 setup, scripts, and how to start a new project from this repo
  backend/
  frontend/
```

Phase 0 deleted the stale rules copied from other repos: `module-folder-structure.mdc`, `no-hardcoded-domain-strings.mdc` and `mongo-unset-null-queries.mdc`. The Mongo content moved into the appendix of `backend-database.mdc`. The two `.code-workspace` files open the reference repos, so they stay until the Phase 9 cleanup.

---

## 3. Backend

### 3.1 Stack

The backend runs NestJS 11 and Prisma 7 with `@prisma/adapter-pg` and `prisma.config.ts`, on Postgres 17.

| Concern | Packages |
|---|---|
| Config | `@nestjs/config` with a Zod env schema |
| Auth | `@nestjs/jwt`, `passport-jwt`, `bcrypt` |
| Validation | `class-validator`, `class-transformer` |
| HTTP hardening | `helmet`, `cookie-parser`, `@nestjs/throttler` |
| Docs and health | `@nestjs/swagger`, `@nestjs/terminus` |
| Logging and jobs | `nestjs-pino`, `@nestjs/schedule` |
| Files | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `sharp`, `file-type` for magic-byte checks |
| Email | `resend`, `ejs` |
| Utilities | `uuidv7`, `date-fns`, `date-fns-tz`, `libphonenumber-js`, `ua-parser-js` |
| Dev | Jest, Supertest, ESLint flat config with type-checked `typescript-eslint`, Prettier |

### 3.2 Folder structure

The structure follows Driving-Test. Feature modules sit under `src/modules/`. Each module keeps one controller, its module file and its services at the module root, and each subfolder has a barrel `index.ts`. Admin handlers carry `@Roles(...)` individually.

```
backend/
  prisma/
    schema.prisma
    migrations/
  prisma.config.ts
  scripts/
    seed.ts                  creates the SUPER_ADMIN user from env
  src/
    main.ts
    app.module.ts
    modules/
      shared/
        constants/           regexes, pagination limits, sort direction, cookie names
        types/               PaginatedResult, ApiEnvelope, JwtPayload
        utils/               pure helpers, listed in section 3.6
        helpers/             Prisma helpers for pagination, where clauses, patches, errors, transactions
        decorators/          @Public, @Roles, @CurrentUser, @IsOptionalNonNull
        guards/              JwtAuthGuard, RolesGuard, OriginGuard
        filters/             HttpExceptionFilter, which wraps errors in the envelope and maps Prisma errors
        interceptors/        ResponseInterceptor
        pipes/               FileValidationPipe, RemoveUndefinedPipe
        validators/          IsFutureDate, PasswordsMatch, file validators
        dto/                 PaginationQueryDto, CursorPaginationQueryDto, DateRangeQueryDto
        prisma/              PrismaService, PrismaModule, extensions/soft-delete.ts
      config/                env.schema.ts with the Zod schema, AppConfigService with typed getters
      auth/
        auth.module.ts  auth.controller.ts  auth.service.ts  token.service.ts
        strategies/          jwt.strategy, which reads the access cookie
        dto/  helpers/  constants/  types/
      users/
        users.module.ts
        users.controller.ts  /users/me routes and admin routes in one controller
        users.service.ts
        dto/  helpers/  constants/  types/
      dashboard/             KPI endpoint built on single count and groupBy queries
      audit-log/             service that admin actions call, plus an admin list endpoint
      uploads/               UploadsService for S3, turned on by S3_ENABLED
      emails/                EmailService on Resend, EJS templates/, helpers
      health/                /health with a database check
      http-request-log/      optional, off by default, with a retention cron
  test/
    auth.e2e-spec.ts
  docker-compose.yml         Postgres 17 and Adminer for local development
  Dockerfile
  .env.example
  eslint.config.mjs
  .prettierrc
```

### 3.3 Data model

These are the starting models.

| Model | Key fields | Indexes |
|---|---|---|
| `User` | `id`, `email` (stored lowercase, unique), `passwordHash`, `fullName`, `role`, `status`, `emailVerifiedAt?`, `avatarKey?`, `refreshTokenHash?`, `tokenVersion`, `emailVerificationTokenHash?`, `emailVerificationExpiresAt?`, `passwordResetTokenHash?`, `passwordResetExpiresAt?`, `lastLoginAt?`, `createdAt`, `updatedAt`, `deletedAt?` | `(role, status, createdAt)`, `(createdAt)`, unique `(emailVerificationTokenHash)`, unique `(passwordResetTokenHash)` |
| `AuditLog` | `id`, `actorId`, `action`, `entityType`, `entityId`, `metadata Json?`, `ip?`, `createdAt` | `(createdAt, id)` for cursor paging, `(actorId, createdAt, id)`, `(entityType, entityId)` |
| `HttpRequestLog` | Exists only when the optional module is on | `(createdAt)` |

The enums are `Role`, `UserStatus` and `AuditAction`. Verification and reset tokens live on `User`, as in all three reference repos, so there is no separate token table.

### 3.4 Auth flow

Login verifies the password with bcrypt and checks `status` and `deletedAt`. It then signs two JWTs with separate secrets, stores the SHA-256 hash of the refresh token on `User`, and sets two cookies.

| Cookie | Contents | Attributes |
|---|---|---|
| `access_token` | A JWT with `sub`, `role` and `tv` (token version) that expires in 15 minutes | `HttpOnly; Secure; SameSite=Lax; Path=/` |
| `refresh_token` | A JWT with `sub` and `tv` that expires in 30 days | `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` |

The rest of the flow works like this.

- Refresh verifies the JWT signature, checks that `tv` matches `User.tokenVersion`, and compares the token's hash with `User.refreshTokenHash`. It then issues a new pair and stores the new hash, so every refresh token works once.
- If a refresh token has a valid signature and version but its hash doesn't match, someone reused an old token. The backend treats that as theft, bumps `tokenVersion` and clears the hash, which logs the user out everywhere.
- Refresh tokens are hashed with SHA-256, not bcrypt. bcrypt only reads the first 72 bytes of its input, and JWTs from the same user share far more than 72 bytes of header and payload. HumanityHub bcrypts its refresh tokens, so in that repo different tokens can compare as equal.
- The access JWT carries `tokenVersion`. Suspending a user, changing a password or choosing "log out everywhere" bumps the version, which invalidates every existing access token.
- Logout clears both cookies and the stored hash.
- One refresh hash per user means one active login per user. Logging in on a second device replaces the hash, and the first device gets logged out the next time its access token expires. Driving-Test has the same behavior. If a project needs several devices logged in at once, the alternative is to drop the stored hash and rely on `tokenVersion` alone, at the cost of theft detection.
- Verification and reset tokens are random, stored on `User` as hashes, and single-use. Verification tokens expire after 24 hours and reset tokens after 30 minutes. The forgot-password endpoint returns the same response whether or not the email exists.
- `JwtAuthGuard`, `RolesGuard` and `ThrottlerGuard` are registered as `APP_GUARD`. Every route requires login unless it has `@Public()`. Auth routes get stricter `@Throttle` limits.
- `SameSite=Lax` blocks most CSRF. On top of that, `OriginGuard` rejects any state-changing request whose `Origin` header is missing from `CORS_ORIGINS`.
- On the frontend, `proxy.ts` checks for the access cookie on `/admin/**` and `/account/**`. If the access token has expired and a refresh cookie exists, `proxy.ts` calls refresh and forwards the new cookies before the page renders. The `(admin)` layout then checks the role again on the server through `/users/me`.

### 3.5 List endpoint contract

List endpoints use one of two pagination strategies. `backend-database.mdc` section 6 has the full rules.

| Strategy | Used for | Query DTO | Response `meta` |
|---|---|---|---|
| Offset | Tables in the low thousands of rows where users jump to a page, such as Users | `PaginationQueryDto` with `page`, `limit`, `search`, `sortBy`, `sortOrder` | `{ page, limit, total, totalPages }` |
| Cursor | Large or append-only lists, such as the audit log | `CursorPaginationQueryDto` with `cursor`, `limit`, `search`, `sortOrder` | `{ nextCursor, hasMore, limit }` |

Offset endpoints follow these steps.

1. Build `where` once with the helpers, and use it for both `findMany` and `count`.
2. Run `findMany` and `count` together in one `$transaction([...])`.
3. Use an explicit `select`. Never return full rows or sensitive fields.
4. Check `sortBy` against a whitelist constant for that resource.
5. Return `buildPaginatedResult(items, total, page, limit)`.

Cursor endpoints build `where` and `select` the same way, but skip `count`. They order by the sort column and then `id`, fetch `limit + 1` rows with `buildCursorArgs`, and return `buildCursorResult(rows, limit)`. The extra row tells the endpoint whether another page exists.

Both strategies cap `limit` at 100 and default it to 20. Search uses `contains` with `mode: 'insensitive'` across a declared list of fields. Every filter and sort column gets an index.

### 3.6 Helper inventory

We copy every helper from Driving-Test and HumanityHub, generalize the domain-specific ones, and add JSDoc to each. Helpers go to `backend/src/modules/shared/` unless the table says otherwise.

**From Driving-Test `shared/utils`**

| Helper | Destination | Change |
|---|---|---|
| Regex and type constants for time, documents, images, passwords, slugs, media, spreadsheets, UUIDs and email | `constants/` | Drop the ObjectId regex. Make the country and locale lists generic. |
| `sleep` | `utils/function.utils.ts` | None |
| Date helpers for strings, ranges, timezone keys, UTC boundaries, `zonedDateTimeToUtc`, calendar bounds and validation | `utils/date.utils.ts` | Merge in HumanityHub's `getDateRange` and `TIME_FILTERS`. |
| `hashData`, `compareData`, phone normalizing, OTP, `stringify`, random strings, client IP, user agent parsing, `percentChange` | `utils/data.utils.ts` | Drop ObjectId generation. Phone normalizing uses libphonenumber with a default region read from env. |
| `isObject`, `cloneDeep`, `assign`, `omitNullFields`, `mergeObjectMaps` | `utils/object.utils.ts` | Document `omitNullFields` as Mongo-only. |
| `chunk`, `mapWithConcurrency`, `shuffleInPlace` | `utils/array.utils.ts` | None |
| Upload extension resolution and attachment `Content-Disposition` headers | `utils/file.utils.ts` | None |
| `parseJsonToInstance`, `parseJsonField` | `utils/transform.utils.ts` | None |
| Request-log redaction and body helpers | `http-request-log/helpers/` | The pino config reuses the redaction helpers. |
| Email branding and template rendering | `emails/helpers/` | None |
| Account deletion helpers | `users/helpers/` | Drop the Stripe part. |
| Soft-delete extension and `withSoftDelete` client from `prisma.service.ts` | `prisma/extensions/soft-delete.ts` | Adapted for Postgres. Section 3.9 lists the changes. |

**From HumanityHub `common/`**

| Helper | Destination | Change |
|---|---|---|
| `parseBoolean` | `utils/data.utils.ts` | None |
| `getDateRange`, `TIME_FILTERS` | `utils/date.utils.ts`, `constants/` | None |
| `renderTemplate`, `renderMessageTemplate` | `emails/helpers/` | None |
| `sanitizeObject`, `sanitizeHeaders`, `truncateString`, `truncateObject`, `getClientIp`, `serializeForJson` | `utils/log.utils.ts` | None |
| `IsFutureDateConstraint`, `PasswordsMatchConstraint` | `validators/` | None |
| `CsvExcelFileValidator`, `FileValidationPipe` | `validators/`, `pipes/` | Add a magic-byte check. |
| `RemoveUndefinedPipe` | `pipes/` | Strip only `undefined` and keep `null`. Section 3.7 explains why. |
| `Public`, `Roles`, `GetCurrentUser` decorators | `decorators/` | Drop `GetDataFromPayload`, which reads the wrong object. |
| `softDeleteExtension` | Not ported | We use the Driving-Test version instead. Section 3.9 explains why. |
| `chunk` | Merged with the Driving-Test version | None |

**From Fright-Marketplace**

| Helper | Destination |
|---|---|
| `isPrismaUniqueConstraintError`, `prismaUniqueConstraintField`, `toUserConflictException` | `helpers/prisma-errors.ts` |
| `PRISMA_TX_OPTIONS` | `helpers/prisma-transaction.ts` |
| `hashToken`, `readStringField`, `readNumberField` | `utils/data.utils.ts` |
| Released identity helpers, which replace a deleted user's email with a tombstone value | `users/helpers/` |
| `unsetOrNull`, `NOT_*` | `helpers/mongo-optional-null.ts`, optional and Mongo-only |

**New helpers**

| Helper | What it does |
|---|---|
| `buildPaginationArgs(query)` | Returns `{ skip, take }` with `limit` clamped to the max. |
| `buildPaginatedResult(items, total, page, limit)` | Returns the offset list response. |
| `buildCursorArgs({ cursor, limit })` | Returns `{ take: limit + 1 }`, plus `{ cursor: { id }, skip: 1 }` when a cursor is given. |
| `buildCursorResult(rows, limit)` | Drops the extra row and returns `{ items, meta: { nextCursor, hasMore, limit } }`. |
| `buildSearchWhere(search, fields)` | Returns a case-insensitive OR across the fields, or an empty object when `search` is empty. |
| `buildOrderBy(sortBy, sortOrder, whitelist, fallback)` | Returns an `orderBy` limited to whitelisted columns. |
| `requireDefined(value, name)` | Throws if a value meant for a `where` clause is `undefined`. |
| `buildPatchData(dto)` | Keeps `null`, which clears a column, and drops `undefined`, which leaves a column untouched. |
| `softDelete(model, id)` | Sets `deletedAt` and runs the tombstone logic where a model needs it. |

### 3.7 Null vs undefined on Postgres

Prisma treats `undefined` and `null` differently, and three rules follow from that.

- In a `where` clause, `undefined` removes the condition. `where: { ownerId: undefined }` matches every row. Ownership and tenant filters must pass their values through `requireDefined`.
- In `data`, `undefined` leaves a column untouched and `null` sets it to NULL. PATCH handlers build their data with `buildPatchData`.
- `@IsOptional()` lets `null` through validation. Optional fields that must never be null use `@IsOptionalNonNull()`, which wraps `ValidateIf(v => v !== undefined)`. Validation then rejects `null` before it reaches Prisma.

### 3.8 Uploads on S3

We port the Driving-Test `UploadsService` methods: `uploadFile`, `uploadBuffer`, `getFileByKey`, `deleteByKey`, `copyObject` and `deleteObjectsWithPrefix`. The port makes these changes.

- `getFileByKey` returns a presigned GET URL that expires after 1 hour by default instead of 7 days.
- `deleteObjectsWithPrefix` sends one `DeleteObjects` call per 1000 keys instead of one call per file.
- Errors go through the Nest `Logger` instead of `console.error`.
- A magic-byte check confirms each file's real type instead of trusting the client's `mimetype`.
- The service builds every key from a uuidv7 and never uses the client's filename.
- The code assumes a private bucket.

When `S3_ENABLED=false`, the service throws a `ServiceUnavailableException` saying storage isn't configured. `POST /users/me/avatar` resizes images with `sharp` and converts them to WebP before uploading.

### 3.9 Soft delete

Driving-Test and Fright have the same implementation, since Fright copied it. HumanityHub has a weaker one. We port the Driving-Test version.

| Behavior | Driving-Test and Fright | HumanityHub |
|---|---|---|
| How the filter joins the caller's `where` | Appends to `AND`, so the caller's own conditions stay intact | Spreads `deletedAt: null` over the caller's `where`, which silently overwrites any `deletedAt` condition the caller set |
| Operations covered | `findFirst`, `findFirstOrThrow`, `findUnique`, `findUniqueOrThrow`, `findMany`, `count`, `groupBy` | `findFirst`, `findUnique`, `findMany`, `count` |
| Bypass for admin restore or token lookups | Use the plain client instead of `prisma.withSoftDelete` | Not possible, because the filter is merged into the service with `Object.assign` |
| Model list | A typed `ReadonlySet` with a JSDoc note on when to add a model | A plain array |

The port makes these changes.

- The filter becomes `{ deletedAt: null }`, since Postgres has no unset state.
- The extension also covers `aggregate`, which the dashboard KPI queries use.
- `withSoftDelete` builds the extended client once and caches it. The Driving-Test getter calls `$extends` on every access, which creates a new client object for every query.
- A `softDelete(model, id)` helper sets `deletedAt`. For `User` it also clears `refreshTokenHash`, bumps `tokenVersion` and runs the tombstone logic that frees the email.

Two limits remain, and `backend-database.mdc` spells them out for agents.

- Query extensions don't reach nested relations. Any `include` or nested `select` on a soft-deletable relation needs its own `where: { deletedAt: null }`.
- Writes such as `update` and `updateMany` still touch deleted rows. Update queries on soft-deletable models must add `deletedAt: null` to their `where`.

---

## 4. Frontend

### 4.1 Stack

The frontend runs Next.js 16 with the App Router and the React Compiler, React 19, strict TypeScript and Tailwind 4.

| Concern | Packages |
|---|---|
| UI | shadcn on Radix, `lucide-react`, `next-themes`, `sonner` |
| Data | `@tanstack/react-query`, `axios`, `server-only` |
| Forms | `react-hook-form`, `@hookform/resolvers`, Zod |
| URL state for tables | `nuqs` |
| Dates | `date-fns` |
| Dev | ESLint with `eslint-config-next` and the `react-hooks` compiler rules, Prettier with `prettier-plugin-tailwindcss` |

### 4.2 Folder structure

```
frontend/
  src/
    app/
      layout.tsx               root metadata, fonts, providers
      not-found.tsx            custom 404
      error.tsx, global-error.tsx
      robots.ts, sitemap.ts, manifest.ts
      icon.png, apple-icon.png, opengraph-image.tsx
      (marketing)/
        layout.tsx             marketing navbar and footer
        page.tsx               landing page
        privacy/  terms/  thank-you/
      (auth)/
        layout.tsx
        login/  register/  forgot-password/  reset-password/  verify-email/
      (account)/account/       profile and change password for USER
      (admin)/admin/
        layout.tsx             server-side role check, then AdminShell
        dashboard/  users/  audit-log/  profile/
    components/
      ui/                      shadcn primitives, generated and lightly themed
      admin/                   shell, sidebar, navbar, user menu
      data-table/              DataTable, TableToolbar, SortableHead, DataTablePagination, DataTableLoadMore, TableRefreshButton
      forms/                   LoadingButton, FormErrorAlert, PasswordInput
      marketing/               Hero, Features, HowItWorks, Faq, StickyMobileCta, Footer
      auth/  account/  users/  audit-log/  dashboard/
      providers/               QueryProvider, ThemeProvider, NuqsAdapter
    services/
      http/client.ts           browser axios instance with the 401 refresh interceptor and ApiError
      http/server.ts           server-only fetch client that forwards cookies and supports Next caching
      auth.service.ts  users.service.ts  dashboard.service.ts  audit-log.service.ts
      users.server.ts  dashboard.server.ts  audit-log.server.ts   server-only reads
    queries/                   queryOptions factories and query keys for each feature
    hooks/                     use-debounced-value, use-table-url-state, use-mobile, use-scrolled
    lib/                       cn, pagination, date, abort detection, redirect sanitizer
    constants/                 domain enums mirrored from Prisma, routes, page sizes, copy/
    types/                     API types for each feature
    schemas/                   Zod schemas for each feature
    config/                    site.config.ts, env.ts with a Zod schema for NEXT_PUBLIC_* values
  proxy.ts
  next.config.ts               rewrites /api/v1/* to BACKEND_URL, security headers, image config
  components.json
  eslint.config.mjs
  .prettierrc
```

### 4.3 Server vs client components

- Pages and layouts are server components. They fetch initial data through `services/http/server.ts` and pass it down as props.
- `"use client"` goes only on leaf components that need state, effects, event handlers or browser APIs. Examples are forms, table controls, the theme toggle, the sidebar trigger and the user menu.
- Marketing pages render fully on the server. The sticky mobile CTA and the mobile menu in the navbar are the only client components there.
- In admin tables, the page is a server component that reads search params. The table itself is a client component that runs React Query, seeded with the data the server fetched.

The two HTTP clients split by where the code runs.

| Situation | Client | Reason |
|---|---|---|
| Client components, React Query queries and mutations, form submits | Axios (`services/http/client.ts`) | Interceptors handle the 401 refresh queue and map errors to `ApiError` in one place. Axios also reports upload progress, which the S3 upload UI will need later. |
| Server components, `generateMetadata`, `sitemap.ts` and other server-side reads | `fetch` (`services/http/server.ts`) | Next's `cache`, `revalidate` and tags work only with `fetch`. The client reads cookies with `cookies()` and forwards them. |
| Streaming responses such as server-sent events | `fetch` | Axios can't read a streamed response body in the browser. |

Each feature service file, such as `users.service.ts`, exports browser functions built on axios. Server-side reads for that feature live in a matching `users.server.ts` that starts with `import 'server-only'`.

### 4.4 Helpers carried over

| Helper | Source |
|---|---|
| `cn`, `omitEmptyStringEntries`, `sanitizeRedirectPath`, `parseBoolean` | Driving-Test `lib/utils.ts` |
| `getPageNumbers`, `getPaginationRange` | Driving-Test `lib/pagination.ts` |
| Date formatting and the date-range query builder | Driving-Test `lib/date.ts` |
| Abort detection and the envelope reader | Driving-Test `lib/http.ts` |
| `withSignal` | Driving-Test `lib/react-query.ts` |
| `useTableRefresh`, `useScrolled`, `useMobile` | Driving-Test hooks |
| `useDebouncedValue` as one shared hook with a 350 ms default, and `useTablePage` | Fright hooks |
| `DataTablePagination` | Driving-Test component |

---

## 5. Admin portal spec

This spec follows the screenshot of the Driving-Test users page.

### Shell

- The sidebar uses the `sidebar-07` pattern, which collapses to icons. It shows the brand wordmark with an "ADMIN" label at the top. A "Main" group lists Dashboard, Users and Audit log as icon and label links, and supports collapsible sub-menus. The footer holds a user card with the avatar initial, the name, "Signed in", and a dropdown with Profile and Log out.
- The top navbar is `h-14` with a bottom border. The sidebar trigger sits on the left. The theme toggle and user menu sit on the right.
- The content area uses `p-4 md:p-6` and centers at `max-w-7xl`.
- The layout file is a server component. Only the sidebar, trigger, toggle and user menu are client components.

### Page anatomy

- A `PageHeader` shows the title in the primary color with a muted subtitle below it.
- The KPI group has a small uppercase label above rounded cards. Each card has a colored left-border accent, a label and a large number.
- The table sits in a `rounded-xl` bordered card. The header row is dark primary, or black in dark mode. Rows alternate background colors, and column headers show sort icons.

### Users page

- The toolbar has a search input with an icon, debounced by 350 ms. Next to it sit the Role, Status, Email verified and Created date range filters. A filled primary Refresh button sits on the right.
- The columns are Name, Email, Role, Status, Verified, Joined and Actions. Status renders as a solid badge. Lower-priority columns hide below the `md` and `lg` breakpoints.
- While loading, the table shows one skeleton row per row in the page. Errors and empty results each get their own row. During a refetch the table dims.
- Row actions open a details dialog, suspend or activate the user after a confirm dialog with a `LoadingButton`, or soft delete after a destructive confirm.
- `nuqs` keeps every filter, the sort, the page and the page size in the URL. Changing a filter resets the page to 1.
- The page is built from the reusable `data-table/` components, not one large component.

### Dashboard

The KPI cards show total users, new users this week, verified percentage and suspended count. One backend endpoint returns all four, using `count` and `groupBy` queries.

### Audit log

The audit log uses the same table look and toolbar, with filters for actor, action, entity type and date range. It uses cursor pagination because the table only grows. Rows sort newest first, and a "Load more" button under the table fetches the next page through `useInfiniteQuery`. There are no page numbers.

---

## 6. Marketing, SEO and public pages

| Requirement | How we build it |
|---|---|
| Meta title and description on every page | Every `page.tsx` must export `metadata` or `generateMetadata`. The root layout sets `title.template` from `site.config.ts`. |
| CTA above the fold | The hero holds the primary CTA, and the CTA shows without scrolling at both 375 px and 1280 px widths. |
| Sticky mobile CTA | `StickyMobileCta` appears below the `md` breakpoint once the hero scrolls out of view. |
| Favicon | `app/icon.png`, `app/apple-icon.png` and `manifest.ts`. |
| robots.txt | `app/robots.ts` disallows `/admin`, `/account` and the auth pages. |
| sitemap.xml | `app/sitemap.ts` lists the public routes. |
| Open Graph image | `app/opengraph-image.tsx` generates the image from the site name and tagline. The metadata also sets the Twitter card. |
| Alt text | Every `next/image` gets meaningful `alt` text. Decorative images get `alt=""`. |
| Compressed images | All images go through `next/image`, which serves AVIF or WebP. Static assets ship pre-compressed with `sizes` set. Only the hero image gets `priority`. |
| Mobile breakpoints | Tailwind classes start from mobile. We check every page at 375, 768 and 1280 px. |
| Loading states | Each route group has a `loading.tsx`. Tables show skeletons, and every action button uses `LoadingButton`. |
| Form error states | Errors show under each field, and `FormErrorAlert` shows form-level errors. Backend field errors map onto the matching fields. |
| Thank-you page | `/thank-you` shows after registration, tells the user to check their inbox and offers a resend button. |
| Privacy and Terms | `/privacy` and `/terms` hold placeholder content filled from `site.config.ts`. |
| Custom 404 | `app/not-found.tsx` links to the home page and to login. |
| Private pages | Admin, account and auth pages set `robots: { index: false }`. |

---

## 7. Security baseline

The code enforces these from day one, and `security.mdc` writes them down for agents.

- **Secrets.** Zod validates env at boot, and secrets have no default values. Git ignores `.env` and tracks `.env.example`. secretlint checks every commit.
- **Authentication.** Tokens live in httpOnly cookies. Access tokens are short-lived, and refresh tokens rotate with reuse detection. `tokenVersion` revokes sessions. bcrypt runs at cost 12. Login and forgot-password return generic errors that don't reveal whether an account exists. Auth routes have rate limits.
- **Authorization.** Every route is private by default through `APP_GUARD`. Every admin route checks the role. Ownership checks pass their IDs through `requireDefined`. Routes under `/me` read the user ID from the token and never from the request body or URL.
- **Input.** The global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted` and `transform`. DTOs set length limits, and sort fields come from a whitelist. The frontend validates with Zod.
- **Injection.** All queries go through Prisma. `$queryRaw` is allowed only with tagged templates, and `$queryRawUnsafe` never receives user input.
- **XSS.** `dangerouslySetInnerHTML` is allowed only with sanitized input. `next.config.ts` sets a CSP and the other security headers. EJS templates escape output with `<%= %>`.
- **CSRF.** Cookies use `SameSite=Lax`, and `OriginGuard` checks the `Origin` header on state-changing requests.
- **Headers and transport.** `helmet` sets the headers, and production sends HSTS. CORS allows only the origins listed in env. `trust proxy` is set so the backend sees real client IPs.
- **Uploads.** Every upload has a size limit and a magic-byte check. The server generates every key. The bucket is private, and presigned URLs expire quickly.
- **Open redirects.** Any `?next=` parameter goes through `sanitizeRedirectPath`.
- **Data exposure.** Queries use an explicit `select` and never return `passwordHash`, token hashes or `tokenVersion`. Production errors never include stack traces or Prisma internals.
- **Logging.** Logs redact passwords, tokens, cookies and auth headers. Auth routes never log full request bodies.
- **Dependencies.** The pre-push hook runs `npm audit --audit-level=high`, and both apps commit their lockfiles.
- **Body size.** The JSON body limit is 1 MB, down from HumanityHub's 100 MB. Uploads set their own limits.

---

## 8. Tooling

Both apps share one Prettier config with `semi`, `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100` and `endOfLine: "auto"`. The frontend adds `prettier-plugin-tailwindcss`.

The backend ESLint config is a flat config with these settings.

- `typescript-eslint` `recommendedTypeChecked`.
- The Prettier plugin, with the `prettier/prettier` key spelled correctly. HumanityHub has a leading space in that key.
- `no-floating-promises` and `no-console` as errors.
- Unused variables allowed only with a `_` prefix.

The frontend ESLint config has these settings.

- `eslint-config-next` with the core-web-vitals and TypeScript presets.
- The `react-hooks` compiler rules as errors.
- The Prettier plugin and `no-console` as an error.
- A restricted-imports rule that stops client components from importing `services/http/server` or any `*.server.ts` service. The `server-only` import also fails the build if one slips through.

On every commit, Husky runs lint-staged on the staged files. Lint-staged runs Prettier, `eslint --fix` and secretlint. On push, Husky runs `audit:security`.

Each app has the scripts `dev`, `build`, `start`, `lint`, `lint:fix`, `format` and `typecheck`. The backend also has `test` and `test:e2e`.

---

## 9. Cursor rules plan

The rules live in the root `.cursor/rules/`. Each file opens with a short purpose and a Must and Never list. Good and bad examples follow, and a review checklist closes the file.

| File | Applies to | Covers |
|---|---|---|
| `core.mdc` | Always | No em dashes. The comment and JSDoc policy. Const objects instead of magic strings. Module and barrel structure. Searching existing helpers before writing a new one. |
| `security.mdc` | Always | Section 7 |
| `os-specific-shell.mdc` | Always | Your existing PowerShell rule, unchanged |
| `backend-architecture.mdc` | `backend/**` | Module layout, one controller per module, DTOs, guards, the response envelope, errors, config and logging |
| `backend-database.mdc` | `backend/**` | `select` and `where` discipline, nested selects, N+1 queries, batching, transactions, the list contract, null vs undefined, and the Mongo appendix |
| `frontend-architecture.mdc` | `frontend/**` | Folder layout, the services layer, React Query, server vs client components, React 19 and the Compiler, and `set-state-in-effect` |
| `frontend-ui.mdc` | `frontend/**` | shadcn usage and install commands, the admin shell, forms, loading buttons, tables and mobile breakpoints |
| `frontend-seo-marketing.mdc` | `frontend/src/app/**` | Section 6 |

### Requirement map

| Your requirement | Rule file |
|---|---|
| 1. Best code practices, module structure, const helpers | `core`, `backend-architecture`, `frontend-architecture` |
| 2. No em dashes | `core` |
| 3. Proper UI practices | `frontend-ui` |
| 4. Pagination, search and filters on every table, with debounced search | `frontend-ui`, `backend-database` |
| 5. Proper shadcn usage | `frontend-ui` |
| 6. Portal templates and the admin layout | `frontend-ui` |
| 7. ESLint and Prettier from the start | `core`, plus the tooling in section 8 |
| 8. DB call optimization | `backend-database` |
| 9. Where conditions, minimal selects and nested selects | `backend-database` |
| 10. Null vs undefined, replacing the Mongo unset rule | `backend-database` |
| 11. Frontend services layer | `frontend-architecture` |
| 12. Loading states on buttons | `frontend-ui` |
| 13. Copy all helpers | Sections 3.6 and 4.4, and `core` tells agents to reuse them |
| 14. Meaningful comments and JSDoc | `core` |
| 15. Server vs client components | `frontend-architecture` |
| 16. `set-state-in-effect` | `frontend-architecture` |
| 17. React 19 features | `frontend-architecture` |
| Landing and SEO checklist: 404, meta, OG, robots, sitemap, CTA, images, legal pages, thank-you page | `frontend-seo-marketing` |
| Security | `security` |

---

## 10. Build phases

Each phase ends with a review before the next one starts.

| Phase | Work | Review gate |
|---|---|---|
| 0 | Write the 8 rule files and `docs/RULES.md`. Delete the stale rules. | You review the rules. |
| 1 | Scaffold the repo with root tooling, Husky, lint-staged, secretlint, `.nvmrc` and a README skeleton. | `npm install` succeeds and the hooks run. |
| 2 | Build the backend foundation: the Nest app, `backend/docker-compose.yml`, the env schema, Prisma and migrations, the shared module and helpers, pino, helmet, CORS, the throttler, Swagger, the health check and the Dockerfile. | Lint, typecheck and unit tests pass, and the app boots. |
| 3 | Build auth and emails: JWT cookies, refresh rotation, verification, reset, change password and the seed script. | The end-to-end auth test passes. |
| 4 | Build the users endpoints for both `/me` and admin, the dashboard KPI endpoint, the audit log, uploads and the optional request log. | The endpoints show in Swagger and the tests pass. |
| 5 | Build the frontend foundation: the Next app, shadcn on Radix, theme tokens, providers, the services layer, `proxy.ts`, rewrites and security headers. | Lint, typecheck and build pass. |
| 6 | Build the marketing and SEO pages: landing, privacy, terms, thank-you, 404, robots, sitemap, OG image and icons. | Lighthouse SEO and accessibility scores pass. |
| 7 | Build the auth pages and `/account`. | Register, verify, login and reset all work locally end to end. |
| 8 | Build the admin portal: the shell, dashboard, users table, audit log and profile. | The portal matches the screenshot and every table feature works. |
| 9 | Do a final pass: write the "start a new project" guide in the README, check the code against the rules, delete the two `.code-workspace` files and clean up. | A fresh clone reaches a running app in under 10 minutes. |

---

## 11. Open items

Phases 0 through 8 are done. Phase 9 has not started. Admins land on `/admin/dashboard`. Everyone else lands on `/account`.
