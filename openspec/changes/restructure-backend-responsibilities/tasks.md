## 1. Baseline and impact review / Ausgangsverhalten und Auswirkungen

- [ ] 1.1 Review working-tree state and `move-config-to-project-root`; establish configuration/entry-path behavior to preserve without overwriting unrelated work. / Arbeitsstand und Config-Change prüfen; zu erhaltende Pfadsemantik festhalten.
- [ ] 1.2 Run and report GitNexus upstream impact analysis before each symbol edit throughout implementation; warn about HIGH/CRITICAL risk before proceeding. / Vor jedem Symboleingriff Auswirkungen analysieren und melden.
- [ ] 1.3 Run the existing backend suite and add fixed characterization fixtures for JSON, ingredient text, Mermaid output, slugs, cache identities, and CLI success/failure behavior. / Bestehende Tests ausführen und Referenzausgaben absichern.

## 2. Responsibility-oriented modules / Verantwortungsorientierte Module

- [ ] 2.1 Group configuration, ingestion, discovery, recipe validation, analysis, LLM, and output modules into the designed responsibility areas; update internal imports and matching test locations without changing behavior. / Module nach Verantwortlichkeit gruppieren und interne Verweise anpassen.
- [ ] 2.2 Keep `backend/src/cli.js` as the thin executable/export entry and verify package startup, direct invocation, launcher references, and root/backend configuration resolution. / Dünnen bisherigen CLI-Einstieg und Pfadauflösung absichern.
- [ ] 2.3 Remove output naming's dependency on the page-cache module using an explicitly scoped identity/hash helper; verify exact existing keys and filenames. / Hash-Kopplung lösen, Schlüssel und Dateinamen unverändert prüfen.

## 3. Workflows and analysis composition / Abläufe und Analyse-Zusammensetzung

- [ ] 3.1 Extract the ordered analysis workflow with resolved inputs and injected dependencies; keep reporting and exit mapping in the CLI and add console-independent workflow tests. / Analyseablauf aus der CLI lösen und ohne Konsole testen.
- [ ] 3.2 Separate discovery orchestration and URL persistence from Chefkoch candidate acquisition/parsing/filtering while preserving filters, ordering, deduplication, and summaries. / Entdeckung, Speicherung und CLI-Rückmeldung voneinander trennen.
- [ ] 3.3 Separate recipe-specific prompt/response handling from provider-client creation and response-cache composition; preserve prompt bytes, cache keys, and raw-response reuse. / Rezeptanalyse von LLM-Technik und Cache-Zusammensetzung trennen.
- [ ] 3.4 Test analysis with an injected completion capability and verify cached/uncached provider composition and existing CLI failure behavior. / Analyse mit eingesetztem Client sowie Cache- und Fehlerverhalten prüfen.

## 4. Presentation preparation and rendering / Darstellungsaufbereitung und Renderer

- [ ] 4.1 Extract deterministic preparation of a separate presentation model with existing classification rules, precedence, intermediate-state visibility, and edge projection. / Eigenständige Ansicht mit bisherigen Regeln und Graphprojektion erzeugen.
- [ ] 4.2 Restrict Mermaid rendering to cue-to-style/shape mapping, label formatting, escaping, and serialization; feed it prepared presentation data through the workflow/output composition. / Mermaid auf Formatierung und Serialisierung vorbereiteter Ansichten begrenzen.
- [ ] 4.3 Add preparation tests for classification, shown/hidden states, edge projection, repeated independent views, deep non-mutation, and absence of Mermaid-specific model values. / Aufbereitung, Unveränderlichkeit und Syntaxunabhängigkeit testen.
- [ ] 4.4 Add renderer tests using prepared models and integration tests comparing existing exact Mermaid fixtures; verify recipe JSON never contains presentation metadata or projected edges. / Renderer isoliert und Gesamtausgabe gegen Referenzen prüfen; Rezeptdaten sauber halten.

## 5. Verification and documentation / Prüfung und Dokumentation

- [ ] 5.1 Document module responsibilities, data flow, stable entry commands, and recipe-versus-presentation boundaries in English and German. / Struktur und Grenzen zweisprachig dokumentieren.
- [ ] 5.2 Review import boundaries and add focused automated checks where practical; confirm no generic framework, frontend implementation, new runtime dependency, or incidental heuristic fix was introduced. / Grenzen prüfen und unnötige Abstraktionen oder Nebenänderungen ausschließen.
- [ ] 5.3 Run the complete backend suite and entry/config smoke tests; compare baseline outputs, cache identities, and filenames, and run strict OpenSpec validation. / Gesamttests, Pfadprüfungen und strikte Spec-Validierung ausführen.
- [ ] 5.4 Review the scoped diff and run GitNexus change detection before any commit; base any authorized commit message on `restructure-backend-responsibilities`. / Diff prüfen; vor einem Commit Änderungsanalyse ausführen und Change-Namen verwenden.
