## ADDED Requirements

### Requirement: CLI delegates application workflows
The backend SHALL separate terminal argument handling, reporting, and exit mapping from recipe-analysis and URL-discovery orchestration. Workflows SHALL be callable with explicit inputs and injected external dependencies without parsing process arguments or writing to the console.

Deutsch: CLI-Bedienung und Anwendungsabläufe werden getrennt; Abläufe sind ohne Terminalaufruf und mit eingesetzten Abhängigkeiten testbar.

#### Scenario: Analysis runs without a terminal
- **WHEN** an analysis workflow receives resolved inputs and fixture-backed external dependencies
- **THEN** it executes the existing ordered processing pipeline and exposes structured results or progress without directly writing terminal messages

#### Scenario: Existing CLI entry is used
- **WHEN** the application is invoked through its existing `backend/src/cli.js` entry or package start command
- **THEN** the command delegates to the workflow while preserving command options, reporting, exit behavior, and configuration path semantics

### Requirement: Recipe analysis does not own LLM infrastructure
Recipe analysis SHALL own recipe-specific prompts, response parsing, and recipe validation. Provider transport and optional response-cache composition SHALL be owned outside recipe analysis and supplied through a completion capability.

Deutsch: Rezeptwissen bleibt in der Analyse; Provider-Protokoll und Antwortcache liegen außerhalb.

#### Scenario: Completion implementation is substituted
- **WHEN** recipe analysis receives a completion client returning a fixed valid response
- **THEN** it builds the recipe messages and returns validated recipe data without creating a provider client or accessing response-cache storage

#### Scenario: Cached completion behavior is preserved
- **WHEN** the same provider configuration and messages are submitted with response caching enabled
- **THEN** the composed completion client preserves the existing cache identity and raw-response reuse behavior

### Requirement: Presentation preparation derives a separate view
The backend SHALL prepare a deterministic presentation model from validated recipe data and view options without mutating the recipe. Presentation classifications and view-derived edges SHALL remain outside the recipe schema and serialized recipe output. The model SHALL serve current Mermaid needs without containing Mermaid syntax, escaped identifiers, colors, shapes, or renderer class names.

Deutsch: Eine getrennte, deterministische Ansicht enthält Darstellungsinterpretationen, jedoch keine Mermaid-Syntax. Rezeptdaten und Rezeptdatei bleiben davon unberührt.

#### Scenario: Process presentation is classified
- **WHEN** recipe nodes are prepared for display
- **THEN** the resulting model contains semantic cues matching the existing classification rules and precedence while the input recipe remains unchanged

#### Scenario: Intermediate states are hidden
- **WHEN** preparation is requested with intermediate states hidden
- **THEN** the view omits those nodes and derives surrounding connections using the existing projection behavior without removing nodes or changing dependencies in the recipe

#### Scenario: Multiple views use the same recipe
- **WHEN** shown-state and hidden-state views are repeatedly prepared from the same recipe
- **THEN** each view is deterministic and independent of the previous preparation and the recipe remains deeply unchanged

### Requirement: Mermaid rendering consumes prepared presentation
The Mermaid renderer SHALL consume prepared presentation data and own only visual mapping, label formatting, identifier/text escaping, and Mermaid serialization. It SHALL NOT classify recipe processes or decide graph visibility and connectivity.

Deutsch: Der Renderer übersetzt eine vorbereitete Ansicht in Mermaid; Klassifikation und Graphprojektion erfolgen vorher.

#### Scenario: Prepared cues are rendered
- **WHEN** a prepared graph with semantic display cues is passed to the Mermaid renderer
- **THEN** it emits the established styles, shapes, labels, and connections without repeating recipe keyword classification or intermediate-state projection

### Requirement: Responsibility boundaries preserve existing external behavior
The restructuring SHALL preserve existing CLI commands, configuration semantics, recipe JSON shape, ingredient text, filenames, cache formats/keys, and Mermaid output for fixed characterization fixtures. Output naming SHALL NOT depend on the page-cache module. Source ingestion, recipe validation, discovery, presentation preparation, and serialization SHALL remain separately identifiable responsibilities without adding a generic architecture framework.

Deutsch: Bestehende Schnittstellen und Referenzausgaben bleiben stabil. Dateinamen hängen nicht vom Seiten-Cache-Modul ab; Verantwortlichkeiten bleiben konkret und getrennt.

#### Scenario: Characterization fixture is processed after restructuring
- **WHEN** fixed HTML, valid analysis response, configuration, and view options are processed after the refactor
- **THEN** recipe JSON, ingredient text, Mermaid text, output names, and cache identities match the recorded baseline

#### Scenario: Output filenames are calculated independently
- **WHEN** an output slug is calculated for a recipe
- **THEN** the established slug is produced without importing page-cache behavior
