# Cursor rules guide

The rules live in `.cursor/rules/`. This guide maps each requirement to the rule and section that covers it, so you can check that nothing is missing. It sits in `docs/` because Cursor can load `.md` files in the rules folder as rules.

## How the rules load

| File                         | Loads when                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `core.mdc`                   | Always                                                                                                         |
| `security.mdc`               | Always                                                                                                         |
| `os-specific-shell.mdc`      | Always                                                                                                         |
| `backend-architecture.mdc`   | A file under `backend/` is in context                                                                          |
| `backend-database.mdc`       | A file under `backend/` is in context                                                                          |
| `frontend-architecture.mdc`  | A file under `frontend/` is in context                                                                         |
| `frontend-ui.mdc`            | A file under `frontend/` is in context                                                                         |
| `frontend-seo-marketing.mdc` | A file under `frontend/src/app/`, `frontend/src/components/marketing/` or `frontend/src/config/` is in context |
| `e2e-testing.mdc`            | A file under `e2e/` is in context                                                                              |

Every rule file has the same shape. A short intro comes first, then numbered sections with Must and Never lists, then a review checklist. To review a pull request, open the checklists of the rules for the folders it touches.

## Requirement map

| #   | Requirement                                                          | Rule and section                                                          |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Best code practices, module structure, const helpers                 | `core` 3, 4, 5 and 6. `backend-architecture` 1. `frontend-architecture` 1 |
| 2   | No em dashes                                                         | `core` 1                                                                  |
| 3   | Proper UI practices                                                  | `frontend-ui` 2, 7 and 8                                                  |
| 4   | Pagination, search and filters on every table, with debounced search | `frontend-ui` 4. `backend-database` 6. `frontend-architecture` 7          |
| 5   | Proper use of shadcn components                                      | `frontend-ui` 1                                                           |
| 6   | Portal templates, sidebar and navbar, admin layout                   | `frontend-ui` 3                                                           |
| 7   | ESLint and Prettier from the start                                   | `core` 7, plus the configs in `docs/PLAN.md` section 8                    |
| 8   | DB call optimization, no query spam from helpers                     | `backend-database` 3 and 4                                                |
| 9   | Where conditions, minimal selects, nested selects                    | `backend-database` 1 and 2                                                |
| 10  | Null vs undefined, replacing the Mongo unset rule                    | `backend-database` 7 and the MongoDB appendix                             |
| 11  | Frontend services layer                                              | `frontend-architecture` 3 and 4                                           |
| 12  | Loading states on buttons                                            | `frontend-ui` 6                                                           |
| 13  | Copy all helpers from Driving-Test and HumanityHub                   | `docs/PLAN.md` sections 3.6 and 4.4. `core` 5 tells agents to reuse them  |
| 14  | Meaningful comments and JSDoc                                        | `core` 2                                                                  |
| 15  | Server vs client components                                          | `frontend-architecture` 2                                                 |
| 16  | `react-hooks/set-state-in-effect`                                    | `frontend-architecture` 6                                                 |
| 17  | React 19 features                                                    | `frontend-architecture` 5                                                 |
| 18  | Custom 404                                                           | `frontend-seo-marketing` 2                                                |
| 19  | Meta title and description on every page                             | `frontend-seo-marketing` 1                                                |
| 20  | CTA above the fold, sticky mobile CTA                                | `frontend-seo-marketing` 3                                                |
| 21  | Favicon, robots.txt, sitemap.xml, Open Graph image                   | `frontend-seo-marketing` 2                                                |
| 22  | Alt text and compressed images                                       | `frontend-seo-marketing` 4                                                |
| 23  | Mobile breakpoints                                                   | `frontend-ui` 7                                                           |
| 24  | Loading states                                                       | `frontend-ui` 4 and 6. `frontend-architecture` 10                         |
| 25  | Form error states                                                    | `frontend-ui` 5                                                           |
| 26  | Thank-you, privacy and terms pages                                   | `frontend-seo-marketing` 5                                                |
| 27  | Security                                                             | `security`, all sections                                                  |
| 28  | Page speed: FCP, LCP, CLS, INP, TTFB, without blocking features      | `frontend-architecture` 11. `frontend-seo-marketing` 4 and 6              |
| 29  | One controller per backend module                                    | `backend-architecture` 1 and 2. `security` 3                              |
| 30  | Cursor pagination for large lists, offset for normal tables          | `backend-database` 6. `frontend-ui` 4. `frontend-architecture` 4 and 7    |
| 31  | End-to-end tests for signup and login, from the UI to the backend    | `e2e-testing`, all sections. `docs/PLAN.md` section 8.1                   |

## Changing a rule

- Edit the `.mdc` file and update this map in the same change.
- Keep each rule to one topic. Split a file once it passes about 250 lines.
- Write Must and Never items as instructions an agent can check. "Use `select` on every client-facing query" works. "Keep queries efficient" doesn't.
