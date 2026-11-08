## Context

`backend/src/icons/motif.ts` recognizes a bounded phrase grammar and returns base motifs. Recipe analysis already provides name, quantity, unit, preparation, and originalText, but ingredient/node IDs must not be assumed equivalent. The existing image library validates and reuses bundles; its outstanding security acceptance remains separate.

## Goals / Non-Goals

**Goals:** Recognize ingredients before optimizing quantities; retain alternatives; bound generated variants; test real display-size readability.

**Non-Goals:** Arbitrary LLM-authored image prompts, general food ontology, automatic visual approval, modifying recipe facts, or pre-generating a catalog.

## Decisions

### Follow-up: preserve existing node shapes

Icons now supplement native nodes on the inside left, with text to the right. The serializer reserves label space and emits bounded embedded-image comments; the application renderer finishes the native SVG and rasterizes it to PNG without foreignObject. Standalone Mermaid viewers do not interpret these comments and show layout placeholders; exported SVG/PNG remain portable. Text-only graph serialization and rendering are unchanged. Impact queries for renderNode/renderMermaid/renderGraphImages returned UNKNOWN due to missing index symbols, not proof of safety; offline regression covers writer, acquisition budgeting and real SVG/PNG. Final suite: 156 passing tests including typecheck/build. Stored apple-cake graph was rerendered locally and visually inspected; no provider calls.

### Follow-up: culinary state after visual feedback

The user confirmed that the cut boiled egg is inappropriate. Ingredient state must be explicit independently of visual form: raw/whole-with-shell, boiled, fried. State belongs in validated descriptors, canonical asset identity, group selection and derivative keys. Future raw keys should use `egg-raw` and `egg-raw-count-N`, with separate boiled/fried identities; legacy `egg` must not silently migrate. This requires tests and implementation before general state-aware operation can be claimed. No further image sessions are authorized. For the immediate stored-recipe rerender, use only explicitly inspected appropriate local assets, including the existing three-whole-egg image for exactly three raw eggs. Do not use the cut-egg base. This is a local preview with explicit reviewed descriptors, not a completed live semantic pipeline.

1. **Separate meaning from presentation.** Use a validated internal descriptor: single concept or alternative, canonical concept IDs, optional exact quantity/unit, and supported qualifiers. Keep it outside recipe source facts. Only associate existing ingredient fields with nodes through proven correspondence; otherwise interpret the node's bounded original label. Conflicting or unsupported interpretations abstain. Do not infer IDs from position or similar identifier strings.
2. **Deterministic first, optional semantic fallback.** Reuse supported deterministic identities and reliable structured quantities. Unresolved labels can use an independently configured small OpenAI-compatible model through the existing completion abstraction. Require explicit opt-in, timeout, bounded input/output, schema validation, versioned caching and per-run deduplication; at most one application attempt per distinct input. Do not trust model confidence alone. Start with curated concepts including margarine; unknown concepts remain text until supported, rather than generating arbitrary identities. This limits coverage but prevents uncontrolled catalogs.
3. **No hidden network use.** Icons off bypasses interpretation and presentation. Local-only can use deterministic rules and validated cached interpretations, but cannot call the semantic provider. A cache miss retains fallback. Record semantic cache keys using input/context plus schema/prompt/model configuration identity, without secrets. Disabling semantic interpretation preserves legacy resolution.
4. **Application-owned presentation policy.** Base identity remains `ingredients/egg`, independent of quantity. Egg group asset identities are separate, finite variants for integer piece counts 2–5; one egg reuses the base. Only requested missing variants can generate. Larger counts use the base plus a renderer-owned exact number, with no count-specific generation. Missing/failed group variants fall back to base plus number if available, otherwise text. Unspecified or noninteger counts use the base and original text; no rounding or inferred count. Other ingredients initially use base motifs, not group variants.
5. **Compose alternatives locally.** Resolve butter and margarine independently, sort their IDs for stable symmetric identity, and compose their images with renderer-owned “oder”, never AI-rendered lettering. Reuse the same image components for reversed phrasing. Do not request a separate generated alternative image. If either component is missing or composition is unreadable, keep the full text instead of implying a single choice. Mixtures are not alternatives and remain unsupported initially.
6. **Preserve the library boundary.** Persist generated base/group bundles through existing integrity and provenance checks. Presentation derivatives include component checksums, normalized count/relation, layout version, and runtime inputs in cache identity. Never publish an overlay as a new AI original. Retain display byte/dimension limits, Mermaid budget, visible labels, source JSON, and timeline behavior.
7. **Small visual trial, not a blanket approval.** Produce a five-case contact sheet and graph excerpt: butter, margarine, butter-or-margarine, three eggs, six eggs. First use injected/local fixtures offline. A separately authorized live trial lists missing motifs and approves an explicit maximum number of new generator sessions before starting; no automatic retries. Six eggs reuses the base, and the alternative only composes. Inspect actual graph size and enlarged previews; record recognition, alternative semantics, count accuracy and badge legibility with the user. Existing technical PNG checks cannot verify three depicted eggs.

## Risks / Trade-offs

- [LLM misidentification] → Curated identities, strict descriptors, negative fixtures and abstention; never rewrite recipe facts.
- [Wrong field-to-node association] → Prove correspondence or fall back to original node text.
- [Butter/margarine look alike or “oder” becomes tiny] → Trial in actual display size; retain text and revise layout based on user feedback.
- [Group image has the wrong count] → Human inspection; use base plus renderer-owned count if rejected.
- [Network/cost expansion] → Opt-in interpretation, cache/deduplication, finite variants and explicit live-trial budget. A Codex session is not a guaranteed single underlying paid image request.
- [Cache or renderer regression] → Include presentation inputs in derivative keys, test moved libraries and offline SVG/PNG, retain existing limits and fallback.

## Migration Plan

Add optional configuration without changing old defaults. Implement through red/green tests, run regressions and offline previews, then request approval for any live image sessions. Existing base assets remain valid; disable new interpretation/presentation to roll back without deleting bundles. Update operating docs and next_step.md. Run GitNexus impact before symbol edits and detect_changes before any commit; do not infer safety from the currently incomplete index.

## Open Questions

- Which available small model gives acceptable accuracy? Select during implementation using fixed offline/fake-client cases and any separately approved live evaluation.
- Are the composed alternative and group motifs readable at the actual icon size? The visual trial, not this design, decides.
- Optional configuration is `icons.presentation: true` and `icons.interpretation: { enabled: true, baseUrl, model, apiKeyEnv, timeoutMs, maxOutputBytes, cacheDirectory }`. Both are off by default. There is no explicit recipe-to-node relationship in the current schema, so interpretation uses node labels only and never borrows structured ingredient quantities. Provider construction stays in the workflow; icons receive only an injected completion capability, preserving module boundaries. The common client supports an optional streaming response-byte limit; old callers retain their original behavior.

## Implementation evidence

- State follow-up completed test-first: `state` is validated against a bounded source-label grammar; raw/boiled/fried keys and group/fallback selection are separate, with explicit depiction prompts and a bumped semantic/derivative cache version. Missing or unsupported states retain text. Legacy assets are never migrated automatically. The state-aware path also applies when interpretation is enabled without quantity presentation. Final suite: 159 tests passing, including unchanged legacy behavior. No additional live image requests. User provisionally accepted the inside-left layout and requested that state work be completed before archive.

- Initial semantic/configuration and presentation tests failed typechecking before the new modules existed. The completed offline suite currently passes 155 tests including typecheck/build and the unchanged apple-cake acceptance test.
- GitNexus was reindexed. `normalizeIcons`: LOW, direct callers validateConfig/normalizeConfig; `LlmConfig`: MEDIUM, seven direct references; `createOpenAiCompatibleClient`: LOW. `analyzeUrls` has partial LOW coverage. Some icon symbols are still absent from the index: UNKNOWN, not evidence of no impact. File inspection establishes the acquisition path through analyzeUrls and the output renderer; full regression tests remain required.
- Contact sheet and real SVG/PNG graph previews use explicitly labeled local hand-drawn fixtures, not AI output. User visual acceptance and any live image sessions remain pending.
