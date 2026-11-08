# single-person-cooking-timeline Specification

## Purpose
TBD - created by archiving change add-single-person-cooking-timeline. Update Purpose after archive.
## Requirements
### Requirement: Planning input preserves recipe evidence and marks estimates
The system SHALL create validated planning inputs linked to existing recipe processing nodes without requiring changes to previously valid recipe analysis. Every planned duration SHALL preserve its recipe evidence or be explicitly marked estimated with a rationale. Unknown durations SHALL remain explicitly unknown. Readiness conditions, temperatures, and source cooking durations SHALL NOT be removed or shortened to improve the schedule.

#### Scenario: Preparation time is missing
- **WHEN** a preparation step has no duration in the recipe but a reasonable estimate can be supplied
- **THEN** planning includes a numeric estimated duration or range, its rationale, and an estimated marker visible in the cooking view
- **AND** it does not present that estimate as a recipe instruction

#### Scenario: Recipe provides a time range and readiness condition
- **WHEN** the recipe says to let dough rise for 30–45 minutes until doubled
- **THEN** planning preserves the range, recipe provenance, and volume condition
- **AND** completion by the suggested time is not presented as guaranteed

#### Scenario: Duration cannot be estimated responsibly
- **WHEN** a necessary phase has neither a source duration nor a defensible estimate
- **THEN** the view marks the duration and affected downstream offsets as uncertain
- **AND** it does not treat the phase as zero-duration or claim a complete numeric total

#### Scenario: Existing analysis is cached
- **WHEN** an existing valid analysis contains no planning fields
- **THEN** it remains accepted and its graph outputs remain usable
- **AND** planning enrichment uses its own cached request with recipe content and analysis as context

### Requirement: Planning accounts for every processing step
The system SHALL validate phase-to-process references, duration bounds, temporal dependency acyclicity, and coverage of every processing step. It SHALL report invalid or incomplete planning input rather than silently omit a process or fabricate a complete schedule.

#### Scenario: Enrichment omits or misreferences a process
- **WHEN** enrichment omits a processing node, references a nonexistent node, or introduces a dependency cycle
- **THEN** planning fails with an actionable validation error
- **AND** no successful timeline is reported

### Requirement: Schedule assumes one cook
The system SHALL produce a deterministic suggested schedule for exactly one person. Hands-on and continuously attended phases SHALL NOT overlap each other. Unattended phases SHALL be allowed to overlap independent work while all temporal prerequisites, including those mediated by intermediate states, remain satisfied. Ingredient availability alone SHALL NOT impose unnecessary sequential work.

#### Scenario: Work fits into dough rising time
- **WHEN** dough must rise unattended for 30 minutes and independent topping preparation takes an estimated 10 minutes
- **THEN** the plan places topping preparation during the rising phase where other prerequisites permit
- **AND** it schedules no second attention-demanding task concurrently with topping preparation

#### Scenario: A process requires supervision or timed intervention
- **WHEN** a phase requires continuous stirring or an intervention at a specified offset
- **THEN** the schedule reserves attention for stirring or explicitly schedules the intervention
- **AND** conflicting noninterruptible active work is placed outside that attention period
- **AND** supervised time is not described as free time

#### Scenario: Planning is repeated
- **WHEN** validated planning input is unchanged
- **THEN** phase order, relative offsets, totals, and Mermaid output are deterministic

### Requirement: Preheating is scheduled before oven use
The system SHALL model oven activation and preheating separately, place activation at a feasible point for one cook ahead of oven use, and identify any estimated preheating duration. The cooking view SHALL require actual oven readiness before inserting food.

#### Scenario: Preparation allows overlapping preheating
- **WHEN** preparation lasts long enough to overlap the estimated preheating duration
- **THEN** the plan shows when to switch on the oven during preparation rather than unnecessarily waiting until preparation ends
- **AND** preheating appears as a passive prerequisite of oven use

#### Scenario: Oven is not expected to be ready in time
- **WHEN** the earliest feasible oven activation leaves insufficient preheating time before the prepared food is ready
- **THEN** the plan shows waiting before oven use
- **AND** it does not shorten preheating or baking to hide that wait

### Requirement: Cooking view is glanceable and time-aware
The system SHALL provide a cooking view separate from the existing recipe graph, visually distinguishing the cook's actions from unattended processes using text as well as visual styling. It SHALL show approximate relative times, a suggested elapsed-time total or range when complete, hands-on time, attended-time needs, clear return-to-action cues, and concise instructions with relevant ingredient amounts, temperatures, and readiness conditions. Estimated rows and suggested scheduling SHALL be explicitly identified. The total SHALL state its completion endpoint and disclose excluded or unknown cooling/resting time.

#### Scenario: Cake needs action after 45 minutes of baking
- **WHEN** a recipe requires buttering the cake after 45 minutes and then baking another 5–10 minutes
- **THEN** the view prominently shows the return after 45 minutes, the buttering action and relevant amount, and the remaining baking phase
- **AND** the intervention remains understandable relative to baking start even if earlier estimated preparation takes longer

#### Scenario: Reader needs an overview
- **WHEN** a complete schedule contains estimated preparation and recipe-sourced passive durations
- **THEN** the reader can identify next actions, concurrent passive phases, approximate time until the named endpoint, and which durations are estimated without reopening the original recipe text
- **AND** calendar dates are not exposed as if they were cooking instructions

### Requirement: Additional timeline artifacts preserve existing outputs
The standard analysis command SHALL retain its existing five artifacts and additionally write `.timeline.json`, `.timeline.mmd`, `.timeline.svg`, and `.timeline.png` with the same recipe stem in the configured output directory. The JSON SHALL include validated planning inputs, evidence/provenance, schedule, assumptions, and uncertainty. Both timeline images SHALL represent the current timeline source. Existing graph presentation options SHALL NOT remove necessary phases from the cooking view.

#### Scenario: Analysis and planning succeed
- **WHEN** the standard analysis command completes successfully
- **THEN** all nine artifacts exist and their paths are reported only after awaited rendering
- **AND** the original five artifacts are unchanged for the same accepted analysis and graph settings

#### Scenario: Intermediate graph states are hidden
- **WHEN** graph rendering hides intermediate state nodes
- **THEN** the timeline retains all required temporal prerequisites and processing phases

### Requirement: Timeline failure is explicit and isolated
The system SHALL produce current original outputs before the additional planning stage and SHALL report enrichment, validation, scheduling, or timeline-rendering failure with a nonzero status. It SHALL retain successfully generated current original outputs and available current timeline text/JSON, remove failed or stale timeline images and timeline staging files for that recipe, and leave unrelated files untouched. It SHALL NOT report full recipe success or silently substitute an old timeline.

#### Scenario: Additional view fails after graph generation
- **WHEN** planning enrichment fails or the second timeline image cannot be rendered after the current original outputs were generated
- **THEN** the original five outputs remain available, neither final timeline image remains, and the command reports the failure
- **AND** no overall success is reported for that recipe and unrelated recipe files remain untouched
