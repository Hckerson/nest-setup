# Project Instructions

Reusable **NestJS + Prisma backend starter**: strict, layered, type-safe.

## Rules

1. **One job per file.** `*.controller.ts` HTTP only · `*.service.ts` business logic only · `*.repo.ts` data access only · `*.module.ts` DI wiring only · `*.dto.ts` validation only. Split files over ~150 lines.
2. **Prisma is touched only in `common/repos/[domain].repo.ts`.**
3. **Layers flow one way:** Controller → Service → Repository → Prisma. Controllers never call repos, services never touch `req`/`res`, repos hold no business logic.
4. **Services never return raw Prisma models.** Return domain/response objects.
5. **Single source of truth.** Models in `schema.prisma`, validation in DTOs, errors in `common/errors/`, auth in `modules/core/auth/`, enums in `common/enums/`.
6. **Use the framework.** Prisma over raw SQL, class-validator over custom validators, guards over custom middleware, the global interceptor over ad-hoc response wrappers.
7. **No hardcoding.** Config, secrets, URLs, magic numbers, role names and repeated literals live in env (`@nestjs/config`), `common/enums/` or a constants file.
8. **No dead code, stubs or placeholders.**
9. **No `console.*`.** Use the Nest logger.
10. **Absolute imports** via `@common/*` and `@lib/*`.

Don't invent locations; if unsure where something goes, the design is broken, so re-read this.

## Derive, never reconstruct

Use the type a framework derives: `Prisma.[Model]GetPayload<>`, `z.infer`, validated DTOs, guard-authenticated requests, the interceptor's wrapped response (return the domain object, don't build `{ status, data, message }`). Never replace one with `any`, `Record<>`, `as`, or a hand-written parallel type; narrow with `Pick`/`Omit`.

## Layer contracts

- **Controller:** extract params and body, call the service, return the result. Protected routes get `@UseGuards(JwtAuthGuard)` + `@Roles()`.
- **Service:** accepts DTOs, enforces business rules, throws `HttpException`s (never `RepoError`), returns domain objects.
- **Repository:** only thin `try/catch` wrappers around Prisma's 10 native methods, rethrowing `RepoError`. No custom domain methods.
- **DTO:** class-validator at the boundary; `UpdateDto extends PartialType(CreateDto)`. Never a response shape.
- **Module:** imports, controller + service, export the service if shared.

## Layout

`common/` holds shared infrastructure (repos, filters, guards, errors, enums, decorators). `lib/` is pure helpers with no Nest dependencies; `period.ts` owns day/month/year boundaries. `modules/core/<domain>/` has `dto/`, service, controller, module; match the `users` module. `modules/core/auth/` is done, so extend it.

## Before commit

No git hooks run. Gate manually: `pnpm type-check`, then `pnpm lint`. If any DTO, route or `@ApiProperty` changed, run `pnpm openapi` and commit `openapi.json`.
