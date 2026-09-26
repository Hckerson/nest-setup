# Project Instructions

This is a reusable **NestJS + Prisma backend starter** with a strict, layered, type-safe architecture designed for scale and maintainability.

## Non-negotiable rules

1. **Every file has exactly one job.** `*.controller.ts` = HTTP only · `*.service.ts` = business logic only · `*.repo.ts` = data access only · `*.module.ts` = DI wiring only · `*.dto.ts` = validation only. A file over ~150 lines of logic is doing too much — split it.
2. **Data access lives only in `common/repos/[domain].repo.ts`.** Nothing else touches Prisma. Ever.
3. **Layers flow one way:** Controller → Service → Repository → Prisma. A controller may NOT call a repo. A service may NOT touch `req`/`res`. A repo may NOT hold business logic.
4. **Services never return raw Prisma models.** Always return domain/response objects. Transform at the boundary.
5. **Single source of truth.** Models in `schema.prisma`, validation in DTOs, errors in `common/errors/`, auth in `modules/core/auth/`, enums in `common/enums/`. No duplication anywhere.
6. **Use the framework.** Prisma (not raw SQL), class-validator (not custom validators), Nest guards (not custom middleware), global interceptor (not ad-hoc wrappers). Don't hand-roll what Nest provides.
7. **No hardcoding.** Config, secrets, base URLs, magic numbers, role names, repeated literals — all live in env (`@nestjs/config`), `common/enums/`, or a constants file. Never inline.
8. **No dead code, stubs, or placeholders.** Delete unused code.
9. **No `console.log` or debug statements** in committed code. Use the Nest logger.

**Absolute imports via `@common/*` and `@lib/*`.** Never deep-relative (`../../../common/...`).

**This is the only architecture.** Follow it precisely. If you're unsure where something goes, the design is broken — re-read this instead of inventing new locations.

---

## Core Principle: Derive, Never Reconstruct

If a library or framework generates a type, schema, validation result, or query shape, use that derived output directly. Examples: Prisma `GetPayload<>`, Zod `infer`, class-validator DTO output, NestJS guards, global interceptor results.

Never replace a derived artifact with `any`, `Record<>`, `as` assertions, or hand-written parallel types. If you need a smaller shape, derive it via framework helpers or standard TypeScript utilities (`Pick`, `Omit`), not ad hoc object literals.

**When you encounter a new framework tool:** First check whether it produces a derived type, schema, result shape, or validation outcome. If it does, use that output directly and avoid manual reconstruction.

| Derived artifact        | Source → Use                                               | ✅ Do                                                            | ❌ Don't                                   |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| **Prisma query result** | `.findUnique({ include: { plan: true } })` → typed payload | Use `Prisma.SubscriptionGetPayload<{ include: { plan: true } }>` | Cast to `any` or `Record<>`                |
| **Zod schema**          | `schema` → validated input + inferred type                 | Use `z.infer<typeof schema>`                                     | Duplicate the type by hand                 |
| **class-validator DTO** | Decorated DTO → validated request object                   | Accept the validated DTO in the service                          | Re-validate the same fields in the service |
| **NestJS guards**       | `@UseGuards(JwtAuthGuard)` → authenticated request         | Call the service after the guard passes                          | Hand-roll auth checks in the service       |
| **Global interceptor**  | `return data` from controller → wrapped response           | Return the domain object directly                                | Build `{ status, data, message }` manually |

## Required patterns

| Layer          | Responsibility                                                                                                                         | Rules                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Controller** | Extract route params + body, call service, return result. Add `@UseGuards(JwtAuthGuard)` + `@Roles()` for protected routes.            | No business logic. No Prisma. No direct repo calls.                                                                                                          |
| **Service**    | Accept DTOs, enforce business rules, throw `HttpException`s, call repo methods, return domain objects.                                 | No raw Prisma models in responses. No `req`/`res` objects. Never throw `RepoError` directly. Business logic, filtering, aggregation, composition — all here. |
| **Repository** | **ONLY** wrap the 10 Prisma-native methods in `try/catch`, rethrow as `RepoError`. Use `Prisma.[Model]GetPayload<>` for typed results. | Thin Prisma wrapper only. See "Repository Methods: Ironclad Rule" below. No custom domain methods.                                                           |
| **DTO**        | Use class-validator decorators for input validation at the boundary. `UpdateDto extends PartialType(CreateDto)`.                       | Type source for incoming data. Never used as response shape.                                                                                                 |
| **Module**     | Import dependencies, declare controller + service, export service if shared.                                                           | DI wiring only.                                                                                                                                              |

## Repository Methods: Ironclad Rule

**Repositories are ONLY thin wrappers around Prisma's 10 native methods.** No custom domain methods.

## Folder Structure

| Route                     | Purpose                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/src/common/`            | Shared infrastructure: repos, filters, guards, errors, enums, decorators, middleware.                                                |
| `/src/common/repos/`      | Data access layer. One `[domain].repo.ts` per entity. Prisma only. **Repos = thin wrappers around Prisma's 10 native methods only.** |
| `/src/common/errors/`     | Error definitions (`RepoError`). The filter that shapes them lives in `common/filters/`.                                             |
| `/src/common/enums/`      | Constants and enums. Single source of truth.                                                                                         |
| `/src/common/decorators/` | Custom decorators (auth, roles, etc.).                                                                                               |
| `/src/lib/`               | Pure utility functions and helpers. No NestJS dependencies. `period.ts` owns day/month/year boundaries.                              |
| `/src/modules/core/`      | Domain-specific modules. One folder per domain with `dto/`, `*.service.ts`, `*.controller.ts`, `*.module.ts`.                        |
| `/src/modules/core/auth/` | Authentication logic. Already implemented. Extend, don't reinvent.                                                                   |

## Before you commit or push

Formatting and linting are automated. They are not chores you run by hand.

- **Commit** — Husky's `pre-commit` hook runs `pnpm lint-staged` and nothing else: `eslint --fix` then `prettier --write`, over staged files only. It is fast by design.
- **Push** — Husky's `pre-push` hook runs `pnpm type-check`, then `pnpm lint`, and blocks on failure. This is the real gate.
- **OpenAPI** — if any DTO, route, or `@ApiProperty` changed, run `pnpm openapi` and commit `openapi.json`.

`pnpm format` and `pnpm lint` stay available for a manual full-repo sweep, but no workflow requires you to run them.

## Pre-merge checklist

1. No `console.log`, no dead code or stubs.
2. No inline type/lint rule suppressions (`// @ts-ignore`, `// eslint-disable`, `as any`, etc.).
3. No hardcoded config, secrets, or magic values (all in env, enums, or constants).
4. Reused existing repos, guards, filters, and the global interceptor. Nothing reinvented.
5. Followed the layer contracts. Repos stayed thin. Matched the `users` module pattern exactly.

**Do not merge if any check fails.**
