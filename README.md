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

## Docs

- `docs/PLAN.md` is the build plan.
- `docs/RULES.md` maps each requirement to a Cursor rule.
- `.cursor/rules/` holds the rules.
