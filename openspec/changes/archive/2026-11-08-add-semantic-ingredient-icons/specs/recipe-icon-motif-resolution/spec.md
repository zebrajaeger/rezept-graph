## MODIFIED Requirements

### Requirement: Ambiguity and identity-changing compounds are preserved
The deterministic resolver SHALL abstain rather than collapse unsupported alternatives, mixtures, negations, compounds or unknown qualifiers into a supported motif. An explicitly enabled semantic interpreter SHALL resolve supported unambiguous alternatives only into a validated alternative descriptor, never into a single component motif. Unsupported or conflicting interpretations SHALL retain text. The system SHALL NOT infer identity from IDs, unrestricted substring matches, or stripping arbitrary suffixes. Unsafe path-like or over-limit text SHALL NOT yield a motif.

#### Scenario: Ingredient alternatives
- **WHEN** labels include `125 g weiche Margarine oder Butter` or `50 g Zucker oder Zimtzucker zum Bestreuen`
- **THEN** no single butter or sugar motif is selected
- **AND** the supported butter/margarine alternative can produce a structured alternative descriptor only when semantic interpretation is explicitly enabled or a valid cached interpretation is allowed; unsupported alternatives remain text

#### Scenario: Related term is a different ingredient
- **WHEN** labels include `Ei-Ersatz`, `Apfelsaft`, `Butter und Mehl` or `Etwas Fett für die Form`
- **THEN** the resolver retains text-only fallback instead of selecting egg, apple, butter or flour by substring

### Requirement: Realistic icon resolution is verified through portable outputs offline
An automated acceptance test SHALL exercise a sanitized fixture based on the observed apple-cake labels through motif resolution, acquisition, display caching and real graph rendering without live providers. Expected supported nodes SHALL contain visible icons in SVG and PNG; ambiguous/unsupported nodes SHALL retain text-only behavior unless a supported validated alternative is explicitly enabled. Same-motif requests SHALL retain existing acquisition deduplication. Recipe JSON, ingredient text, labels, details, cues, edges, off/local-only behavior, original bundles and timeline semantics SHALL remain compatible with existing contracts. Enabled quantity/alternative presentations SHALL receive additional offline acceptance coverage with injected interpretations and assets.

#### Scenario: Apple-cake regression fixture renders
- **WHEN** the realistic fixture is processed with an injected PNG generator and the local renderer without semantic interpretation
- **THEN** supported motifs are actually embedded and visibly rendered instead of producing a successful zero-icon graph
- **AND** deliberate nonmatches and unchanged recipe/ingredient bytes are asserted

#### Scenario: Repeated motifs reuse one asset
- **WHEN** multiple recognized nodes request the same motif
- **THEN** existing shared acquisition and derivative reuse apply without additional per-node generation sessions

#### Scenario: Enabled alternative renders offline
- **WHEN** the realistic fixture uses an injected valid butter/margarine descriptor and local component assets
- **THEN** its composed alternative is rendered in SVG and PNG without live providers or recipe fact changes

## ADDED Requirements

### Requirement: Optional semantic interpretation produces bounded validated ingredient meaning
The system SHALL support independently configured opt-in semantic interpretation through the existing OpenAI-compatible completion abstraction for otherwise unresolved ingredient labels. It SHALL prefer deterministic supported identity and reliably associated structured ingredient fields. It SHALL NOT assume ingredient IDs and graph node IDs match. Interpretation SHALL return a bounded schema-validated single-concept or alternative descriptor using curated canonical identities, optional exact quantity/unit and supported qualifiers, rather than paths, rendering instructions or arbitrary image prompts. Initial supported identities SHALL include margarine. Unsupported identities, negations, mixtures, malformed responses, conflicting facts and unavailable providers SHALL abstain without failing the recipe. Model confidence alone SHALL NOT establish validity. Input/output, request duration and attempts SHALL be bounded, with at most one application request per distinct interpretation input per run and no automatic retries.

#### Scenario: Complex known ingredient phrase
- **WHEN** an unresolved phrase explicitly describes soft margarine and semantic interpretation is enabled
- **THEN** a valid margarine descriptor can select the canonical margarine base motif without changing the original phrase

#### Scenario: Untrusted output cannot choose assets
- **WHEN** the model returns a path, unknown identity, invalid schema or instructions instead of a supported descriptor
- **THEN** the response is rejected and text fallback remains without arbitrary file access or image generation

#### Scenario: Missing association does not borrow quantity
- **WHEN** a graph node cannot be reliably associated with a structured ingredient entry
- **THEN** no quantity is borrowed through guessed IDs or list position and interpretation uses only the node's own bounded context

### Requirement: Semantic interpretation preserves opt-in and offline operation
Semantic interpretation SHALL be disabled by default and SHALL use independent model/connection settings when enabled. Icons off SHALL bypass semantic work entirely. Local-only SHALL NOT call a semantic provider; it SHALL use deterministic recognition and, when enabled, validated cached interpretations or retain fallback on a cache miss. Valid interpretations SHALL be cached and deduplicated using input/context, schema/prompt version and model configuration identity without secrets. Provider failures and rejected responses SHALL remain nonfatal and SHALL NOT overwrite valid image bundles. Disabling interpretation SHALL preserve legacy recognition.

#### Scenario: Local-only cache miss
- **WHEN** an unresolved phrase has no valid semantic cache entry in local-only mode
- **THEN** no model or image provider is contacted and existing fallback remains

#### Scenario: Repeated phrase reuses validated interpretation
- **WHEN** the same interpretation input and configuration are encountered again with a valid cached descriptor
- **THEN** no new semantic request occurs and the descriptor is revalidated before use

#### Scenario: Configuration or schema changes
- **WHEN** interpretation schema, prompt or model configuration identity changes
- **THEN** incompatible cached interpretations are not silently reused and local-only remains network-free
