## Why

The backend has small modules, but its flat layout hides responsibilities and mixes command handling, workflow orchestration, recipe analysis, presentation interpretation, and serialization. Explicit boundaries will make the code easier to navigate and change without introducing an architectural framework.

Deutsch: Kleine Module sind bereits vorhanden, ihre Verantwortlichkeiten sind jedoch kaum sichtbar und teilweise vermischt. Klare Grenzen sollen Orientierung und Wartbarkeit verbessern, ohne Architekturzeremonie einzuführen.

## What Changes

- Organize backend modules by responsibility: CLI, configuration, workflows, ingestion, discovery, analysis, recipe model, LLM integration, presentation preparation, and output.
- Extract processing orchestration from the CLI; keep argument handling, reporting, and exit-code mapping at the CLI boundary.
- Separate recipe-specific prompts and analysis from provider transport and response caching.
- Derive a separate, syntax-independent presentation model without modifying the recipe. Move process classification and intermediate-state visibility/edge projection into presentation preparation; keep colors, shapes, escaping, and Mermaid syntax in the renderer.
- Remove incidental cross-responsibility coupling, including output naming depending on the page-cache module, while preserving existing hashes and filenames.
- Keep existing commands, configuration semantics, cache formats, recipe JSON shape, and generated outputs stable through characterization tests. No new framework, generalized rendering platform, or frontend implementation.

Deutsch: Fachlich benannte Bereiche, schlanke CLI, separater Ablauf, getrennte LLM-Technik und Rezeptanalyse sowie eine eigenständige Darstellungsaufbereitung. Rezeptdaten bleiben unverändert; bestehendes Verhalten wird abgesichert statt nebenbei korrigiert.

## Capabilities

### New Capabilities

- `backend-responsibility-boundaries`: Internal responsibility contracts, non-mutating presentation preparation, and behavior-preserving integration boundaries. / Interne Verantwortungsgrenzen, nicht-mutierende Darstellungsaufbereitung und verhaltenserhaltende Integration.

### Modified Capabilities

None. Existing ingestion, analysis, and visualization requirements remain unchanged; this change adds internal structural contracts rather than changing their user-facing behavior.

Deutsch: Keine. Bestehende fachliche Anforderungen bleiben bestehen; ergänzt werden interne Strukturverträge.

## Impact

- Affects `backend/src/`, backend tests, package entry wiring if needed, and bilingual architecture/usage documentation. Existing launch paths should remain usable through a thin CLI entry file.
- No new runtime dependencies, public CLI changes, recipe schema migrations, or cache migrations.
- Coordinates with `move-config-to-project-root` (now archived, with implementation changes present in the working tree): preserve its resolved configuration behavior, launch commands, and module-location assumptions when relocating implementation files.
- Before implementation, perform required symbol impact analysis; do not modify unrelated user work or historical archived artifacts.

Deutsch: Betroffen sind Backend-Module, Tests und zweisprachige Dokumentation. Keine neuen Laufzeitabhängigkeiten oder Datenmigrationen. Die Überschneidung mit dem Config-Change muss bei der Umsetzung explizit berücksichtigt werden.
