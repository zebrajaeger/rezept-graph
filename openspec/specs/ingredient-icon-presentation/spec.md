# ingredient-icon-presentation Specification

## Purpose
TBD - created by archiving change add-semantic-ingredient-icons. Update Purpose after archive.
## Requirements
### Requirement: Icons supplement existing node containers
Ingredient icons SHALL appear inside the existing green stadium-shaped node, on the left of the complete text. Icons SHALL NOT replace the node with an image rectangle or place labels beneath the node. Existing classes, connections and text-only shapes SHALL remain intact. SVG SHALL embed native image elements without foreignObject or external resources; PNG SHALL rasterize the same completed SVG. Insufficient space or invalid icons SHALL retain text-only rendering.

#### Scenario: Ingredient with icon
- **WHEN** an ingredient has a valid icon
- **THEN** its green rounded container encloses both a left-hand icon and right-hand text with no overlap

### Requirement: Ingredient state participates in motif identity
The system SHALL distinguish ingredient identity from its culinary state and depicted form. Egg motifs SHALL distinguish raw, boiled and fried states; a raw default illustration SHALL explicitly depict a whole raw chicken egg with intact shell. A boiled or fried egg SHALL NOT substitute for a raw egg, including count badges and group fallbacks. Group variants SHALL retain the same state as their base. Existing state-unspecified bundles SHALL NOT automatically acquire a state through a metadata rewrite or prompt change; they SHALL remain preserved until explicitly reviewed. Unsupported or unavailable states SHALL retain text. New state-specific generation SHALL require the existing explicit generation policy and separate authorization for trial sessions.

#### Scenario: Existing egg depicts a cooked half
- **WHEN** the available legacy egg base depicts a cut boiled egg but the recipe requests raw eggs
- **THEN** it is not reused as the raw base or badge fallback and the original is preserved

#### Scenario: Raw group has been visually inspected
- **WHEN** an existing three-egg group is explicitly reviewed as three whole raw eggs
- **THEN** an offline recipe preview can reuse it for that exact case without claiming that other egg assets share its state

#### Scenario: Explicit cooked ingredient
- **WHEN** a recipe requests a boiled egg or fried egg and no matching state-specific asset is available
- **THEN** full text remains instead of substituting a raw or differently cooked egg

### Requirement: Ingredient recognition takes priority over quantity depiction
The presentation layer SHALL retain the ingredient's canonical base identity independently of quantity and preserve original labels, quantities and recipe facts. Only exact positive integer egg piece counts SHALL select group variants in the initial release. Unspecified, fractional, unsupported or conflicting quantities SHALL NOT be rounded or invented. Other ingredients SHALL use base motifs and existing quantity text.

#### Scenario: Weight does not create a new motif
- **WHEN** a supported ingredient is labeled `250 g Butter`
- **THEN** presentation uses the butter base identity and unchanged quantity text without requesting a 250-gram image

#### Scenario: Fractional or unknown egg quantity
- **WHEN** an egg quantity is missing or fractional
- **THEN** the base motif is used if available without asserting an exact whole-egg count

### Requirement: Egg quantity variants have a finite generation boundary
One egg SHALL reuse the egg base asset. Exact counts two through five SHALL permit on-demand reusable group variants; the system SHALL NOT pre-generate unrequested counts. Counts above five SHALL use a base asset with a renderer-owned exact number badge and SHALL NOT request a count-specific generated image. Missing or failed group variants SHALL fall back to base plus number when available, otherwise full text. Existing generation modes, deduplication and bounded-session contracts SHALL apply.

#### Scenario: Three eggs reuse a group variant
- **WHEN** three eggs are requested repeatedly with generation enabled
- **THEN** only the requested missing three-egg variant can acquire one bounded session per run and subsequent uses reuse its bundle
- **AND** two-, four- and five-egg variants are not generated speculatively

#### Scenario: Six eggs require no six-egg image
- **WHEN** six or twelve eggs are requested
- **THEN** the same base asset is combined with the respective renderer-owned number and no count-specific image session occurs

#### Scenario: Group variant unavailable offline
- **WHEN** three eggs are requested in local-only mode and only the base bundle exists
- **THEN** the base with number three is displayed without a network request

### Requirement: Alternatives are composed without implying a mixture
The system SHALL support individual butter and margarine motifs and their alternative by composing the individual images with renderer-owned “oder” text. Reversing alternative order SHALL reuse the same normalized composition identity. The system SHALL NOT generate a separate alternative image or collapse the alternative into a single ingredient. Missing components SHALL preserve the complete text rather than display a misleading single-choice icon. Mixtures SHALL NOT be presented as alternatives.

#### Scenario: Reversed alternative reuses components
- **WHEN** `Butter oder Margarine` and `Margarine oder Butter` are presented
- **THEN** the same component bundles and normalized composition are reused with an explicit alternative marker and unchanged original labels

#### Scenario: Mixture or missing component
- **WHEN** the phrase is `Butter und Mehl` or one alternative component is unavailable
- **THEN** full text remains without an incorrect alternative or single-choice depiction

### Requirement: Derived presentations preserve portable rendering and cache contracts
Compositions and badges SHALL be rendered locally, retain existing image-size/byte and Mermaid limits, and use derivative cache identities containing component checksums, normalized quantity/relation and layout version along with existing runtime inputs. They SHALL NOT be stored as generated originals. Presentation failures SHALL retain text without swallowing fatal graph-renderer errors. Source recipe JSON and timeline semantics SHALL remain unchanged.

#### Scenario: Different badge does not reuse the wrong derivative
- **WHEN** the same egg base is displayed for six and twelve eggs
- **THEN** correct distinct badge derivatives are produced and reused offline without additional generated originals

### Requirement: A bounded visual trial records user feedback
The change SHALL provide an offline-tested contact sheet and graph excerpt covering butter, margarine, their alternative, three eggs and six eggs at actual display size with enlarged previews. A live trial SHALL require separate explicit authorization of missing motifs and a maximum number of new generator sessions; preparation SHALL NOT start paid generation. The trial SHALL record user feedback on ingredient recognition, alternative meaning, count accuracy and badge legibility; technical validation alone SHALL NOT imply visual approval.

#### Scenario: Trial preparation is offline
- **WHEN** the trial output is tested automatically or prepared without live authorization
- **THEN** only local/injected images are used and no paid provider is launched

#### Scenario: Human inspection rejects a group image
- **WHEN** the user finds an incorrect count or unreadable alternative at actual size
- **THEN** the issue and follow-up decision are recorded instead of declaring visual acceptance from successful PNG rendering
