## Context

The backend currently has 18 flat source files. `cli.js` composes and executes the full pipeline, `recipe-analyzer.js` combines prompts with client/cache setup, `mermaid.js` combines interpretation and graph projection with rendering, and `output-writer.js` imports a hash from the page cache. Existing unit and CLI tests provide a starting safety net.

Deutsch: Die flache Struktur verdeckt bereits vorhandene Verantwortlichkeiten. Besonders CLI, Analyse, Mermaid-Ausgabe und Cache-Nutzung verbinden Aufgaben, die unabhängig verständlich und testbar sein sollten.

## Goals / Non-Goals

**Goals:** Responsibility-oriented navigation, a reusable processing workflow, independent LLM transport, immutable recipe-to-presentation preparation, and behavior-preserving migration with bilingual documentation.

**Ziele:** Fachliche Orientierung, unabhängige Verarbeitungsschritte und klare Trennung von Rezeptinhalt, Darstellungsinterpretation und Ausgabeformat.

**Non-Goals:** New product features, frontend changes, a universal view schema, classes/interfaces for their own sake, dependency-injection frameworks, provider redesign, heuristic corrections, recipe schema changes, or cache migrations. Existing analysis-derived recipe dependencies and intermediate states remain; redefining evidence/provenance is separate work.

**Nicht-Ziele:** Keine neue Architekturplattform, kein vorweggenommenes Frontend-Modell, keine beiläufige Korrektur der Heuristiken und keine Neudefinition dessen, was die Analyse aus Quellen ableiten darf.

## Decisions

### 1. Group by responsibility, not generic technical layers

Use the following target areas, with ordinary CommonJS functions and explicit imports:

| Area | Owns | Must not own |
| --- | --- | --- |
| `cli/` | Arguments, help, startup composition, reporting, exit mapping | Recipe processing loop or parsing rules |
| `config/` | Config/environment loading and path resolution | Recipe or rendering logic |
| `workflows/` | Analysis and discovery orchestration | Console output, provider protocol, Mermaid syntax |
| `ingestion/` | URL-file IO, page fetching/caching, source extraction | LLM analysis or presentation |
| `discovery/` | Chefkoch candidate acquisition/parsing/filtering | CLI reporting or URL-file persistence |
| `analysis/` | Recipe prompts, response parsing, validated analysis | Provider HTTP details, cache storage |
| `recipe/` | Recipe schema and validation | Presentation classifications or external IO |
| `llm/` | Client factory, provider transport, response-cache composition | Recipe prompts and recipe validation |
| `presentation/` | Semantic display cues and visible-graph projection | File IO, colors, shapes, Mermaid syntax |
| `output/` | Ingredient formatting, serialization, filenames, writing | Recipe analysis or display classification |

Keep `errors.js` accessible across areas initially; renaming `CliError` throughout the application is not required for this structural change. A small, explicitly named shared identity/hash utility is allowed to remove output-to-page-cache coupling; preserve the exact existing algorithm rather than creating a general utilities bucket.

Alternatives: Folder-only moves would preserve the responsibility problems. Controller/service/repository layers and a generic cache subsystem add machinery without matching the current pipeline. Page and LLM caches stay with their respective owners.

Deutsch: Bereiche erhalten klare Aufgaben statt generischer Sammelordner. Kleine Funktionen bleiben ausreichend; technische Gemeinsamkeiten rechtfertigen nicht automatisch ein gemeinsames Subsystem.

### 2. Make the workflow explicit and the CLI thin

Extract an analysis workflow that accepts resolved inputs/dependencies, processes URLs in the existing order, and returns structured results or emits a simple injected progress callback. The CLI owns converting those results/events into user messages. Keep existing failure/stop behavior and dependency injection for tests. Discovery obtains candidates; its workflow persists them via ingestion's URL-file API and returns the existing summary.

Retain `backend/src/cli.js` as a thin executable/export shim so package scripts, direct node calls, `go.cmd`, and tests using `main` remain usable. Do not retain forwarding modules for every old internal source path: update internal imports/tests together. Preserve the configuration path semantics from whichever config change is implemented; relocating modules must not silently change root discovery or explicit-path resolution.

Alternative: Leaving orchestration in the CLI is simpler to move but keeps application behavior inseparable from terminal handling. No workflow engine or event bus is needed.

Deutsch: Ein einfacher Ablauf übernimmt die Verarbeitung, die CLI nur Bedienung und Meldungen. Der bisherige Startpfad bleibt über eine dünne Einstiegsdatei erhalten; interne Modulpfade dürfen sich ändern.

### 3. Keep recipe-specific analysis separate from LLM mechanics

The CLI composition/configuration boundary creates the active LLM client, including an optional response-cache wrapper. Analysis receives the completion capability and extracted content, builds recipe-specific messages, parses the result, and validates it with the recipe schema. Preserve cache-key inputs, provider defaults, message bytes, request behavior, and raw-response caching semantics.

Alternative: Passing all provider/cache configuration through analysis would keep it coupled to infrastructure. A plain object with the existing `complete(messages)` capability is sufficient; no interface framework is necessary.

Deutsch: Rezeptwissen und Prompt bleiben bei der Analyse. Provider-Protokoll und Antwortcache werden außerhalb zusammengesetzt; Analyse benötigt nur die Completion-Funktion.

### 4. Derive a distinct presentation model without enriching recipe facts

```text
source -> analysis -> validated recipe -> recipe JSON / ingredient list
                            |
                            v
                  presentation preparation
                  classification + projection
                            |
                            v
                    presentation model
                            |
                            v
                     Mermaid renderer
```

Preparation is a deterministic function of recipe data and view options. Return new node/edge records with display metadata, without changing the input or sharing mutable nested data that preparation/rendering edits. Preserve original recipe IDs and relevant labels/timing/temperature. Semantic cues such as hot/passive classifications are presentation metadata, not factual recipe fields. Cues must preserve existing precedence and combinations needed by the renderer; do not force mutually exclusive categories that change behavior.

Intermediate-state visibility and the existing edge-bridging algorithm belong here. The recipe retains all its original nodes and edges; projected edges are view-derived, not new recipe dependencies. The renderer only maps prepared cues to styles/shapes, formats labels, escapes identifiers/text, and emits Mermaid syntax. Ingredient text remains output formatting, not graph preparation.

The initial model is deliberately sized to current Mermaid needs, without Mermaid class names, colors, shapes, escaped IDs, or syntax. No generalized renderer API, alternate backend, or frontend integration is required. Existing keyword and temperature heuristics are moved unchanged, even where they are imperfect.

Alternative: Mutating recipe nodes with hot/cold flags would leak interpretation into structured output. Building a universal UI model now would introduce speculative complexity.

Deutsch: Die Aufbereitung erzeugt eine getrennte Ansicht, verändert aber keine Rezeptdaten. Heuristische Merkmale und überbrückte Kanten gehören ausschließlich zu dieser Ansicht. Farben, Formen und Syntax bleiben beim Renderer; das Modell wird nur für den heutigen Bedarf ausgelegt.

### 5. Characterize behavior before changing module boundaries

Capture deterministic fixture-based recipe JSON, ingredient text, Mermaid text, output slugs, cache keys, and CLI outcomes before extraction. Test preparation separately for classification, visible-graph projection, determinism, and non-mutation, including repeated views of the same recipe. Renderer tests consume prepared models and do not rely on classification heuristics. Keep integration coverage for the complete recipe-to-Mermaid path and injected offline workflow execution.

Developer comments and new logs use English per repository rules. Existing localized CLI messages remain compatibility output; wholesale translation is outside this change. Document the structure and responsibility rules in English and German.

Deutsch: Vor dem Verschieben Referenzergebnisse sichern. Aufbereitung, Renderer und Gesamtablauf getrennt prüfen; bestehende Meldungen nicht nebenbei übersetzen.

## Risks / Trade-offs

- [Import moves break entry points or tests] -> Retain the thin entry shim, update imports in small batches, run CLI smoke tests and the full backend suite.
- [Configuration derives roots from relocated files] -> Coordinate with `move-config-to-project-root`; test default and explicit paths from project root and backend without exposing local secrets.
- [Presentation extraction alters output subtly] -> Compare exact fixture outputs, style precedence, ordering, escaping, and existing edge projection. Treat discovered bugs as separate changes.
- [View metadata leaks into recipe JSON] -> Keep the original analysis as the writer's data source and assert absence of presentation fields in serialized recipes.
- [Too many tiny folders or abstractions] -> Use one or a few concrete modules per responsibility; split only at the agreed boundaries.
- [Structural rules drift] -> Review imports and use focused boundary tests where practical, without adding an architecture framework.

Deutsch: Hauptrisiken sind geänderte Pfade, subtile Ausgabeabweichungen und versehentliche Anreicherung der Rezeptdatei. Kleine Schritte, Referenztests und klare Datenflüsse sichern diese Grenzen ab.

## Migration Plan

1. Review current working-tree/config-change state and run required GitNexus impact analysis before each symbol edit; report HIGH/CRITICAL risk before proceeding.
2. Establish baseline tests and outputs; group modules and preserve the CLI entry path.
3. Extract workflows and LLM composition, then presentation preparation and pure rendering; remove accidental cache/hash coupling.
4. Update mirrored test organization and bilingual documentation; run all baseline, unit, and integration checks plus strict OpenSpec validation.
5. Review the scoped diff. Run GitNexus change detection before any later commit; use this change name as the commit-message basis.

Rollback is code-only: reverse only this change's implementation edits while preserving unrelated work. No persisted data or configuration migration is introduced by this change.

Deutsch: Erst Ausgangsverhalten sichern, dann schrittweise trennen und testen. Eine Rücknahme betrifft nur diesen Umbau, nicht fremde Änderungen oder lokale Daten.

## Open Questions

None blocking planning. Exact helper filenames and progress-result shapes can follow existing code style during implementation without changing these boundaries.

Deutsch: Keine blockierenden Fragen; konkrete Hilfsdateinamen und Rückgabeformen folgen bei der Umsetzung dem vorhandenen Stil.
