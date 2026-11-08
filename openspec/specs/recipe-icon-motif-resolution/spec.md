# Recipe icon motif resolution

## Purpose

Resolve realistic recipe ingredient and action phrases conservatively into stable icon motifs without changing recipe facts. The icon-library implementation is tracked separately by add-generated-recipe-icons; its remaining security acceptance is not implied by this specification.

## Requirements

### Requirement: Supported ingredient phrases resolve without changing recipe facts
The system SHALL deterministically resolve supported quantity/unit/qualifier-bearing ingredient labels to the existing canonical motif keys. It SHALL include `3 Eier, Größe M` → `ingredients/egg`, `250 g Mehl` → `ingredients/flour`, `125 g Zucker für den Teig` → `ingredients/sugar`, `60 g Butter zum Bestreichen` → `ingredients/butter` and `1,5 kg Äpfel` → `ingredients/apple`. It SHALL retain bare aliases, normalize case/Unicode/spacing, bound parsing inputs, and leave labels and recipe facts unchanged. Accepted quantities, units and qualifiers SHALL be explicitly documented and tested.

#### Scenario: Quantity and recognized qualifier surround a known ingredient
- **WHEN** an ingredient node is labeled `3 Eier, Größe M`
- **THEN** it resolves to the same motif as `Eier` without changing its visible label or recipe data

#### Scenario: Decimal quantity and plural form
- **WHEN** an ingredient node is labeled `1,5 kg Äpfel`
- **THEN** it resolves to the existing apple motif

### Requirement: Ambiguity and identity-changing compounds are preserved
The resolver SHALL abstain rather than collapse unsupported alternatives, mixtures, negations, compounds or unknown qualifiers into a supported motif. It SHALL NOT infer identity from IDs, unrestricted substring matches, or stripping arbitrary suffixes. Unsafe path-like or over-limit text SHALL NOT yield a motif.

#### Scenario: Ingredient alternatives
- **WHEN** labels include `125 g weiche Margarine oder Butter` or `50 g Zucker oder Zimtzucker zum Bestreuen`
- **THEN** no single butter or sugar motif is selected

#### Scenario: Related term is a different ingredient
- **WHEN** labels include `Ei-Ersatz`, `Apfelsaft`, `Butter und Mehl` or `Etwas Fett für die Form`
- **THEN** the resolver retains text-only fallback instead of selecting egg, apple, butter or flour by substring

### Requirement: Explicit supported actions resolve in realistic phrases
The system SHALL recognize unambiguous supported baking/preheating/boiling/frying actions in complete process phrases, including timing prefixes. A nonempty explicit action field SHALL take precedence; the label SHALL be used when action is absent or blank. Device mentions or temperature alone SHALL NOT establish an action. Negated or conflicting supported actions SHALL yield no motif. Intermediate nodes SHALL never acquire motifs.

#### Scenario: Real baking descriptions
- **WHEN** process text is `Backofen vorheizen`, `Erste 45 Minuten backen` or `Kuchen fertig backen`
- **THEN** it resolves to the existing oven motif

#### Scenario: Device mention or conflicting action
- **WHEN** process text is `200 °C`, `Backofen reinigen`, `nicht backen` or `kochen oder braten`
- **THEN** no device motif is inferred

#### Scenario: Empty action uses label
- **WHEN** a process has a blank action field and the label `Backofen vorheizen`
- **THEN** its label supplies the supported action and the oven motif is selected

### Requirement: Realistic icon resolution is verified through portable outputs offline
An automated acceptance test SHALL exercise a sanitized fixture based on the observed apple-cake labels through motif resolution, acquisition, display caching and real graph rendering without live providers. Expected supported nodes SHALL contain visible icons in SVG and PNG; ambiguous/unsupported nodes SHALL retain text-only behavior. Same-motif requests SHALL retain existing acquisition deduplication. Recipe JSON, ingredient text, labels, details, cues, edges, off/local-only behavior, original bundles and timeline semantics SHALL remain compatible with existing contracts.

#### Scenario: Apple-cake regression fixture renders
- **WHEN** the realistic fixture is processed with an injected PNG generator and the local renderer
- **THEN** supported motifs are actually embedded and visibly rendered instead of producing a successful zero-icon graph
- **AND** deliberate nonmatches and unchanged recipe/ingredient bytes are asserted

#### Scenario: Repeated motifs reuse one asset
- **WHEN** multiple recognized nodes request the same motif
- **THEN** existing shared acquisition and derivative reuse apply without additional per-node generation sessions
