## Context

The failed real run has 21 eligible nodes, all unresolved, despite enabled generation. The existing resolver matches whole bare ingredient aliases and actions only at phrase start. Quantity-bearing labels and phrases such as `Erste 45 Minuten backen` fail before acquisition. Existing output JSON provides ingredient names separately but no guaranteed ingredient-to-node link. This change depends on the active icon-library implementation, not its completion or archive.

Deutsch: [design_de.md](design_de.md).

## Goals / Non-Goals

**Goals:** Deterministic recognition of supported German/English ingredient and action expressions encountered in real recipe nodes; safe abstention; visible offline graph acceptance; no mutation of recipe data.

**Non-Goals:** General natural-language understanding, expanding the motif catalog arbitrarily, additional LLM classification, ID-based array joins, changed generator permissions, fixing all report diagnostics, live paid trials, or timeline changes.

## Decisions

1. **Pure, bounded normalization and explicit grammar.** Normalize Unicode/case/spacing on a copy. Consume documented leading quantities (integers, decimals, common fractions), units and explicitly approved modifiers. Match the remaining complete supported ingredient expression, not any occurrence of an alias. Keep unknown qualifiers unresolved until a tested rule exists. Reject unsafe input and cap parsing input length. Alternative unrestricted token/substring search is rejected because `Ei-Ersatz`, `Apfelsaft` and mixtures would produce incorrect images.
2. **Distinguish qualifiers from identity-changing alternatives.** Accept examples `3 Eier, Größe M`, `250 g Mehl`, `125 g Zucker für den Teig`, `60 g Butter zum Bestreichen`, `1,5 kg Äpfel`. Do not collapse `Margarine oder Butter`, `Zucker oder Zimtzucker`, `Butter und Mehl`, `Ei-Ersatz`, `Apfelsaft` or `Etwas Fett für die Form` to one motif. Do not remove arbitrary words after `für` or `zum`; whitelist tested qualifier forms.
3. **Action phrases, not device mentions.** Use explicit action token/phrase rules for baking, preheating, boiling and frying independent of numeric timing prefixes. Prefer a nonempty supplied action field, falling back to the label when absent/blank. Negated, hypothetical or conflicting supported actions abstain. `Backofen vorheizen`, `Erste 45 Minuten backen` and `Kuchen fertig backen` resolve to oven; `200 °C`, `Backofen reinigen`, `nicht backen` and `kochen oder braten` do not infer one device. Do not blindly fall back from a contradictory explicit action to a misleading label.
4. **Integration remains at the existing boundary.** Keep resolveMotif pure and preserve safe canonical keys and prompt concepts. No joining ingredient IDs to node IDs or rewriting recipe facts. Existing acquisition, deduplication, derivative cache, source budgeting and portable rendering consume the result unchanged unless tests expose a narrowly scoped integration gap.
5. **Realistic offline evidence before implementation.** Check in a small sanitized fixture of the observed recipe structure, not ignored outputs or provider credentials. Tests use known colored PNG fixtures/injected generators, assert resolved/unresolved nodes explicitly, count shared generation per motif, verify visible embedded images in real SVG/PNG, and preserve exact recipe/ingredient bytes and baseline/timeline behavior. A successful CLI exit alone is not acceptance. No live generation is needed.

## Risks / Trade-offs

- [Qualifier rules overgeneralize] → Whole-expression matching, explicit supported grammar, negative pairs and alternatives tests.
- [Incomplete vocabulary leaves gaps] → Intentional text fallback and documented supported forms; no claim that every node gains an icon.
- [Action negation or alternatives imply a wrong device] → Fail closed on ambiguity, negation and conflicting actions; table-driven cases.
- [New matching triggers paid work] → Existing explicit generate-missing settings/session bounds remain; automated tests are offline and live reruns need authorization.
- [Dependent change is unarchived] → Reference its contracts, do not duplicate or weaken them; coordinate implementation and later spec synchronization.

## Migration Plan

Write regression tests first, then minimal resolver changes after upstream impact analysis. Run complete tests and real offline rendering, update bilingual operating docs and next_step.md. No data migration: supported keys and bundles remain unchanged. Roll back operationally with `icons.mode: off` or `local-only`. Do not archive the parent change as part of this work.

## Open Questions

None blocking proposal approval. Implementation must enumerate its supported numeric/unit/qualifier grammar in tests and docs rather than claim arbitrary-language coverage.
