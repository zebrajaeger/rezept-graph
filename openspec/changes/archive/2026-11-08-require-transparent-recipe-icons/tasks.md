## 1. Scope and failing tests

- [x] 1.1 Re-read the icon pipeline and pending provider change; run upstream GitNexus impact analysis for every existing symbol to edit and report callers, affected processes, and risk before edits.
- [x] 1.2 Add failing prompt tests for explicit transparent margins and forbidden backgrounds, retaining semantic state/group instructions and version metadata.
- [x] 1.3 Add offline pixel fixtures/tests for opaque RGB/RGBA, white foreground on transparency, semitransparent contours, token transparency, opaque borders, empty images, PNG filters 0–4, supported 8/16-bit encodings, unsupported encodings, and resource limits.
- [x] 1.4 Add failing library tests for rejection reason, no publication/retry, shared one-attempt behavior, legacy opaque bundle reuse, and no provider calls in off/local-only modes.

## 2. Implement new-generation acceptance

- [x] 2.1 Increment the central style version and require real transparent PNG background/margins without weakening concept boundaries or semantic instructions.
- [x] 2.2 Implement bounded decoded-alpha inspection with the specified transparent-border and 1% area rules; keep general PNG validation and legacy lookup compatible.
- [x] 2.3 Apply the gate before new bundle publication and report `background-not-transparent` with existing text fallback; preserve original bytes, revision safety, and provider attempt limits.

## 3. Verify display and document

- [x] 3.1 First add regression tests for alpha through resize, cache reuse, SVG embedding, and final PNG compositing on green nodes; fix transformations only if tests expose flattening and version affected cache behavior.
- [x] 3.2 Produce an offline transparent-fixture contact sheet on contrasting backgrounds and inspect white foreground details and margins without live generation.
- [x] 3.3 Update English/German icon documentation and German `next_step.md` with policy, limitations, provider compatibility, and separate authorization needed to replace existing assets.
- [x] 3.4 Run full offline tests, typecheck/build, OpenSpec validation, and diff review; run GitNexus `detect_changes` before any commit and base the commit message on `require-transparent-recipe-icons`. Do not install models, modify active config, replace assets, or invoke live providers.
