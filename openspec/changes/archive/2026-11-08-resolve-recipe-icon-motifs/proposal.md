## Why

The authorized apple-cake run produced all nine output artifacts but resolved zero of 21 eligible nodes and embedded no icons. Real labels such as `3 Eier, Größe M` and `250 g Mehl` do not match the current bare-term resolver, so enabling generation does not reliably yield illustrations.

Deutsch: [proposal_de.md](proposal_de.md).

## What Changes

- Resolve supported motifs from realistic ingredient labels with quantities, units and explicitly recognized qualifiers, without changing recipe facts or visible labels.
- Recognize supported process actions in complete phrases, including the observed baking and preheating formulations.
- Keep alternatives, compounds, negations and unsupported concepts text-only unless a rule establishes one unambiguous motif; never use unrestricted substring matching.
- Verify the complete offline acquisition-to-render path using a sanitized fixture based on the failed apple-cake run, including positive matches and deliberate abstentions.
- Preserve original bundles, derivative caching, generation session limits, off/local-only behavior, portability and timeline behavior.

## Capabilities

### New Capabilities

- `recipe-icon-motif-resolution`: Conservative, deterministic resolution of realistic recipe-node language into supported motif identities, with observable offline acceptance.

### Modified Capabilities

None. This capability refines the resolver boundary introduced by the still-active `add-generated-recipe-icons` change; that change's unarchived library requirements remain a dependency, not an already published main specification.

## Impact

- Primarily `backend/src/icons/motif.ts`, resolution tests and offline output/workflow acceptance fixtures; narrow composition changes only if evidence requires them.
- Depends on the working implementation of `add-generated-recipe-icons`; does not complete or weaken its remaining security acceptance gates.
- No new LLM calls, generator backend, dependency, schema fields, image style or general ingredient ontology. Live image generation requires separate explicit authorization.
