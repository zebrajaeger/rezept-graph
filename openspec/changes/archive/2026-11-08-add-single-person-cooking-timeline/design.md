## Context

The CLI currently analyzes extracted recipe content into `RecipeAnalysis` and passes it to `writeRecipeOutputs`. Process duration is optional free text; edges describe ingredient usage, production, ordering, and prerequisites. The graph cannot establish elapsed time or attention requirements. Existing cached analysis and the five existing artifacts must remain usable. This change is planning only until explicitly applied.

German companion: [design_de.md](design_de.md).

## Goals / Non-Goals

**Goals:** A glanceable visual cooking guide for one person, approximate elapsed and hands-on times, visible passive phases and return cues, truthful uncertainty, and practical preheating placement.

**Non-Goals:** Multiple cooks, resource inventories, mathematical optimization, live progress/timers, serving-deadline planning, and replacing the graph. No complete kitchen scheduling engine.

## Decisions

### 1. Keep analysis intact; enrich planning separately

Use a separate validated planning-input model and a `.timeline.json` sidecar rather than making new fields mandatory in `RecipeAnalysis`. Enrichment receives the extracted recipe content and accepted analysis through the existing completion client. This preserves recipe evidence and avoids breaking old cached responses. Its dedicated messages naturally create a separate completion-cache entry.

Planning input contains stable phase IDs, associated process-node IDs, concise action text and ingredient amounts, temporal prerequisites, hands-on/unattended/attended classification, numeric duration bounds, duration provenance (`recipe`, `estimated`, or `unknown`), source evidence or estimation rationale, relevant temperatures and readiness conditions. Compound processes can be split into setup, passive time, and interventions. Every process must be covered or explicitly identified as not schedulable; enrichment cannot silently drop steps. Referenced IDs, coverage, bounds, and acyclicity are validated.

Missing preparation, preheating, and cooling durations can be estimated. An estimate must never be labeled as a recipe fact. If a defensible estimate is unavailable, preserve an unknown duration and mark downstream timing and the overall total incomplete rather than treating it as zero. Do not invent missing food-safety instructions or shorten source cooking times. Existing source wording is retained when normalization is uncertain.

**Alternative:** Expand the primary analysis schema and regenerate all analyses. Rejected because it couples a new view to a cache/schema migration and changes the established graph contract.

### 2. Deterministic simple planning, not LLM-generated timestamps

A pure planning module turns validated phases into a schedule. One attention lane is shared by hands-on and continuously attended phases. Unattended phases can overlap it. Actual required prerequisites, including paths through intermediate states, constrain phase starts; ingredient-only edges do not become artificial time dependencies. Fixed tie-breaking uses source process order then phase ID.

Schedule independent work during passive phases without allowing two attention-demanding tasks to overlap. Keep required interventions explicit and avoid scheduling noninterruptible attention work across a known return deadline. Recurring checks must be represented as short intervention phases or conservatively classified as attended; they cannot disappear into a supposedly free period.

Use the same deterministic ordering for lower/upper duration bounds and report the resulting elapsed-time range as an approximate planning envelope, not a guarantee or optimal completion time. Hands-on time is reported separately; attended time is also disclosed and is never described as free time. Relative offsets are approximate and labeled accordingly; no calendar dates or fake clock times are needed.

**Alternative:** Let the LLM generate the entire schedule. Rejected because attention conflicts, source timing, and repeatability are easier to enforce in deterministic code. A solver and detailed equipment model are unnecessary for this scope.

### 3. Preheating is a passive prerequisite with an activation step

Represent turning on the oven as a short hands-on phase followed by an unattended preheat phase. Aim to complete preheating at the first oven-use step, placing activation at an available attention boundary early enough for the estimated upper preheat duration. If that is not possible, show explicit waiting and move oven use later. Never move baking before its prerequisites or suggest inserting food before actual oven readiness. Longer idle oven time is acceptable when the single-cook constraint makes it simpler; this is a heuristic, not energy optimization.

### 4. Render one cooking view with two visual groups

Reuse the existing recipe graph's exact Mermaid palette, node shapes, typography, white background, and solid connectors. Arrange steps in chronological rows; phases starting at the same relative time share a row. Distinguish `Du machst` and `Läuft nebenher` in compact node labels, not large colored swimlane containers. Use a plain diagram title for approximate total/hands-on time, not a summary node. Keep only chronological connectors, without a second dependency web. Readiness conditions and interventions remain visible; complete assumptions stay in JSON. Rows are chronological, not a proportional time scale. This visual correction replaces the initially implemented two-container layout following user review.

This is a presentation choice to validate with a rendered bread-dough fixture and the existing apple-cake example, not a commitment to project-management UI. If exact Gantt features obstruct readability, a two-group relative-time flow layout is acceptable provided all specification behaviors remain visible.

**Alternative:** Put time-scaled bars and all ingredient/state nodes into the existing graph. Rejected because it makes the execution guide harder to scan and changes an already useful view.

### 5. Additional artifacts, existing outputs preserved

Write `<stem>.timeline.json`, `<stem>.timeline.mmd`, `<stem>.timeline.svg`, and `<stem>.timeline.png` in the configured output directory. Keep `.recipe.json`, `.ingredients.txt`, `.mmd`, `.svg`, and `.png` unchanged for identical accepted analysis and graph settings. Reuse the installed renderer and the existing safe image-pair publication approach, with distinct graph/timeline destinations.

Write and await existing outputs first, then enrich/plan/render the additional view. Report overall success only after all outputs finish. If enrichment or timeline rendering fails, report a nonzero failure but retain the successfully produced current original outputs. Remove only this recipe's stale/failing timeline images and temporary timeline files; leave unrelated recipes and original images untouched. Available current timeline text/JSON remains inspectable. Never silently reuse old timeline images. This preserves the established graph-render-failure contract while making additive-view failure explicit.

## Risks / Trade-offs

- [Estimates differ from an individual's pace] → Mark estimated rows and all suggested offsets, use approximate totals, and preserve readiness checks.
- [A passive step actually needs attention] → Use conservative attention classification and explicit intervention fixtures.
- [An incomplete recipe produces false certainty] → Preserve unknowns, disclose excluded/unknown cooling or resting phases, and withhold a complete total when necessary.
- [Additional LLM latency/cost] → Separate cached enrichment through the existing client; pure scheduling and rendering need no extra completion.
- [Large images become hard to scan] → Keep ingredient/state graph nodes out of the timeline, use concise labels, and manually inspect representative PNG/SVG outputs.
- [Duration ranges shift intervention times] → Label offsets as suggestions and retain event-relative instructions such as “45 minutes after baking starts”.

## Migration Plan

Implement tests first, then planning contracts/enrichment, scheduler, rendering, and workflow integration. Run impact analysis before editing any existing symbol. Add documentation in `docs/` with `_de`/`_en` suffixes and short README links. No analysis-cache migration is needed. Rollback removes the additive planning call and timeline exports without deleting existing analysis or graph files. Do not modify unrelated pending changes.

## Open Questions

- Exact label density and visual spacing should be settled by reviewing generated bread and cake images; no extra user-facing scheduling features are implied.
- Estimation defaults should initially be prompt-guided and fixture-tested, not expanded into a configurable catalog of kitchen skills or appliances.
