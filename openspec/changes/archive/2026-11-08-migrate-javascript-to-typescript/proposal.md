## Why

The JavaScript backend passes recipe graphs, configuration and provider responses between modules without compile-time contracts. Migrating to strict TypeScript will catch incompatible data and dependency usage during development while retaining runtime validation for external input.

Deutsch: Striktes TypeScript soll fehlerhafte Datenübergaben und unpassende Abhängigkeiten früh erkennen. Laufzeitprüfungen für externe Daten bleiben weiterhin notwendig.

## What Changes

- Convert all maintained backend source and test code from JavaScript to TypeScript with strict compiler checks and typed module imports/exports.
- Define concrete contracts for recipe data, CLI/configuration, extraction, caching, LLM messages and injected dependencies; treat untrusted parsed data as `unknown` until validated.
- Add reproducible build, typecheck and test commands; compile to CommonJS JavaScript for Node.js rather than changing the runtime module system.
- Keep CLI commands, exit codes, configuration/path behavior, caches and generated files compatible. Retain the documented `node backend/src/cli.js` entry as a minimal JavaScript launcher for compiled code.
- Document setup, build and verification in English and German. Do not introduce a frontend implementation where none exists.

Deutsch: Backend und Tests werden vollständig typisiert. Build und Typprüfung werden verbindlich, vorhandene CLI-Einstiege und Daten bleiben kompatibel. Einzig die minimale Startdatei darf JavaScript bleiben.

## Capabilities

### New Capabilities

- `typescript-toolchain`: Strictly typed backend source/tests, trustworthy external-data boundaries, reproducible compilation and compatible CLI execution.

### Modified Capabilities

None. Existing recipe ingestion, LLM analysis and graph visualization requirements remain unchanged.

Deutsch: Neue Capability für TypeScript und Werkzeugkette; keine fachlichen Anforderungsänderungen.

## Impact

Touches backend source/tests, package metadata and lockfile, TypeScript configuration, ignored build output, the CLI launcher, and bilingual developer documentation. Adds TypeScript and matching Node.js type definitions as development dependencies; no new runtime dependency is required. The frontend currently contains only package metadata and has no JavaScript application code to migrate.

Coordinate with the open `restructure-backend-responsibilities` change: prefer implementing that structural change first, then type its resulting modules; do not duplicate or undo its planned responsibility boundaries. Existing unrelated working-tree changes must be preserved. Planning does not modify implementation symbols; GitNexus impact analysis is required before their later migration.

Deutsch: Betroffen sind Backend, Tests und Entwicklungswerkzeuge. Der offene Architekturumbau soll möglichst zuerst umgesetzt werden; fremde Änderungen bleiben erhalten. Fachliche Ausgaben und persistierte Daten werden nicht migriert.
