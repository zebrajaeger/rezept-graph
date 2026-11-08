## Why

Recipe graphs are easier to scan when common ingredients and cooking actions have recognizable visual anchors. A reusable, locally stored collection of AI-generated illustrations provides a consistent style without requiring a different external image source and license investigation for each motif; generation-service terms and provenance still need documentation.

German translation: [proposal_de.md](proposal_de.md).

## What Changes

- Introduce an image-library component that resolves ingredient and process concepts to stable motif identifiers and returns a usable local image or an explicit unavailable result.
- Add configuration for disabled icons, local-only reuse, or generate-on-miss behavior. Existing configurations remain valid and do not initiate image generation.
- Generate missing motifs through the Codex command-line agent as the first generator backend, using a versioned style prompt emphasizing colored schematic illustrations, strong contours, few details, and small-size recognition. Prove noninteractive image-file generation before integration.
- Persist reusable image/metadata bundles in a configurable, Git-friendly directory. Record provenance and configured usage-terms information without credentials.
- Check actual file availability, not metadata alone. Repair missing or unusable assets through generation when enabled; otherwise keep text-only nodes and report unmet demand.
- Enrich ingredient and process nodes without replacing labels, recipe facts, graph connectivity, or existing execution cues. Produce portable SVG/PNG outputs.
- Treat icon acquisition failures as nonfatal, while preserving the existing fatal behavior for failures of the graph renderer itself.
- Exclude external image search, a separate server/UI, mandatory human approval, automatic visual scoring, exhaustive ingredient coverage, and intermediate-state illustrations from this first version. A local image model in Docker or a similar runtime is reserved for a separate future change; no container/backend implementation is included here.

## Capabilities

### New Capabilities

- `recipe-icon-library`: Configurable motif resolution, generation, persistent reuse, provenance, missing-asset recovery, and unmet-demand reporting.

### Modified Capabilities

- `recipe-graph-visualization`: Optional recognizable ingredient/process illustrations in graph outputs with preserved text, portable images, and deterministic reuse for fixed asset inputs.

## Impact

- Configuration loading and examples, analysis workflow composition, presentation enrichment, Mermaid serialization, image rendering, and output writing will need integration.
- Add a focused icon-library module and injectable generator interface with an initial Codex CLI process adapter; no changes to the recipe-analysis response schema or recipe JSON are intended.
- Generation requires a separately installed, authenticated Codex CLI with verified image-generation capability. Calls can involve external services and cost; authentication remains managed by Codex, not stored in assets. AI generation does not guarantee legal clearance; usage conditions require explicit documentation.
- Add local fixtures, provider-contract tests, real offline rendering checks, and bilingual operational documentation. Tests precede implementation; GitNexus impact analysis is required before editing existing symbols.
- Coordinate shared presentation/output integration with the separate `add-single-person-cooking-timeline` change without expanding either change's scope.
