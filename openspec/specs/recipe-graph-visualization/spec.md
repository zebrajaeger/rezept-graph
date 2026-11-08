# recipe-graph-visualization Specification

## Purpose
TBD - created by archiving change add-recipe-url-graph-cli. Update Purpose after archive.
## Requirements
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
The system SHALL produce deterministic structured output and ingredient text for the same cached input and same LLM analysis response. Mermaid output SHALL be deterministic for those inputs together with fixed view/icon settings, motif-resolution rules, and selected local image bytes. Generation or replacement of an icon SHALL be treated as a changed asset input, not as a guarantee of identical generated artwork. Provenance timestamps SHALL NOT introduce unrelated variability into Mermaid output.

#### Scenario: Cached input and analysis response are unchanged
- **WHEN** the same cached HTML and same valid analysis response are rendered multiple times with fixed view/icon settings and asset inputs
- **THEN** the structured output and Mermaid output are stable enough to compare in tests

#### Scenario: An icon is newly generated or replaced
- **WHEN** selected illustration bytes change while recipe facts stay the same
- **THEN** graph illustrations can change while recipe JSON and ingredient text remain stable

### Requirement: CLI automatically renders both graph image formats
The system SHALL generate SVG and PNG images automatically during the standard recipe analysis command, alongside structured JSON, ingredient text, and Mermaid source. All five artifacts SHALL use the same deterministic recipe stem and configured output directory. Both images SHALL represent the same current Mermaid source and use identical layout, theme, background, and scale settings.

#### Scenario: Standard analysis completes
- **WHEN** the CLI successfully analyzes a recipe and renders its graph
- **THEN** the output directory contains nonempty `.recipe.json`, `.ingredients.txt`, `.mmd`, `.svg`, and `.png` files sharing the recipe stem
- **AND** the CLI reports all five paths only after both images are generated successfully

#### Scenario: Output directory is overridden
- **WHEN** the user supplies `--output-dir` to the analysis command
- **THEN** both graph images are placed alongside the three source artifacts in that directory

#### Scenario: Presentation settings change
- **WHEN** intermediate states are shown or hidden for a recipe
- **THEN** both images reflect the corresponding current Mermaid graph, including matching nodes, edges, labels, and execution cues

#### Scenario: Analysis is repeated
- **WHEN** an existing recipe is analyzed again with updated graph content
- **THEN** both image files are regenerated from the new Mermaid source rather than retaining images from a previous run

### Requirement: Image rendering failure is explicit and leaves no misleading images
The system SHALL await rendering before declaring a recipe successful. On renderer, timeout, output-validation, or publication failure, it SHALL report an actionable error and a nonzero CLI exit status, retain available current text artifacts, and leave neither SVG nor PNG at the failed recipe's final destinations. Cleanup SHALL be limited to that recipe's image destinations and its rendering staging files.

#### Scenario: Second image render fails with existing outputs
- **WHEN** old images exist and one new image renders but the other fails
- **THEN** both final image destinations and temporary images are absent after failure
- **AND** current JSON, ingredients, and Mermaid remain available
- **AND** no recipe success is reported and subsequent URLs are not processed
- **AND** unrelated recipe files remain untouched

#### Scenario: Publishing an image fails
- **WHEN** both renders succeed but publishing either final image fails
- **THEN** neither final image remains and rendering staging files are cleaned up
- **AND** the CLI reports the failure instead of success

#### Scenario: Browser or renderer is unavailable
- **WHEN** the installed renderer or required headless browser cannot be started
- **THEN** the CLI reports the missing prerequisite with setup guidance without downloading packages or reporting recipe success

#### Scenario: Renderer exceeds its time budget
- **WHEN** a render invocation exceeds 60 seconds
- **THEN** that invocation is terminated, the image pair is cleaned up, and the CLI reports a rendering timeout

### Requirement: Rendering uses local runtime prerequisites safely
The system SHALL use the installed Mermaid renderer as a runtime dependency and invoke it without shell interpolation or implicit package downloads. Renderer arguments SHALL handle file paths containing spaces and special characters as data.

#### Scenario: Project or output path contains spaces
- **WHEN** rendering runs from a project or output directory containing spaces or shell-special characters
- **THEN** both images are written to the intended paths without executing any path text as a command

#### Scenario: Local graph is rendered without recipe network access
- **WHEN** a deterministic local graph fixture is passed to the real installed renderer
- **THEN** it produces valid SVG markup and a PNG with a valid signature and positive dimensions without contacting a recipe site or LLM

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

### Requirement: Embedded icons respect renderer resource limits
The system SHALL keep original library images unchanged and produce bounded aspect-preserving PNG display derivatives for approximately 48-pixel illustration display. Derivatives SHALL be decoded and produced offline from bounded PNG inputs. The enriched Mermaid source SHALL stay within a documented total source budget without globally increasing Mermaid limits. If an icon cannot fit, its node SHALL retain full text without an icon. Selection SHALL be deterministic for fixed ordered inputs and derivative bytes.

#### Scenario: Original image exceeds the source budget
- **WHEN** a valid generated original is too large for direct embedding
- **THEN** a small derivative is used while the original bytes remain unchanged

#### Scenario: Multiple icons exhaust the total budget
- **WHEN** additional icon data would exceed the total source budget
- **THEN** remaining nodes keep text-only labels and the source remains within the budget

#### Scenario: Renderer exits successfully with an error diagram
- **WHEN** Mermaid returns exit code zero but produces a recognized error diagram, including the maximum-text-size card
- **THEN** the output is rejected as a graph-rendering failure rather than published as a successful recipe image

### Requirement: Display derivatives use a disposable local cache
The system SHALL persist bounded validated display PNGs in a configurable cache directory (default `backend/.cache/recipe-icons`, relative to the configuration file). Keys SHALL include original SHA-256 and versioned resize rules/runtime identity. Unchanged inputs SHALL reuse the derivative across nodes and runs. Deleted or corrupt entries SHALL be rebuilt offline without AI calls. Cache write failures SHALL NOT prevent use of a locally produced derivative. Original bytes and metadata SHALL remain unchanged. Default cache and demand paths SHALL be Git-ignored, while original bundles SHALL remain eligible for versioning.

#### Scenario: Cache is discarded
- **WHEN** the local derivative cache is deleted but an original bundle remains
- **THEN** the derivative is recreated locally without image generation

#### Scenario: Original or rules change
- **WHEN** original bytes or the resize-rule/runtime version change
- **THEN** a different cache key is used instead of reusing the old derivative

#### Scenario: Cache is unavailable
- **WHEN** a cached PNG is corrupt or cache writes fail
- **THEN** the system rebuilds locally and can use the validated result without changing original bundles

