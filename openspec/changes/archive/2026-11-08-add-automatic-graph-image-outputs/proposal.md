## Why

Normal CLI runs currently produce Mermaid source but no viewable SVG or PNG. Separately rendered images can become stale and disagree with each other, so users need both image formats generated automatically from the same current graph.

## What Changes

- Generate `.svg` and `.png` automatically for each recipe in the standard `analyze` command, alongside JSON, ingredient text, and `.mmd`.
- Render both images from the same generated Mermaid source with shared layout, theme, fonts, and background settings.
- Reuse the existing deterministic output stem and output directory for all five artifacts.
- Await image generation before reporting recipe success and print both image paths.
- Prevent stale images from remaining alongside updated source when rendering fails; keep useful text artifacts and report a nonzero CLI result with an actionable error.
- Make the installed Mermaid renderer and required headless browser explicit runtime prerequisites; no implicit package downloads during analysis.
- Add test-first coverage, a real renderer smoke test, and bilingual setup/output documentation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-graph-visualization`: Require automatic, synchronized SVG/PNG image outputs, visible output paths, and reliable rendering failure handling.

## Impact

Affected areas are output generation, a new image-rendering adapter, asynchronous workflow/output contracts, CLI progress reporting, test fixtures and mocks, runtime dependencies and packaging, and English/German documentation. `@mermaid-js/mermaid-cli` is already installed as a development dependency and must be available at runtime for this feature. Rendering adds browser startup time and requires a supported browser installation. Recipe ingestion, LLM protocol, and analysis semantics are unchanged. The existing unarchived provider-removal change and unrelated user changes must be preserved.
