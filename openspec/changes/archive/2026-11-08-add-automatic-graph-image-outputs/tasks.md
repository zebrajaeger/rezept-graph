## 1. Scope and test-first contracts

- [x] 1.1 Inspect existing work and run GitNexus upstream impact analysis for every implementation symbol to be modified; report callers, flows, and risk before edits, preserving the provider-removal change and unrelated user changes.
- [x] 1.2 Add failing output tests for five shared-stem paths, identical Mermaid input/settings for both formats, repeated generation, intermediate-state visibility, and output-directory overrides.
- [x] 1.3 Add failing tests for stale-image invalidation, second-render failure, empty/missing output, publication failure, staging cleanup, and protection of unrelated files.
- [x] 1.4 Add workflow/CLI regression tests proving rendering is awaited, all five paths are reported only on success, and failures stop later URLs with a nonzero result.
- [x] 1.5 Add failing adapter tests for argument-array invocation without a shell, paths with spaces/special characters, missing renderer/browser, bounded diagnostics, and a 60-second timeout with child termination; run tests to confirm expected failures before implementation.

## 2. Rendering adapter and output integration

- [x] 2.1 Verify the installed Mermaid CLI executable and browser requirements on Windows; promote the renderer to a runtime dependency and update the lockfile without adding runtime downloads.
- [x] 2.2 Implement the injectable output-layer renderer using the installed CLI through Node, shared explicit rendering settings, bounded errors/timeouts, and nonempty output validation.
- [x] 2.3 Make output writing asynchronous; invalidate the exact prior image pair, render into a unique staging directory, publish only after both renders succeed, and clean both image destinations and staging on failure.
- [x] 2.4 Await output generation in the workflow, adjust concrete result/dependency types and test mocks, and add SVG/PNG paths to CLI success reporting.
- [x] 2.5 Preserve current JSON, ingredient, Mermaid, slug, and presentation behavior; update async callers and fixtures without changing expected recipe data or leaking rendering into analysis/presentation.

## 3. Integration verification and documentation

- [x] 3.1 Add and run a real-renderer integration test on a deterministic local graph, checking SVG content, PNG signature/dimensions, and matching graph labels/settings without a recipe-site or LLM request.
- [x] 3.2 Render the existing Chefkoch recipe from its saved analysis or cached completion and inspect SVG/PNG for consistent content, layout, colors, labels, and background without an unnecessary live LLM call.
- [x] 3.3 Update paired English/German setup, CLI, and architecture documentation for five outputs, browser/runtime prerequisites, and failure behavior; keep README concise.
- [x] 3.4 Run type checking, build, full automated tests, packaging/runtime-dependency checks, scoped diff checks, and strict OpenSpec validation; run GitNexus detect_changes before any requested commit and use the change name in its message.
- [x] 3.5 Update `next_step.md` with actual verification results and a small re-entry task; mark completed tasks and leave the change ready for review/archive.
