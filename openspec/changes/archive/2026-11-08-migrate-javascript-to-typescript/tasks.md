## 1. Baseline and coordination / Ausgangsstand und Abstimmung

- [x] 1.1 Review the current working tree and `restructure-backend-responsibilities` status; prefer refactor-first sequencing and record actual module paths without overwriting unrelated edits. / Projektstand und Reihenfolge abgleichen.
- [x] 1.2 Confirm the supported Node.js baseline, record the existing test result and capture deterministic offline JSON/text/Mermaid output and cache identities. / Node-Version und Referenzverhalten sichern.
- [ ] 1.3 Before each subsequent symbol edit, run GitNexus upstream impact analysis and report direct callers, affected processes and risk; warn before HIGH/CRITICAL edits. / Auswirkungen vor jedem Symboleingriff prüfen und melden.

## 2. Compiler and commands / Compiler und Befehle

- [x] 2.1 Add TypeScript and matching Node.js typings as dev dependencies, update the lockfile and declare/document the selected Node.js baseline. / Abhängigkeiten und Laufzeitbasis festlegen.
- [x] 2.2 Add shared strict, production, test-emit and no-emit configurations with `noUncheckedIndexedAccess`, `noEmitOnError` and `allowJs: false`; separate production, runtime-test and negative-contract inputs. / Strikte Konfigurationen und Eingabebereiche trennen.
- [x] 2.3 Implement owned-output cleanup, `build`, `typecheck` and compiled `test` scripts; ignore `dist/` and `.test-dist/` without changing unrelated ignore rules. / Saubere Build- und Prüfbefehle ergänzen.

## 3. Contracts and source migration / Typen und Quellcode

- [x] 3.1 Define recipe metadata, ingredients, node/edge unions and analysis contracts matching existing optional/nullable fields; type recipe validation from `unknown` to validated data. / Rezeptmodell und Validierung typisieren.
- [x] 3.2 Migrate errors, CLI argument parsing, config and environment loading to typed imports/exports; distinguish raw configuration, normalized configuration and command variants. / Fehler, Argumente und Konfiguration umstellen.
- [x] 3.3 Migrate URL IO, extraction, discovery and page fetching/caching with typed options/results, validated external data and narrow HTTP dependency contracts. / Einlesen, Extraktion und Seiten-Cache umstellen.
- [x] 3.4 Migrate LLM transport, response caching and recipe analysis with typed messages/completion dependencies and unknown response boundaries, preserving provider and fallback behavior. / LLM und Analyse umstellen.
- [x] 3.5 Migrate graph preparation/rendering and output writing, preserving presentation boundaries introduced by the architecture change and exact output formats. / Darstellung und Ausgabe umstellen.
- [x] 3.6 Migrate orchestration and CLI composition; remove remaining maintained JavaScript implementation modules except the explicit legacy launcher and review for forbidden type escapes. / Ablauf und CLI vollständig typisieren.

## 4. Runtime entry points / Startpfade

- [x] 4.1 Wire `dist/cli.js` as package main/bin, preserve executable startup behavior, and add prestart/prepack compilation; retain a typed entry facade if required by the structural refactor. / Kompilierte Paketeinstiege einrichten.
- [x] 4.2 Replace `backend/src/cli.js` business logic with the minimal launcher/export adapter and an actionable missing-build error; preserve exit codes and `go.cmd` behavior. / Kompatiblen Startadapter erstellen.
- [x] 4.3 Audit compiled and test-output paths for root config discovery, explicit config resolution, environment loading, fixtures and subprocesses; keep secrets and local data out of emitted output. / Pfade und Config-Auflösung prüfen.

## 5. Typed tests and compatibility / Typisierte Tests und Kompatibilität

- [x] 5.1 Convert every existing runtime test and shared fixture helper to TypeScript, with typed lightweight doubles and emitted subprocess paths; retain all existing coverage. / Bestehende Tests vollständig umstellen.
- [x] 5.2 Add dedicated no-emit negative contract fixtures for invalid node types, provider values and dependency signatures using targeted `@ts-expect-error` directives. / Negative Typprüfungen ergänzen.
- [x] 5.3 Add/retain runtime boundary tests for malformed config/provider/cache data, invalid graph references, accepted nullable values and current error/fallback behavior. / Externe Datengrenzen und Nullwerte testen.
- [x] 5.4 Test compiled CLI, legacy launcher with/without output, npm start freshness, package bin, Windows helper, exit forwarding and default/explicit config paths from root/backend. / Alle relevanten Start- und Pfadvarianten prüfen.
- [x] 5.5 Verify deterministic offline outputs and cache identities against the baseline; verify rebuilds remove stale emitted modules without touching source or user data. / Referenzausgaben und saubere Neubauten vergleichen.

## 6. Documentation and completion / Dokumentation und Abschluss

- [x] 6.1 Update English and German setup/developer documentation for Node support, install/build/typecheck/tests, direct-launcher build prerequisite and the compiled module layout; leave the empty frontend untouched. / Zweisprachige Anleitung aktualisieren.
- [x] 6.2 Verify clean install, no-emit typecheck, production build and complete runtime suite; inspect packaged files and smoke-test its compiled entry without a TypeScript loader. / Installation, Paket und gesamte Prüfungen ausführen.
- [x] 6.3 Run strict OpenSpec validation, review the scoped diff and verify no unintended schema/config/cache/output changes; before any commit run GitNexus change detection and use `migrate-javascript-to-typescript` as the commit-message basis. / Change und Änderungsumfang abschließend validieren.
