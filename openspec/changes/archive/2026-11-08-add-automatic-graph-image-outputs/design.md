## Context

`writeRecipeOutputs` currently writes JSON, ingredients, and Mermaid synchronously. `analyzeUrls` reports success immediately after that call. The installed Mermaid CLI is a development dependency but is not used by the application. Previously hand-rendered SVG and PNG files survived later source updates and displayed different recipe versions.

## Goals / Non-Goals

**Goals:** Automatically produce five synchronized artifacts per recipe, report success only after rendering, provide actionable failures, and preserve responsibility boundaries and testability.

**Non-Goals:** Interactive graph UI, additional formats, configurable rendering themes, arbitrary renderer commands, image caches, transactional publication across concurrent CLI processes, or changes to LLM analysis.

## Decisions

### Dedicated output-layer adapter

Add an asynchronous image-rendering adapter under `backend/src/output/`. Keep presentation preparation and Mermaid serialization pure. Make `writeRecipeOutputs` asynchronous, returning the existing paths plus `svgPath` and `pngPath`, and await it in `analyzeUrls`. Use `Awaited<ReturnType<...>>` for workflow result typing. Inject rendering at the output boundary so ordinary tests do not launch a browser; retain a real-renderer integration test.

An external manual rendering command was rejected because it cannot keep ordinary CLI runs synchronized. Putting browser calls in analysis or presentation would violate existing responsibility boundaries.

### Use the installed Mermaid CLI without a shell

Promote `@mermaid-js/mermaid-cli` to a runtime dependency and update the lockfile. Resolve its installed JavaScript executable and invoke it through `process.execPath` using argument arrays, not `.cmd`, shell interpolation, or `npx`. This supports Windows and paths with spaces and prevents network package installation during analysis.

Render the same staged Mermaid file for SVG and PNG with identical explicit settings: default theme, white background, the same viewport and scale, and bundled browser defaults. Pass static renderer configuration as needed to stabilize IDs/layout. Use a bounded rendering timeout (60 seconds per invocation), capture bounded diagnostics, terminate timed-out child processes, and wrap failures in a user-facing `CliError`. Verify that both output files are nonempty. Browser availability is checked through rendering and explained in errors and setup documentation, not through automatic installation at runtime.

Using two CLI invocations costs extra browser startup but reuses a supported entry point and avoids binding the application to browser internals or introducing a second rasterization library. Exact PNG/SVG byte equivalence across platforms is not promised; graph content, styling, and layout settings must agree.

### Stage the images and invalidate stale files

Before replacing the Mermaid source for a recipe, remove only its exact existing SVG and PNG destinations. Keep JSON, ingredients, and Mermaid as useful diagnostic artifacts. Render both images into a unique staging directory under the output directory. Publish the pair only after both renders succeed. On rendering, validation, or publication failure, remove staging files and both destination images so neither a stale pair nor a single apparently complete image remains. Propagate errors, omit success progress, and stop subsequent URLs using the workflow's existing fail-fast behavior.

Do not delete unrelated recipes or files. Staging cleanup and destination cleanup must also run if the second render or a rename fails. This guarantees coherence for a completed or failed single CLI run; crash-atomic pair publication and concurrent writers are out of scope.

### Stable names and visible progress

Keep `createOutputSlug` unchanged. All artifacts share the same recipe stem and configured output directory, including `--output-dir` overrides. CLI success prints JSON, ingredients, Mermaid, SVG, and PNG only after both images exist. Intermediate-state visibility is applied once to the Mermaid source and therefore applies to both images.

### Verification strategy

First write failing tests for asynchronous composition, image paths, success ordering, stale-file cleanup, partial failure, safe subprocess arguments, timeout, and missing browser diagnostics. Existing deterministic JSON/Mermaid fixtures remain unchanged. A fixed local graph integration test uses the real installed renderer without Chefkoch or LLM access, validates SVG markup, PNG signature/dimensions, and representative graph labels. A manual smoke test can render the existing Chefkoch analysis with a fake/injected completion or cached response, avoiding unnecessary paid LLM calls.

## Risks / Trade-offs

- [Browser missing or platform libraries unavailable] → Runtime dependency, bilingual installation guidance, and actionable failures; no false success.
- [Images drift across formats] → Same source file, fixed shared settings and renderer version, plus real-renderer smoke test and visual inspection.
- [Rendering hangs or emits excessive diagnostics] → Per-invocation timeout, bounded captured output, and verified child termination.
- [Old images appear current after failure] → Exact-path invalidation before source replacement and cleanup of both image destinations on any render/publication failure.
- [Async changes affect existing callers and tests] → GitNexus impact analysis before edits, awaited workflow contracts, and full regression suite.
- [Runtime rendering increases latency and install size] → Accept for always-available viewable outputs; optimization is deferred.

## Migration Plan

1. Add tests before production changes and report GitNexus impact for affected symbols.
2. Promote renderer dependency, add adapter, and update output/workflow/CLI async contracts.
3. Update English/German setup and CLI documentation and `next_step.md`.
4. Run type checks, full tests, real renderer smoke test, and OpenSpec validation.
5. Existing three source artifacts keep their names. Future successful runs add or replace both images. Rollback to the prior release stops automatic rendering; no data-schema migration is needed.

## Open Questions

None blocking. During implementation verify the installed Mermaid package's executable resolution and browser installation behavior on Windows before choosing the final adapter details.
