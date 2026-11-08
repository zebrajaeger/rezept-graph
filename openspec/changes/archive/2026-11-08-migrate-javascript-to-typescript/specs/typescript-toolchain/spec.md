## ADDED Requirements

### Requirement: Strictly checked backend implementation and tests

All maintained backend application modules and runtime tests SHALL be TypeScript, except a minimal JavaScript compatibility launcher at `backend/src/cli.js`. Source and tests MUST use statically checked module imports/exports and compile with `strict`, `noUncheckedIndexedAccess`, `noEmitOnError` enabled and `allowJs` disabled. The migration MUST NOT bypass contract errors using explicit `any`, blanket suppression directives or unchecked double assertions.

Deutsch: Backend und Tests werden strikt typisiert; nur die minimale Startdatei bleibt JavaScript. Pauschale Umgehungen der Typprüfung sind nicht zulässig.

#### Scenario: Source or test has an incompatible contract
- **WHEN** a source module or runtime test passes an invalid provider value, graph node type or dependency signature
- **THEN** `npm run typecheck` exits nonzero with a diagnostic

#### Scenario: Compile-time negative contracts remain enforced
- **WHEN** the dedicated invalid-contract fixtures run through the no-emit typecheck
- **THEN** invalid examples are rejected using targeted expected-error assertions, and removing the compiler error causes that check to fail
- **AND** those fixtures are not executed as runtime tests

### Requirement: Typed and validated external-data boundaries

Configuration, extracted content, recipe graphs, cache records, LLM messages and injected dependencies SHALL have concrete contracts reflecting existing accepted values, including allowed `null` values. Untrusted JSON and provider data MUST enter as `unknown` and MUST be narrowed or runtime-validated before domain use. Existing runtime rejection and cache-fallback behavior SHALL remain intact.

Deutsch: Fachliche und technische Datenübergänge erhalten konkrete Typen. Externe Daten bleiben bis zur Prüfung unbekannt; bestehende erlaubte Werte und Fehlerpfade bleiben erhalten.

#### Scenario: Malformed recipe data enters the pipeline
- **WHEN** parsed LLM data contains an invalid node type or an edge referring to a missing node
- **THEN** runtime validation rejects it through the existing error path rather than treating it as a valid typed recipe

#### Scenario: Valid nullable data is analyzed
- **WHEN** a valid recipe includes optional fields with currently accepted `null` values
- **THEN** runtime validation and downstream processing accept it without casts that hide an incompatible type

#### Scenario: Minimal injected client is used
- **WHEN** a typed test supplies only the HTTP or completion capabilities consumed by the application
- **THEN** the dependency satisfies the declared contract without fabricating unused response properties

### Requirement: Reproducible build and verification commands

The backend SHALL provide `npm run typecheck`, `npm run build` and `npm test`. The build SHALL emit CommonJS JavaScript into ignored `dist/` output without emitting tests. `npm test` MUST perform typechecking and execute compiled runtime tests using the existing Node test runner behavior. Build commands MUST remove stale files only from their owned output directories. The documented supported Node.js version, dependency lockfile and package metadata SHALL allow clean installation and execution without a TypeScript runtime loader.

Deutsch: Reproduzierbare Befehle prüfen Typen, bauen die Anwendung und führen kompilierte Tests aus. Generierte Dateien werden nicht versioniert; die Laufzeit benötigt keinen TypeScript-Loader.

#### Scenario: Clean checkout is verified
- **WHEN** a developer uses the documented Node.js version and runs `npm ci`, `npm run typecheck`, `npm run build` and `npm test` in the backend
- **THEN** all commands succeed for the migrated code and production output contains application code but no runtime test files

#### Scenario: A migrated module was removed or renamed
- **WHEN** a subsequent build runs after a module is removed or renamed
- **THEN** its obsolete emitted files do not remain in that build's output
- **AND** source files, local configuration, caches and recipe outputs are not deleted

### Requirement: Compatible CLI and persisted behavior

The compiled application SHALL preserve commands, options, exit codes, output content, cache formats and configuration/path semantics. `npm start -- ...` SHALL build current source before execution. Package `main` and `bin` SHALL resolve to built code, with packaging preparing that code. After an explicit build, the documented `node backend/src/cli.js ...` invocation SHALL remain usable through its minimal launcher. `backend/go.cmd` SHALL retain caller-independent operation and exit-code forwarding.

Deutsch: CLI, Ausgabeformate und Datenpfade bleiben kompatibel. npm baut automatisch; der direkte bisherige Node-Aufruf funktioniert nach einem expliziten Build.

#### Scenario: Compiled CLI resolves configuration from different directories
- **WHEN** the CLI is run from project root and backend without an explicit config path
- **THEN** both executions locate the same project-root configuration
- **AND** explicit relative config paths remain caller-relative while cache/output paths remain config-relative

#### Scenario: Existing launch paths execute migrated code
- **WHEN** a developer invokes npm start, the package bin, or the legacy direct launcher after building
- **THEN** the same CLI commands and exit-code behavior are available
- **AND** the Windows helper continues to work independently of its caller's directory

#### Scenario: Direct launcher is used before a build
- **WHEN** `backend/src/cli.js` runs without compiled output
- **THEN** it exits nonzero and explains how to build rather than exposing a missing-module stack trace

#### Scenario: Offline pipeline outputs are compared
- **WHEN** deterministic fixtures and injected providers execute through the migrated pipeline
- **THEN** recipe JSON, ingredient text, Mermaid output and cache identities match the pre-migration baseline

### Requirement: Bilingual migration documentation

Developer documentation SHALL describe the supported Node.js version, installation, build, typecheck, test and CLI invocation workflows in English and German, including the direct launcher's initial-build requirement. An empty frontend package SHALL NOT be expanded into a new application solely for this migration.

Deutsch: Einrichtung und Arbeitsabläufe werden zweisprachig dokumentiert. Das bisher leere Frontend erhält durch diesen Change keine neue Anwendung.

#### Scenario: Developer follows setup documentation
- **WHEN** a developer follows either language's documented setup from a clean checkout
- **THEN** they can install, build, check types, run tests and invoke the CLI without relying on undocumented build output
