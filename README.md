# NestJS API Starter

A layered NestJS + Prisma + PostgreSQL API that publishes its contract as `openapi.json`. The paired frontend, `next-setup`, generates its Zod schemas and typed routes from that file.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm keys:generate
pnpm exec prisma migrate dev
pnpm db:seed
pnpm start:dev
```

`pnpm install` also generates the Prisma client. `pnpm keys:generate` prints the RS256 pair — paste the backend lines into `.env` and the public key into the frontend's `.env`. The seed creates `admin@example.com` / `password123`.

The API serves on `http://localhost:5000/api`, with Swagger at `/api/docs`.

## What ships

| Module   | Routes                                              |
| -------- | --------------------------------------------------- |
| `auth`   | `POST /auth/register`, `POST /auth/login`           |
| `users`  | CRUD on `/users`, plus `GET /users/me`              |
| `stats`  | `GET /stats/users/total`, `GET /stats/users/series` |
| `health` | `GET /health`                                       |

## Scripts

`pnpm start:dev` · `pnpm build` · `pnpm test` · `pnpm test:e2e` · `pnpm type-check` · `pnpm lint` · `pnpm openapi` · `pnpm db:seed` · `pnpm keys:generate`

## Architecture

The binding conventions live in `.claude/CLAUDE.md`: controller → service → repository → Prisma, thin repositories, DTOs as the type source, and the contract workflow. Read it before adding a module.
