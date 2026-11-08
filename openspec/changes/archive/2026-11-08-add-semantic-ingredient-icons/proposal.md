## Why

The conservative icon grammar leaves realistic ingredient phrases and alternatives unresolved. Ingredient recognition should improve without producing a new AI image for every quantity; quantity visualization is a secondary benefit that needs a small visual trial.

## What Changes

- Add optional, independently configured small-LLM ingredient interpretation with validated structured output, stable concept identities, and conservative fallback.
- Reuse existing ingredient facts where reliable; do not change source recipe facts or let the LLM choose paths, prompts, or generation policy.
- Compose butter-or-margarine from reusable individual motifs with renderer-owned “oder” text; keep individual butter and margarine motifs available.
- Permit on-demand egg group variants for integer counts one through five. Above five, use the egg base motif with a renderer-owned number badge, never a count-specific generated image.
- Keep base icons and original quantity text as fallbacks; do not pre-generate all variants or enable count variants for every ingredient.
- Evaluate butter, margarine, their alternative, three eggs, and six eggs at actual graph display size in an explicitly authorized, bounded visual trial.

## Capabilities

### New Capabilities
- `ingredient-icon-presentation`: Bounded quantity variants, composed alternatives, fallback, and visual trial acceptance.

### Modified Capabilities
- `recipe-icon-motif-resolution`: Optional structured semantic interpretation alongside existing deterministic recognition, without collapsing alternatives or changing recipe facts.

## Impact

Expected areas: `backend/src/icons`, recipe-to-node association, LLM configuration/cache integration, graph icon enrichment, tests, and bilingual documentation. Existing icon acquisition, bundle integrity, display size limits, process motifs, and timeline behavior remain in force. Semantic requests require explicit opt-in and separate model settings; off/local-only modes must not acquire new implicit network calls. No new provider, image generation, dependency installation, or application changes are performed by this proposal.

Non-goals: general ingredient ontology, automatic visual quality approval, quantity pictures for every food, changing portions, arbitrary generated prompts, and closing outstanding security work from the archived image-generator change.
