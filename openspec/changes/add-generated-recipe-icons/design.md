## Context

The CLI currently writes recipe JSON, ingredient text, Mermaid, SVG, and PNG. `preparePresentation` derives a pure semantic view; `renderMermaid` serializes it; `writeRecipeOutputs` stages and publishes graph images using the local Mermaid CLI. The recipe schema has ingredient names and graph labels/actions but no guaranteed ingredient-to-node reference. Configuration currently covers chat analysis, HTML cache, and output only.

The user wants recognizable colored schematic illustrations, generated once on demand and reused from a Git-friendly directory. Metadata can be committed without its image, so metadata presence cannot establish availability. AI generation is preferred over external image search, not assumed to remove legal obligations.

German translation: [design_de.md](design_de.md). German specifications: [specifications_de.md](specifications_de.md).

## Goals / Non-Goals

**Goals:** Simple image lookup; conservative semantic resolution; optional generate-on-miss; durable local reuse; portable graph images; graceful icon failures; documented provenance; mockable boundaries and offline tests.

**Non-Goals:** Image search, a separate service, UI, mandatory approval, automated visual scoring, illustrations for intermediate states, exhaustive vocabulary, exact reproduction of deleted generated images, multi-process cache coordination, or recipe-schema changes. A local image-generation model in Docker or a comparable runtime belongs to a separate future change; only the backend-neutral generator boundary is provided here.

## Decisions

### 1. Keep acquisition separate from pure presentation preparation

Add a focused `backend/src/icons/` module with concept resolution, asset storage, prompt construction, and an injectable generator interface. The workflow/output composition resolves assets asynchronously, then supplies semantic icon references to presentation enrichment. Pure preparation remains deterministic for explicit inputs; provider calls and filesystem writes do not occur inside it. Mermaid-specific embedding remains in serialization/rendering, not in recipe facts or the presentation classifier.

Lookup accepts a typed ingredient/process concept and returns an available asset or a structured unavailable reason. Do not infer cross-array identity from matching ingredient/node IDs: no such contract currently exists. Prefer normalized ingredient names where an unambiguous association is available, otherwise conservatively resolve node labels/actions.

Alternative: put generation inside `renderMermaid`. Rejected because it couples rendering to side effects and provider availability.

### 2. Explicit opt-in configuration

Add optional `icons` configuration with `mode: off | local-only | generate-missing`, a library directory, a demand-report path, and generator settings. Omission means `off`, preserving existing configurations and text-only outputs. Resolve paths relative to the configuration file, as existing directory settings do. The example documents `generate-missing` as the intended onboarding option but does not silently enable billed requests.

Generator settings are independent of chat configuration: backend `codex-cli`, executable location, optional Codex profile/agent-model selection, finite timeout/output limits, and a user-supplied usage-terms URL/reference. Authentication is a prerequisite managed by the user's Codex installation; this project does not require an image API base URL/key, run interactive login, copy credential stores, or change Codex global configuration. Validate generation settings only when generation is enabled; validate types of supplied fields in every mode. Never store credentials in asset metadata or logs. `local-only` launches no generator. The existing HTML-cache `offline` mode does not silently change meaning; document that fully offline execution also requires local-only/off icons and existing analysis prerequisites.

Use the Codex command-line agent as the first generator adapter behind the injectable generator interface. Before integration, verify the installed version's supported noninteractive invocation, image-generation tool/skill availability, authentication prerequisites, sandbox behavior, and delivery of an actual PNG to a designated staging destination. A successful text answer, attached input image, or zero process exit status alone is not evidence of image generation. Do not invent an image subcommand or silently replace Codex with a direct Images API, hand-drawn code-generated placeholder, or local model. If capability is unavailable, document the prerequisite/blocker and return unavailable.

Invoke with explicit arguments and prompt input, not shell-interpolated recipe text. Run in an operation-specific workspace restricted to staging, without project write access or blanket sandbox/approval bypass; account for Windows executable launchers through a tested safe launch strategy. Bound stdout/stderr and timeout, and stop the launched process tree on cancellation/timeout. Accept only the designated regular image file confined to staging, never a path asserted in agent prose or an arbitrary downloaded URL. The least-privilege sandbox/tool configuration and artifact contract must be proven before enabling live acquisition; prompts alone are not a security boundary. No agent subprocess is launched in local-only/off mode. Automated tests substitute a fixture process runner, not live Codex.

### 3. Canonical motifs, not fuzzy substring matching

Ship a small deterministic alias/rule vocabulary for common ingredients and explicit process actions (including egg/apple/butter/sugar and baking/boiling/frying). Alias resolution maps singular/plural and explicitly supported preparation variants to the same safe namespaced key. Reject ambiguous compound matches: egg substitute is not egg; apple juice is not raw apple. A temperature alone does not imply an oven. Conservative unknown ingredient phrases can become separate canonical motifs rather than being forced onto a misleading common image; if identity is ambiguous, report unresolved demand instead of inventing a match.

Use safe stable keys and relative paths confined to the library root. Process images require an explicit supported action rule; intermediate nodes remain text-only. Initial seed images are optional, not required to use generation.

### 4. One versioned bundle per motif

Default repository layout is `assets/recipe-icons/<ingredients|processes>/<key>/image.png` plus `metadata.json`. Paths in metadata are relative; no working-directory or machine-specific absolute paths are persisted. Metadata includes schema version, canonical key and display concept, asset checksum, MIME type/dimensions, generator backend and Codex CLI version, requested/reported agent-model identity, actual image model only when verifiably reported (otherwise explicitly unknown), creation timestamp, full generation prompt/style version, and configured usage-terms reference. Never mistake the Codex agent model for the underlying image model. This records provenance, not a legal warranty or a claim of CC0 ownership.

An entry is available only if metadata is supported and consistent and the PNG is a readable, bounded, decodable image matching its recorded checksum. Missing metadata, missing images, malformed metadata, mismatches, and corrupt images are cache misses with diagnostics. Unmanaged files are not guessed to be valid assets. Preserve unmanaged or mismatching files rather than overwriting potential user edits; generate replacement bundles in a new safe revision location and select the valid revision deterministically. Use direct canonical layout for the first valid bundle and documented revision subdirectories only for conflicts. Deleting an image permits regeneration; disabling a particular motif is deferred.

Publish through same-filesystem staging after validation, with metadata made visible last. Ignore incomplete staging files during lookup and clean up only staging created by the operation. Never discard unrelated files. An interrupted publication is recoverable as a cache miss. Deduplicate concurrent requests for the same canonical key inside one process. Use bounded sequential acquisition initially and at most one generation attempt per motif per run to bound cost and repeated failures.

Existing usable assets are reused regardless of later prompt/model changes. Regeneration is not guaranteed to recreate the same image: exact appearance requires committing both image and metadata.

### 5. Central style prompt, technical acceptance only

Keep the reusable style prompt versioned alongside source and combine it with a delimited concept description. Specify colored schematic factual illustration; strong consistent outlines; simple silhouette; few characteristic details; centered single motif; no text, brands, faces, ornament, or photorealistic rendering; uncluttered neutral/transparent background; readability at approximately 48 px. Transparency is preferred, not assumed to be supported by every provider.

Validate actual format, dimensions, decoding, byte limits, and checksum before use. Prompt compliance and visual recognition are not automatically guaranteed. Use a manual contact sheet of apple, butter, sugar, flour, salt, egg, oven, pot, and pan at target size during acceptance. Persist valid generated candidates immediately; do not represent them as human-approved.

### 6. Missing-demand report and nonfatal acquisition

For enabled modes, write a deduplicated per-run report outside the asset catalog, with canonical key or unresolved phrase, reason, occurrence count, and a recipe reference. Include unmet requests from local-only mode and generation/storage failures; do not retain successful repaired requests as still missing. A failed report write warns but does not block recipe output. Do not accumulate or mutate a versioned global backlog in this version.

Acquisition failures fall back to full text labels and preserve existing cues. Catch errors narrowly around acquisition: errors from the graph renderer still use its existing fatal cleanup behavior. A malformed explicitly supplied configuration remains a configuration error, not a silent fallback.

### 7. Portable assets in both rendered formats

First run an offline feasibility test with the installed Mermaid version using a known tiny PNG and supported image-node or label embedding mechanisms. Verify actual visible image rendering, not merely a matching string. Prefer embedded data URIs in generated Mermaid/SVG over file paths or remote links, and test image dimensions, text details, and unchanged graph edges. Avoid loosening browser security globally or interpolating unsanitized HTML.

The same enriched Mermaid source must produce both images, as required by existing specs. SVG must embed raster data in a form supported by standalone SVG viewers, not depend solely on browser-specific HTML foreign objects. Prove portability after moving the output and removing access to the library. If the installed Mermaid version cannot meet this, revisit this design before implementing integration; do not silently ship missing icons or introduce an unrelated rendering pipeline. Icon-free graphs retain existing serialization behavior.

### 8. Determinism includes the selected assets

Recipe JSON and ingredient text remain independent of icons. Mermaid output is deterministic for fixed recipe, view/configuration, resolution rules, and selected image bytes. Provenance timestamps stay out of serialized graph labels. A genuinely new or regenerated image is a changed input, not a violation of deterministic output.

## Risks / Trade-offs

- [Unrecognizable but technically valid generation] → Strong shared prompt, labels retained, contact-sheet review; automated scoring deferred.
- [Terms or third-party rights] → Record provider/model and terms reference, document verification responsibility; do not promise clearance.
- [Unexpected cost/network access] → Opt-in mode, finite timeout/byte/dimension limits, one attempt per motif per run, deduplication. Codex CLI is a local client, not a promise of local inference.
- [Agent has broader capabilities than an image API] → Restricted staging workspace, verified sandbox/tool permissions, safe process launch, bounded diagnostics, and process-tree termination; do not rely on the prompt to prevent repository edits.
- [Metadata-only Git clone] → Validate bytes on every lookup; regenerate or report unavailable according to mode.
- [Manual edits/conflicting files] → Preserve questionable bundles and publish a new revision rather than destructively replacing user files.
- [Large embedded Mermaid/SVG] → Bounded asset size and a small illustration footprint; measure fixture outputs before final defaults.
- [Renderer portability] → Early real-rendering gate; no remote dependencies in finished images.
- [Concurrent separate CLI processes] → Out of scope for v1; document single-writer usage and avoid destructive cleanup.
- [Timeline-change overlap] → Integrate after reviewing its current state; keep timelines out of this change and preserve its tests/work.

## Migration Plan

1. Establish renderer portability and the Codex CLI image-generation/artifact/sandbox contract with fixtures and tests before production changes. Live capability checks require explicit authorization and must not be confused with automated tests.
2. Add optional configuration and icon module using failing tests first, then enrichment/rendering integration.
3. Add bilingual usage, provenance/legal caveats, Git bundle selection, missing-image recovery, and offline-mode guidance. Do not call a paid provider in automated tests.
4. Verify installed/authenticated Codex and image-tool support, then enable `generate-missing` explicitly in a user-controlled configuration for a small manual trial. Never edit local credentials as part of migration. A future local container backend is a separate change, not a prerequisite for this trial.
5. Roll back operationally with `icons.mode: off`; existing recipes, HTML/LLM caches, and source output formats remain usable. Asset deletion is not part of rollback.

## Open Questions

- Which installed Codex version, noninteractive invocation, image tool/skill, authentication context, sandbox policy, and PNG artifact contract support this use? Local `codex --help` confirms noninteractive `exec`, not image-generation capability. Resolve before integration; no image generation was executed during this planning update.
- Which Mermaid-supported mechanism produces portable visible images? The early offline integration gate must settle this before feature integration.
- Exact byte/dimension limits and displayed size should be chosen from fixtures and the nine-motif contact sheet; tests must enforce the selected bounds.
