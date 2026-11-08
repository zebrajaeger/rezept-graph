## ADDED Requirements

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
