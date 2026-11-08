## Why

The recipe graph explains ingredients and dependencies, but its layout does not show elapsed time or a practical order for one cook. An additional visual cooking timeline should make approximate completion time, hands-on work, passive phases, and timely actions such as oven preheating understandable without repeatedly reading the recipe text.

## What Changes

- Add a cooking timeline alongside, not instead of, the existing graph and five output artifacts.
- Plan for exactly one cook: serialize hands-on work and overlap unattended phases where dependencies permit.
- Show relative start times, approximate total elapsed time and hands-on time, passive phases, and clear return-to-action cues.
- Allow estimated durations, explicitly distinguish them from recipe-sourced durations, and identify the whole schedule as a planning suggestion.
- Include short actionable instructions, relevant amounts, temperatures, and readiness conditions in the cooking view.
- Schedule preheating ahead of oven use, with a visible estimated duration and an actual-readiness reminder.
- Export the additional view automatically as Mermaid, SVG, and PNG, and preserve its structured planning data in a separate JSON sidecar.
- Exclude multi-person coordination, resource-management tooling, live timers, and exact or optimal scheduling.

## Capabilities

### New Capabilities

- `single-person-cooking-timeline`: validated timing inputs, deterministic single-cook planning, uncertainty labels, and an additional glanceable visual export.

### Modified Capabilities

None. The existing recipe-analysis and graph-output contracts remain intact; the timeline uses an additional planning stage and separate artifacts.

## Impact

- Likely integration areas: `backend/src/workflows/analyze-urls.ts`, recipe types/schema adapters, LLM planning enrichment, presentation, output writing, and image rendering.
- A dedicated planning module owns temporal dependencies and single-cook scheduling; presentation must not infer a schedule from graph coordinates.
- An additional validated LLM enrichment request supplies missing duration estimates and attention information; existing analysis cache entries remain usable, while enrichment has its own message-based cache identity.
- Tests cover single-cook invariants, estimation provenance, preheating, uncertain completion, deterministic exports, and unchanged existing artifacts.
- Reuse local Mermaid/browser prerequisites; no new external scheduling service or project-management dependency.
- Implementation documentation will be provided in German and English. German planning summary: [proposal_de.md](proposal_de.md).
