## ADDED Requirements

### Requirement: Optional icons supplement ingredient and process nodes
When icons are enabled and available, the system SHALL supplement ingredient and process nodes with at most one appropriate illustration per node. Labels, timing, temperature, quantities, graph connectivity, visibility settings, and existing execution cues SHALL remain available. Intermediate-state nodes SHALL remain without icons in this version. Icon enrichment SHALL NOT mutate validated recipe facts or add image/provenance fields to recipe JSON or ingredient text. With icons off, existing text-only serialization SHALL remain unchanged.

#### Scenario: Ingredient and action have assets
- **WHEN** egg and baking nodes resolve to usable local illustrations
- **THEN** their graph nodes include egg and oven images respectively while retaining their full text and execution details

#### Scenario: Icon is unavailable
- **WHEN** a node has no usable icon after acquisition
- **THEN** it renders with its original meaningful text and execution cues without blocking recipe output

#### Scenario: Multiple views use one recipe
- **WHEN** icon-enriched and icon-free presentations are created from the same recipe
- **THEN** recipe JSON and ingredient text remain unaffected by icons and graph edges/visibility continue to follow the chosen view settings

### Requirement: Icon graph images are portable and consistent
The system SHALL render the same enriched Mermaid source into SVG and PNG with visible illustrations and preserved text. Finished graph images SHALL NOT require the local library, an external image server, or image-generation credentials to display. Standalone SVG rendering SHALL support the embedded illustrations without relying solely on browser-specific HTML foreign objects. Existing graph-renderer failure reporting and image-pair cleanup SHALL remain in force.

#### Scenario: Outputs are moved away from the library
- **WHEN** generated SVG and PNG are copied elsewhere and the asset library is inaccessible
- **THEN** both formats still visibly contain the expected icons and labels without network access

#### Scenario: Graph renderer fails after successful acquisition
- **WHEN** an icon is available but SVG or PNG graph rendering fails
- **THEN** the existing actionable nonzero failure and cleanup of both final graph-image destinations still apply

## MODIFIED Requirements

### Requirement: Output files are deterministic for cached inputs
The system SHALL produce deterministic structured output and ingredient text for the same cached input and same LLM analysis response. Mermaid output SHALL be deterministic for those inputs together with fixed view/icon settings, motif-resolution rules, and selected local image bytes. Generation or replacement of an icon SHALL be treated as a changed asset input, not as a guarantee of identical generated artwork. Provenance timestamps SHALL NOT introduce unrelated variability into Mermaid output.

#### Scenario: Cached input and analysis response are unchanged
- **WHEN** the same cached HTML and same valid analysis response are rendered multiple times with fixed view/icon settings and asset inputs
- **THEN** the structured output and Mermaid output are stable enough to compare in tests

#### Scenario: An icon is newly generated or replaced
- **WHEN** selected illustration bytes change while recipe facts stay the same
- **THEN** graph illustrations can change while recipe JSON and ingredient text remain stable
