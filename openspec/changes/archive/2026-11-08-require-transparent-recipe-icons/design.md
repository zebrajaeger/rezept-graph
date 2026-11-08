## Context

`buildIconPrompt` currently permits a neutral or transparent background. `validatePng` checks bounded PNG structure and inflated scanline sizes, not reconstructed pixel alpha. `IconLibrary.obtain` publishes generated originals after technical validation; lookup intentionally reuses older prompt versions. Display derivatives and graph exports must not flatten accepted transparency. See [proposal](proposal.md).

## Goals / Non-Goals

**Goals:** Explicit transparent-background prompts, deterministic new-image acceptance, preserved white foreground details, bounded decoding, and offline regression coverage.

**Non-Goals:** Automatic regeneration of existing eggs, background-removal services, color-keying white pixels, new providers, or live image requests during implementation/testing.

## Decisions

### Central icon policy, not provider-specific prompting

Bump the shared style version and request an isolated motif on a truly transparent PNG canvas, with transparent margins and no white/colored rectangle, checkerboard, backdrop, or scene. Keep semantic state/group instructions and delimited concept data intact. Prompt-only enforcement is insufficient. The pending pluggable-provider change must route icon results through the same acceptance gate; general image-generation requests remain unrestricted by this icon-only rule.

### Bounded pixel inspection before publication

Keep the existing technical validator's general contract compatible. Add a separate icon-background inspection using the existing bounded decoder/dependency where suitable, reconstructing PNG filters correctly rather than reading compressed scanline bytes as pixels. Support the currently accepted 8/16-bit grayscale/RGB variants with effective alpha, including valid transparency metadata where supported; otherwise reject unsupported transparency encoding explicitly. Retain 4 MiB compressed, 4096-by-4096 dimension, and finite decoded-allocation bounds.

Acceptance policy: all outermost border pixels must have alpha zero; at least 1% of canvas pixels must be fully transparent; at least 1% must have nonzero alpha. Alpha thresholds apply to the full sample range at either bit depth. This ensures meaningful transparent margin and rejects opaque RGBA, a token transparent pixel, empty images, and edge-touching backgrounds. Semitransparent antialiased contours inside the margin are allowed. A white egg remains white inside its silhouette. This is a measurable technical gate, not proof that every interior background island or painted checkerboard was detected; visual inspection remains necessary.

Do not strip white pixels: that destroys eggs, flour, and highlights. Do not add retries: failure returns `background-not-transparent` (or a distinct technical validation reason), contributes to unmet demand, and uses the established text fallback. Validate before publishing image or metadata.

### Compatibility and alpha-preserving derivatives

Apply the new background gate only to newly generated candidates. Do not tighten general lookup or reinterpret older metadata as proof of transparency. Existing valid opaque assets stay reusable; a style-version bump alone does not replace them. Any future user-authorized replacement must preserve old revisions and select the new revision deliberately, not rely on current oldest-first lookup. This change introduces no replacement command or automatic paid repair.

Verify display resizing/cache reuse and embedded SVG/PNG exports with transparent fixtures on the existing green node background. Version the display-cache transformation only if its behavior changes; never republish altered originals under their old checksum.

## Risks / Trade-offs

- [Provider cannot produce transparency] → Reject with diagnostic and text fallback, no silent provider switch or second attempt.
- [Border criterion rejects valid edge-touching artwork] → Explicitly require transparent margins in the prompt; conservative acceptance is intentional.
- [Interior opaque patches evade the gate] → Document technical limits and inspect an offline contact sheet on contrasting backgrounds.
- [Legacy white rectangle remains visible] → Explain compatibility; obtain separate authorization before replacement or live generation.
- [Adjacent provider refactor] → Re-read current code and run required symbol impact analysis before implementing either change.

## Migration Plan

Write failing tests first, implement policy and publication gate, verify derivative/rendering alpha, then update bilingual documentation. Run full offline tests, typecheck/build, and OpenSpec validation. No asset/config migration. Rollback code without changing existing original bundles.

## Open Questions

None blocking planning. Live provider transparency quality and replacement of the existing three-egg image require separate user authorization.
