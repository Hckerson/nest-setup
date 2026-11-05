# Starter Dependency Cleanup — nest-setup

`Phases 0–5 done` · e2e blocked on local `.env` (database URL, JWT keys) · 2026-11-05 · branch `chore/starter-dependency-cleanup` off `development`

## 1. Thesis

A starter kit should install only what something in it runs. In nest-setup, six dev dependencies run nothing, one script is broken under pnpm, and the docs promise git hooks that no longer exist.

| Layer       | Question it answers                         | Primary artifact                                            |
| ----------- | ------------------------------------------- | ----------------------------------------------------------- |
| Manifest    | Which packages does the kit install?        | `package.json`, `pnpm-lock.yaml`                            |
| Scripts     | Does every script run under pnpm?           | `package.json` › `test:debug`                               |
| Git tooling | What runs on commit and push?               | `prepare`, `lint-staged` block, `.husky/_`, `core.hooksPath` |
| Docs        | Do the instructions match the code?         | `.claude/CLAUDE.md` › Before you commit or push             |

## 2. The Canonical Atom — `PackageVerdict`

```ts
type Verdict = "keep" | "remove" | "optional";
type EvidenceKind = "import" | "script" | "config" | "peer" | "runtime-load";

interface PackageVerdict {
    name: string;
    group: "dependencies" | "devDependencies";
    value: Verdict;
    status: "proposed" | "applied" | "verified";
    evidence: { kind: EvidenceKind; ref: string }[];
    confidence: "high" | "medium";
}
```

Invariants:

1. `remove` requires empty evidence across all five kinds. A script or config reference counts as use, not just an import.
2. A package kept alive only by a broken script is **fixed, then removed**: the script fix lands first, and the verdict becomes `remove` only once the fixed script no longer names it.
3. `medium` confidence never auto-applies. It becomes an open decision.
4. `verified` means the lockfile diff shows the package gone. pnpm's exit code is not evidence (see R1).

**Ledger — packages that change**

| Package              | Group | Value      | Evidence once its phase lands                                                     | Confidence |
| -------------------- | ----- | ---------- | --------------------------------------------------------------------------------- | ---------- |
| `husky`              | dev   | `remove`   | `prepare: "husky"` — deleted in the same phase                                    | high       |
| `lint-staged`        | dev   | `remove`   | `lint-staged` block — deleted in the same phase                                   | high       |
| `@eslint/eslintrc`   | dev   | `remove`   | none — `eslint.config.mjs` is native flat config, no `FlatCompat`                 | high       |
| `ts-loader`          | dev   | `remove`   | none — `nest-cli.json` does not enable webpack                                    | high       |
| `ts-node`            | dev   | `remove`   | `test:debug` preload — dropped by Phase 1                                         | high       |
| `tsconfig-paths`     | dev   | `remove`   | `test:debug` preload — dropped by Phase 1                                         | high       |
| `source-map-support` | dev   | `remove`   | none — Nest CLI 11 passes `--enable-source-maps` to every `nest start` itself      | high       |

**Ledger — kept with no direct import**, recorded so they are not flagged again:

| Package                          | Evidence kind  | Ref                                                              |
| -------------------------------- | -------------- | ---------------------------------------------------------------- |
| `@nestjs/platform-express`       | runtime-load   | `NestFactory.create` in `src/main.ts` loads the default adapter  |
| `@prisma/client`                 | import         | `generated/prisma` imports `@prisma/client/runtime/*`            |
| `class-transformer`              | runtime-load   | `ValidationPipe({ transform: true })` in `src/main.ts`           |
| `passport`                       | peer           | `@nestjs/passport`, `passport-jwt`                               |
| `reflect-metadata`               | peer           | `@nestjs/common`, `@nestjs/core`                                 |
| `eslint-config-prettier`         | peer           | `eslint-plugin-prettier/recommended` in `eslint.config.mjs`      |
| `@nestjs/cli`                    | script         | `build`, `start*`, `openapi`                                     |
| `@nestjs/schematics`             | config         | `nest-cli.json` › `collection`                                   |
| `jest`, `ts-jest`                | script, config | `test*` scripts, `jest.transform`, `test/jest-e2e.json`          |
| `prettier`                       | script, peer   | `format`, `eslint-plugin-prettier`                               |
| `eslint`, `typescript`, `tsx`, `prisma` | script  | `lint`, `type-check`, `keys:generate` + seed, `postinstall`      |
| `@types/*` (6)                   | import         | type imports and Jest globals                                    |

Every other package is imported by name in `src/`, `prisma/`, `test/` or a root config file. All 17 runtime dependencies stay.

## 3. Atomic UI Hierarchy

No UI changes. The kit has one UI surface:

| Component                         | Role                 | Reads                                     |
| --------------------------------- | -------------------- | ----------------------------------------- |
| Swagger UI at `/<API_PREFIX>/docs` | Interactive API docs | Document built at boot in `src/main.ts` |

`pnpm openapi` builds its own document in `src/openapi.emit.ts` and does not read this page, so the next-setup contract does not depend on it. Whether it stays is D3. `@nestjs/swagger` stays either way.

## 4. Pipeline Architecture

```
package.json ──► collect evidence ──► verdict ──► edit package.json ──► lockfile regen ──► diff check
  48 packages    imports · scripts     keep                              --lockfile-only     only removals,
                 config · peers        remove                            --ignore-scripts    no removed name
                 runtime loads         optional ──► open decision (you)                      left in lockfile
```

**Deterministic spine:** evidence collection (`git grep` over imports, scripts and configs), the manifest edit, lockfile regeneration and the diff check. No step guesses.

**Judgement skin:** only `medium` verdicts and convention choices (source maps, `prepare`, Swagger UI). These surface as open decisions and are never applied silently.

**Why `pnpm install --lockfile-only --ignore-scripts`:** `node_modules` is not installed in nest-setup. `pnpm remove` would run a full install, trigger `postinstall: prisma generate` and `prepare: husky`, and exit non-zero on ignored build scripts. The lockfile-only path updates resolution and runs nothing.

## 5. Minimal Additive Data Model

| Layer                            | Change                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `package.json` › `test:debug`    | `node --inspect-brk node_modules/jest/bin/jest.js --runInBand`               |
| `package.json` › `prepare`       | delete (or replace — D2)                                                     |
| `package.json` › `lint-staged`   | delete the block                                                             |
| `package.json` › devDependencies | −6                                                                           |
| `pnpm-lock.yaml`                 | regenerated; removals only                                                   |
| `.husky/_` (untracked)           | delete                                                                       |
| Local git config                 | `git config --unset core.hooksPath`                                          |
| `.claude/CLAUDE.md`              | rewrite "Before you commit or push" to describe what actually runs           |

**Does not change:** `src/`, `prisma/` (schema and seed), `openapi.json`, all 17 runtime dependencies, `tsconfig*.json`, `eslint.config.mjs`, `nest-cli.json`, the `jest` block, `test/jest-e2e.json`, the Swagger setup, every script other than `test:debug` and `prepare`, `.env.example`.

## 6. Security & Limits

| Area          | Rule                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Installs      | Removal only. No package is added or upgraded.                                                         |
| Scripts       | Lockfile regenerates with `--ignore-scripts`; no dependency or root lifecycle script runs.             |
| Build scripts | pnpm's build-script approvals (`bcrypt`, Prisma engines) are out of scope and left untouched.          |
| Lockfile      | The diff may contain removals only. Any added or version-changed entry stops the phase.               |
| Git config    | The `core.hooksPath` change is local to this clone; nothing pushed alters other clones.                |
| Contract      | `openapi.json` must not change. If it does, stop — this refactor touches no DTO.                      |
| Checks        | `lint`, `type-check`, `test` and `build` run only with your approval. Default verification is reading diffs. |

## 7. Vertical-Slice Build Order

One commit per phase, on `chore/starter-dependency-cleanup` off `development`.

**Phase 0 — Baseline.** Confirm the tree is clean and create the branch.
Exit Criteria: clean `git status`; branch exists.

**Phase 1 — Fix `test:debug`.** Point it at Jest's own entry file and drop both `-r` preloads. Jest already handles TypeScript (`ts-jest`) and the `@common` / `@core` / `@lib` aliases (`moduleNameMapper`).
Exit Criteria: no script in `package.json` names `ts-node` or `tsconfig-paths`.

**Phase 2 — Remove the four dead tools.** `@eslint/eslintrc`, `ts-loader`, `ts-node`, `tsconfig-paths`. Edit `package.json`, regenerate the lockfile.
Exit Criteria: `git grep` finds none of the four outside `pnpm-lock.yaml` history; lockfile diff is removals only.

**Phase 3 — Retire hook tooling.** Remove `husky`, `lint-staged`, the `prepare` script and the `lint-staged` block in one commit. Delete `.husky/_` and unset `core.hooksPath`.
Exit Criteria: `git config --get core.hooksPath` exits 1; `package.json` names neither package; lockfile diff is removals only.

**Phase 4 — Make the docs true.** Rewrite "Before you commit or push" in `.claude/CLAUDE.md`: no hooks run; the manual gate is `pnpm type-check`, `pnpm lint`, and `pnpm openapi` when a DTO, route or `@ApiProperty` changes.
Exit Criteria: `git grep -i "husky\|lint-staged"` returns nothing in `.claude/` or `README.md`.

**Phase 5 — Verify (needs your approval).** `pnpm install`, `pnpm build`, `pnpm test`, `pnpm openapi` then `git diff --exit-code openapi.json`; in next-setup, `pnpm contract:check`.
Exit Criteria: all pass and `openapi.json` is byte-identical.

## 8. Differentiator Matrix

| Idea                                                                        | Impact                                                           | Effort | Notes                                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| Replace `prepare` with next-setup's `git config --unset-all core.hooksPath \|\| exit 0` | Clones that ran husky drop the dead hooks path on next install | XS     | Same convention in both starters. Changes Phase 3 from delete to replace. |
| Swap `source-map-support` for `NODE_OPTIONS=--enable-source-maps` in `start*` | Removes the last optional package with no loss of TS stack traces | S      | Resolves D1                                              |
| Align both starters' "Before you commit or push" sections                   | One account of hooks across both kits                            | S      | next-setup's section still describes `.husky/` and `prepare: husky` |
| Unused-dependency check as a script (`knip`)                                | Catches the next dead package automatically                      | M      | Adds a dev dependency — needs your approval              |

**Top 2:** the self-healing `prepare` (cheapest, and it clears the only leftover state outside the repo) and the source-maps swap (finishes the cleanup instead of leaving one package in limbo).

## 9. Risks & Mitigations Register

| Risk                                                                                       | Mitigation                                                                                     |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| R1 — pnpm exits non-zero on ignored build scripts (seen in next-setup), so a good step looks failed | Judge each phase by the `package.json` and lockfile diff, never the exit code               |
| R2 — `husky` removed while `prepare` still calls it, so `pnpm install` fails               | Both leave in the same commit (Phase 3)                                                        |
| R3 — someone turns on webpack builds later                                                 | `ts-loader` comes back with `"webpack": true`; say so in the Phase 2 commit message           |
| R4 — removing `source-map-support` degrades `nest start` stack traces                      | Does not happen: Nest CLI 11 passes `--enable-source-maps` itself (`actions/start.action.js`)  |
| R5 — other clones keep `core.hooksPath=.husky/_`                                           | Harmless (git finds no hooks there); the self-healing `prepare` clears it                     |
| R6 — the new `test:debug` path is wrong                                                    | After install, confirm `node_modules/jest/package.json` › `bin.jest` is `./bin/jest.js` (Phase 5) |
| R7 — docs drift again                                                                      | Phase 4 exit criterion greps for the removed tools                                             |

## 10. Recommendation & Open Decisions

**Recommendation:** ship Phases 0–4 as one PR into `development`, four commits, then run Phase 5 once you approve the checks.

**Decisions (resolved 2026-11-05):**

1. **D1 — `source-map-support`:** removed. Nest CLI 11 already starts Node with `--enable-source-maps`, so nothing replaces it.
2. **D2 — `prepare`:** replaced with next-setup's `git config --unset-all core.hooksPath || exit 0`, so old clones drop the husky hooks path on install.
3. **D3 — Swagger UI:** kept.
4. **D4 — next-setup leftovers:** handled separately in next-setup; the stale docs are fixed, the rest waits for a new UI.
5. **D5 — next-setup's changes:** committed on `development` before this started.

pnpm build scripts are approved in `pnpm-workspace.yaml` › `allowBuilds`: Prisma, `bcrypt`, `esbuild` and `unrs-resolver` run; `@scarf/scarf` (install analytics) does not.
