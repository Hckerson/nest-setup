# Project Instructions

Reusable **NestJS + Prisma backend starter** with a layered, type-safe architecture.
The folder structure and principles below are **non-negotiable**.

---

## The 9 Rules (read first, never break)

1. **Every file has exactly one job.** `*.controller.ts` = HTTP only · `*.service.ts` = business logic only · `*.repo.ts` = data access only · `*.module.ts` = DI wiring only · `*.dto.ts` = validation only.
2. **Data access lives only in `common/repos/[domain].repo.ts`.** Nothing else touches Prisma.
3. **Layers flow one way:** Controller → Service → Repository → Prisma. A controller may NOT call a repo. A service may NOT touch `req`/`res`. A repo may NOT hold business logic.
4. **Services never return raw Prisma models** — return domain/response objects.
5. **Define once, reference everywhere.** Models in `schema.prisma`, validation in DTOs, errors in `common/errors/`, auth in `modules/core/auth/`. No duplication.
6. **Use the framework, don't hand-roll.** Prisma (no raw SQL), class-validator (no custom validators), Nest guards (no custom auth middleware), the global interceptor (no custom response wrappers).
7. **Strict types.** No `any` in services. DTOs are the type source. Prisma generates the rest.
8. **No stubs, no placeholders, no dead code.** Delete unused code. Comments explain WHY, not what.
9. **No hardcoding.** Config, secrets, base URLs, magic numbers, role names, and literals repeated in more than one place live in env (`@nestjs/config`), an enum in `common/enums/`, or a constants file — never inline.

If you're unsure where a file goes, the architecture is broken — stop and re-read this.

Aliases: `@common/*`, `@lib/*` (tsconfig).

---

## Workflow: Add a New Domain

1. Add model to `schema.prisma` → `prisma migrate dev --name <name>`.
2. Create `common/repos/[domain].repo.ts` (Prisma queries only) → register in `repo.module.ts`.
3. Create `modules/core/[domain]/`: `dto/` (create + update), `[domain].service.ts`, `[domain].controller.ts`, `[domain].module.ts`.
4. Import the module in `app.module.ts`.

**Copy `modules/core/users/` as the reference.** The admin module already exposes generic CRUD over any repo, so new domains usually just add repo + service.

---

## Layer Shape

**Module** — import dependencies, declare controller + service, export service if shared.

**Controller** — extract route params + body, call service, return result. Add `@UseGuards(JwtAuthGuard)` + `@Roles()` for protected routes. No logic.

**Service** — accept DTOs, enforce rules, throw `HttpException`s, call repo methods, return domain objects (not raw Prisma models).

**Repository** — wrap Prisma calls in `try/catch`, rethrow as `RepoError`. No business logic. Use `Prisma.[Model]GetPayload<>` for typed query results.

**DTO** — class-validator decorators validate input at the boundary; `UpdateDto extends PartialType(CreateDto)`.

These are contracts, not boilerplate to paste — write the minimal version that satisfies them.

---

## File Rules

- **One job per file** (see Rule 1). A file over ~150 lines of logic is doing too much — split it.
- **Absolute imports via `@common/*` and `@lib/*`.** Never deep-relative (`../../../common/...`).
- **Kebab-case filenames matching the export:** `user.service.ts` → `UserService`, `create-user.dto.ts` → `CreateUserDto`.
- **Co-locate by domain** under `modules/core/<domain>/`; shared infra stays in `common/`, pure helpers in `lib/`.
- **Add packages with `npm install`** — never hand-edit `package.json`.

---

## Error & Response Flow

- Throw typed errors anywhere (services: Nest exceptions; repos: `RepoError`).
- `common/filters/http-exception.filter.ts` formats every error into a standard HTTP shape.
- `common/interceptors/response.interceptor.ts` standardizes every success response (`{ status, data, message }`).
- Never build ad-hoc response wrappers or swallow errors without the filter.

---

## Tech Stack

NestJS · Prisma + PostgreSQL · class-validator / class-transformer · @nestjs/jwt + passport ·
@nestjs/swagger · Jest. Auth (`modules/core/auth/`) is already implemented — extend its guards,
don't reinvent it.

---

## Pre-merge Checklist

1. `npm run error` clean (`tsc --noEmit` — no type errors).
2. `npm run lint` clean.
3. `npm run build` succeeds.
4. No `any` in services, no `console.log`, no dead code or stubs.
5. No hardcoded config, secrets, or magic values (Rule 9).
6. Reused existing repos, guards, filters, and the global interceptor — didn't reinvent them.
7. Followed the layer contracts and matched the `users` module pattern.

---

**This is the only architecture.** Follow it precisely. If you're unsure where something goes, the design is broken—re-read this instead of inventing new locations.

Workflow: Analyze → Plan → Implement
