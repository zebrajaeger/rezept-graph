## 1. Establish regression and change boundaries

- [x] 1.1 Review current uncommitted icon work and parent change contracts; record upstream GitNexus impact before every existing symbol edit, warn on HIGH/CRITICAL and document incomplete index coverage without treating it as safety evidence.
- [x] 1.2 Add a sanitized apple-cake regression fixture and failing table-driven tests for quantities, units, fractions/decimals, Unicode/plurals, recognized qualifiers, original bare aliases and unchanged input objects.
- [x] 1.3 Add failing negative tests for alternatives, mixtures, identity-changing compounds, unknown qualifiers, negation, path-like/over-limit inputs and unrelated IDs.

## 2. Implement conservative resolution

- [x] 2.1 Implement bounded ingredient normalization and explicit whole-expression grammar sufficient for the specified real examples; retain supported keys and abstain on ambiguous inputs.
- [x] 2.2 Add failing tests for full action phrases, timing prefixes, explicit/blank action precedence, device-only and temperature-only descriptions, conflicting/negated actions and intermediate exclusions; implement minimal deterministic action rules.

## 3. Verify the complete offline path

- [x] 3.1 Add a failing integration acceptance test using the realistic fixture and injected PNG generator; assert supported/unsupported assignments, one acquisition per motif, persisted original/derivative reuse and unchanged recipe/ingredient bytes; implement composition changes only if needed.
- [x] 3.2 Verify actual visible icons and retained labels/details/cues/edges in real SVG and PNG, including relocated outputs with inaccessible source assets, and retain off/local-only and timeline regressions without live provider calls.

## 4. Document and review

- [x] 4.1 Update German/English operating documentation with supported phrase grammar and intentional abstentions; keep German next_step.md current and distinguish this change from the parent's remaining security gates.
- [x] 4.2 Run typecheck, build, complete tests, OpenSpec validation, diff checks and scope review. Run GitNexus detect_changes before any commit; if authorized, base the commit message on resolve-recipe-icon-motifs. Do not run paid generation or archive the parent change automatically.

## Verification checkpoint

All four new resolver tests and the realistic integration test failed before the implementation. Production changes are confined to motif.ts (resolveMotif and its existing alias table); no workflow, renderer, generator or timeline symbol changes were needed. GitNexus upstream impact for resolveMotif returned UNKNOWN/not indexed, not evidence of zero callers: direct consumer acquirePresentationIcons feeds analyzeUrls and graph output. Aggregate detect_changes reports HIGH across 13 indexed CLI/config flows from the complete pre-existing uncommitted icon change; new-symbol coverage remains incomplete.

147 tests pass including typecheck/build, offline acquisition, cache reuse without browser relaunch, exact original/metadata preservation, unchanged recipe/ingredient bytes, off/local-only behavior, real portable SVG/PNG pixel checks and timeline regressions. SVG pixel testing uses explicit viewBox dimensions to avoid Image's default 300px percentage-width rasterization. Read-only replay of the actual ignored apple-cake JSON independently resolves eight nodes to six motifs. Existing live outputs were not overwritten and no live provider was called. Parent security gates remain open. No commit/archive.
