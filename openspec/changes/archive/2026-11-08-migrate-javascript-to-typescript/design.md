## Context

The backend is a CommonJS Node.js CLI with 16 JavaScript source files and 15 JavaScript test files at planning time. Tests use `node:test`, dependency injection and subprocesses. `frontend/` contains only package metadata. The documented direct entry is `backend/src/cli.js`; package scripts and `go.cmd` also start this CLI. Configuration discovery currently depends on source location, so a new compiled location is a compatibility risk.

The pending `restructure-backend-responsibilities` change reorganizes these modules. Prefer landing that change first; this migration follows the resulting responsibility boundaries rather than prescribing a competing layout. Recheck the actual tree before implementation.

Deutsch: Es gibt derzeit nur ausführbaren Backend-Code. Tests, Startpfade und Config-Auflösung müssen beim Wechsel auf kompilierte Dateien erhalten bleiben. Der geplante Architekturumbau soll möglichst vorher erfolgen.

## Goals / Non-Goals

**Goals:** Strict checking of all backend source and tests; concrete domain/dependency types; validated external-data boundaries; reproducible compilation; unchanged observable CLI and persisted formats; bilingual setup instructions.

**Non-Goals:** ESM migration, new frontend code, product features, graph/schema changes, replacing runtime validation with types, introducing a validation framework, or performing the independent architecture refactor here.

Deutsch: Ziel ist echte Typensicherheit, nicht nur eine neue Dateiendung. Kein Modulplattformwechsel, keine fachlichen Änderungen und keine neue Architekturplattform.

## Decisions

### 1. Compile TypeScript to CommonJS and run emitted JavaScript

Use TypeScript `import`/`export` syntax compiled with a CommonJS-compatible Node configuration while retaining `"type": "commonjs"`. Add TypeScript and Node.js typings as dev dependencies and commit their lockfile changes. Select and document a supported Node.js baseline compatible with native `fetch` and existing test-runner options; align compiler target and typings with that baseline.

Emit application files from `src/` to `dist/` using a production tsconfig. Use a separate test config extending shared strict settings, emitting source and tests under `.test-dist/src/` and `.test-dist/test/`. The test build uses the same relative module relationships as source. Clean only these owned output directories before building to prevent stale emitted files. Both output roots are ignored by Git.

`npm run typecheck` checks source, runtime tests and compile-time contract tests without emitting. `npm run build` creates production output. `npm test` runs typecheck, a clean test compilation, then the existing Node test runner on emitted runtime tests, preserving required isolation options. A `prestart` build ensures `npm start -- ...` uses current output; `prepack` builds distributable output. Package `main`/`bin` point to `dist/cli.js`. If the prior refactor changed the implementation entry, retain a thin `src/cli.ts` facade so this emitted entry remains stable.

Alternative: A `tsx`/`ts-node` runtime adds a loader and can mask missing typechecks. Native Node type stripping imposes version/syntax constraints and does not replace the compiler. A simultaneous ESM switch adds unrelated resolution changes. Compilation keeps the current deployment model.

Deutsch: TypeScript wird vor der Ausführung nach CommonJS übersetzt. Anwendung und Tests erhalten getrennte Ausgabeordner; Tests prüfen zuerst Typen. Zusätzliche Laufzeit-Loader sind nicht erforderlich.

### 2. Preserve a minimal direct-entry launcher, not JavaScript business logic

Retain `backend/src/cli.js` as the sole maintained application-JavaScript exception: a small launcher/export adapter for `dist/cli.js`, with no workflow logic. It preserves direct execution and, where used, the exported `main` entry. Missing build output produces an actionable build instruction and nonzero exit, not a module-resolution stack trace. Direct launcher execution requires an initial build; document that explicitly. `npm start` builds automatically, and `go.cmd` continues forwarding arguments and exit codes via npm.

Audit every `__dirname`-based lookup, subprocess command and fixture path. Compiled execution must locate root `config.json` independently of the caller's working directory; explicit config paths and config-relative cache/output paths keep current semantics. Do not copy local config or secrets into output. Tests importing `./cli` resolve typed implementation modules, and dedicated subprocess tests cover the legacy launcher separately.

Alternative: Removing `src/cli.js` would break the documented command and the other change's compatibility promise. Keeping forwarding modules for every old `.js` file would undermine a complete migration; only the CLI facade is justified.

Deutsch: Die kleine JavaScript-Startdatei bleibt als Kompatibilitätsadapter. Nach einem Build funktioniert der bisherige direkte Aufruf; npm baut automatisch. Config-Pfade dürfen durch den Ausgabeordner nicht verrutschen.

### 3. Model actual contracts, including existing nullable values

Define types near their owning responsibility, with type-only imports across boundaries: raw and normalized config, discriminated CLI arguments, cache/provider modes, extracted content, recipe metadata/ingredients/nodes/edges, completion messages, cache records and output paths. Use literal unions for existing finite values, typed function inputs/returns and typed dependency objects. Separate recipe facts from presentation types if the architecture change has introduced them.

Use narrow structural contracts for injected HTTP clients and completion clients so lightweight existing test doubles remain valid; do not require tests to fake every property of a full DOM `Response`. Production adapters must satisfy those same consumed capabilities. Use typed ESM-style imports/exports in `.ts` modules rather than retaining untyped `require`/`module.exports` boundaries.

Enable `strict: true`, `noUncheckedIndexedAccess: true`, `noEmitOnError: true` and `allowJs: false` across source and test configurations. Preserve the runtime schema's optional-versus-nullable semantics (for example ingredient preparation and optional numbers). Do not paper over errors with explicit `any`, `@ts-ignore`, `@ts-nocheck` or unchecked double assertions. A narrowly justified assertion after actual validation is acceptable. Negative contract tests use targeted `@ts-expect-error` checks to prove invalid node types, provider values and dependency signatures fail compilation.

Alternative: Blanket index signatures, casts or JSDoc-only checking are easier initially but leave important cross-module mistakes invisible. A new schema-generation dependency is unnecessary for the current small handwritten schema.

Deutsch: Typen bilden das reale Modell einschließlich erlaubtem `null` ab. Kleine explizite Schnittstellen halten Test-Doubles einfach. Strikte Prüfung darf nicht durch pauschale Ausnahmen umgangen werden.

### 4. Validate unknown external input before granting domain types

Immediately contain `JSON.parse` and response JSON results as `unknown`. Config, LLM payloads, extracted JSON-LD and cache data gain useful types only through runtime checks or appropriately narrowed access. Recipe validation accepts `unknown` and returns the validated recipe type, preserving current validation/error behavior. Catch variables are narrowed before reading error properties. Retain existing cache fallback behavior and provider error mapping rather than making all external payloads obey a new stricter schema.

Add positive and negative runtime tests at these boundaries, including legitimate nullable data, malformed payloads and invalid graph references. Add compile-time negative fixtures outside runtime test discovery; the no-emit check includes them, while production/test emit excludes them.

Alternative: Casting parsed JSON directly to domain types supplies no safety against malformed external data. Removing checks because types exist would be a regression.

Deutsch: Externe Daten beginnen als `unknown`. Erst bestehende oder entsprechend präzisierte Laufzeitprüfungen erlauben fachliche Typen; Fehlerverhalten und Cache-Fallback bleiben erhalten.

## Risks / Trade-offs

- [Cross-cutting import/type errors] -> Migrate in dependency-ordered batches, run GitNexus upstream impact before each symbol edit, and report HIGH/CRITICAL blast radius before editing.
- [Compiled paths change config/fixture discovery] -> Test default/explicit config from root and backend, emitted subprocess execution, legacy launcher, and Windows helper invocation.
- [Strictness changes accepted data or doubles] -> Model current nullable contracts, keep boundary validation behavior, and prefer narrow consumed-capability interfaces.
- [Build introduces stale files or runtime-version drift] -> Clean only owned outputs, pin dependency resolutions, document Node support, and verify clean-install/build/test/pack flows.
- [Parallel architecture changes conflict] -> Prefer refactor-first sequencing, reconcile the current tree at apply time, and preserve unrelated working-tree edits.

Deutsch: Die größten Risiken sind Pfadauflösung, unbemerkte Verhaltensänderungen und Überschneidungen mit dem Umbau. Referenztests, gezielte Typen und saubere Builds begrenzen sie.

## Migration Plan

1. Reconcile the pending structural change and current user edits; record runtime version, test baseline and deterministic offline outputs without reading local secrets.
2. Establish compiler configurations, scripts and contract-test setup; migrate types and modules in dependency order with required impact checks.
3. Migrate all runtime tests and subprocess paths, then wire compiled entry points, legacy launcher and stable config resolution.
4. Verify typecheck, clean build, all runtime/negative tests, offline output compatibility and package entry points. Update English/German documentation and validate OpenSpec strictly.
5. Review the scoped diff; before any later commit run GitNexus change detection and base the commit message on `migrate-javascript-to-typescript`.

Rollback restores only this migration's source/tooling changes and removes only its generated output. No persisted configuration, cache or recipe-data migration is needed.

Deutsch: Zuerst den tatsächlichen Projektstand abgleichen, dann schrittweise typisieren und alle Aufrufwege prüfen. Ein Rollback betrifft nur diesen Change, keine Nutzerdaten oder fremden Änderungen.

## Open Questions

None blocking planning. Confirm the actual supported Node.js version and architecture-change landing state before implementation; record the selected versions and resolved module paths in developer documentation.

Deutsch: Keine blockierenden Fragen. Node-Version und Umsetzungsstand des Architekturumbaus werden vor Beginn konkret geprüft.

## Implementation Notes / Umsetzungsstand

The architecture change was still unimplemented when this migration started. The existing flat module boundaries were retained rather than implementing another change implicitly. The supported runtime is Node.js >=24 (verified with 24.13.0), with TypeScript 5.9 and Node 24 typings. The original 49 tests passed before migration. Compiled tests add coverage for launcher compatibility, clean startup builds, malformed external payloads and nullable recipes. A direct comparison against HEAD's JavaScript confirmed identical Mermaid output (both visibility modes), ingredient lines, output slugs, page/LLM cache keys and prompt bytes.

Deutsch: Der Architekturumbau war noch offen; diese Migration behält deshalb die vorhandenen Modulgrenzen bei. Node.js >=24 ist die Laufzeitbasis. Alle 49 ursprünglichen Tests waren vorab erfolgreich; zusätzlich wurden Startpfade, Neubauten und externe Datengrenzen geprüft. Der direkte Vergleich mit dem bisherigen JavaScript bestätigte unveränderte Ausgaben und Identitäten.

Process deviation: Upstream impact was queried before source-symbol migration, but the HIGH-risk warnings for `createCacheKey` (2 direct dependents, 3 affected processes) and `isColdPassiveProcess` (2 direct dependents, 2 affected processes) were reported only after editing. Task 1.3 remains unchecked because that communication requirement cannot be satisfied retroactively. Their algorithms were preserved and baseline comparisons passed. The initial GitNexus change detection did not fully represent untracked TypeScript additions and must not be interpreted as a complete low-risk assessment. The user explicitly approved synchronization, archival, commit and push with this documented exception on 2026-11-08.

Deutsch: Die Impact-Prüfungen erfolgten vorab, die beiden HIGH-Warnungen wurden jedoch erst nach den Änderungen mitgeteilt. Deshalb bleibt Aufgabe 1.3 offen; diese Prozessanforderung lässt sich nicht rückwirkend erfüllen. Die Algorithmen blieben unverändert. Die ursprüngliche GitNexus-Änderungserkennung erfasste die unversionierten TypeScript-Dateien nicht vollständig und ist daher keine vollständige Risikobewertung. Der Nutzer hat Synchronisierung, Archivierung, Commit und Push mit dieser dokumentierten Ausnahme am 2026-11-08 ausdrücklich bestätigt.
