## ADDED Requirements

### Requirement: CLI writes structured recipe output
The system SHALL write the analyzed recipe as structured output after a successful URL analysis.

#### Scenario: Recipe analysis succeeds
- **WHEN** the CLI completes analysis for a recipe URL
- **THEN** the system writes structured output containing recipe metadata, ingredients, nodes, edges, and the human-readable ingredient list

### Requirement: CLI generates Mermaid graph output
The system SHALL generate Mermaid flowchart text from the analyzed recipe graph.

#### Scenario: Mermaid output is generated
- **WHEN** a recipe analysis contains graph nodes and edges
- **THEN** the system writes Mermaid flowchart text representing the recipe flow

#### Scenario: Node labels include useful cooking details
- **WHEN** a node has timing, temperature, action, or amount details
- **THEN** the Mermaid label includes the details that help a person follow the recipe

### Requirement: Visualization can hide intermediate states
The system SHALL support rendering the recipe graph with intermediate state nodes hidden.

#### Scenario: Intermediate states are shown
- **WHEN** graph rendering is configured to include intermediate states
- **THEN** the Mermaid output contains intermediate state nodes from the analysis

#### Scenario: Intermediate states are hidden
- **WHEN** graph rendering is configured to hide intermediate states
- **THEN** the Mermaid output omits intermediate state nodes while preserving readable flow between surrounding nodes where possible

### Requirement: Visualization preserves ADHD-friendly execution cues
The system SHALL render graph labels and ingredient output in a way that emphasizes actionable recipe execution.

#### Scenario: Step has a duration
- **WHEN** a processing node includes a duration
- **THEN** the rendered output includes the duration near the corresponding step

#### Scenario: Step has a temperature
- **WHEN** a processing node includes a temperature
- **THEN** the rendered output includes the temperature near the corresponding step

#### Scenario: Recipe has ordered dependencies
- **WHEN** graph edges indicate step order or dependencies
- **THEN** the rendered output makes the order or dependency visible

### Requirement: Output files are deterministic for cached inputs
The system SHALL produce deterministic output for the same cached input and same LLM analysis response.

#### Scenario: Cached input and analysis response are unchanged
- **WHEN** the same cached HTML and same valid analysis response are rendered multiple times
- **THEN** the structured output and Mermaid output are stable enough to compare in tests
