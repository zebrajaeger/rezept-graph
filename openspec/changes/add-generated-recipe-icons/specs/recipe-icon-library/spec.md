## ADDED Requirements

### Requirement: Icon acquisition is explicitly configured
The system SHALL support optional icon modes `off`, `local-only`, and `generate-missing`. Omitted icon configuration SHALL behave as `off` without invalidating existing configurations. Library/report paths SHALL resolve relative to the configuration file. Generation SHALL use the Codex command-line agent as the initial backend behind a replaceable generator interface, with independent executable/profile settings and finite resource limits. Authentication SHALL remain managed by Codex without copying credentials or changing global Codex configuration. No direct image API configuration SHALL be required for this backend. Generation-only fields SHALL be required only in generation mode; explicitly invalid settings SHALL produce configuration errors. A local image model/container backend SHALL remain outside this change.

#### Scenario: Existing configuration is unchanged
- **WHEN** a valid existing configuration contains no icon section
- **THEN** analysis retains icon-free behavior and makes no image-generation requests

#### Scenario: Local-only use needs no image credentials
- **WHEN** icons use local-only mode without generator settings
- **THEN** valid local assets can be reused without contacting an image provider

#### Scenario: Library path is relative
- **WHEN** the CLI runs from a directory different from the configuration file's directory
- **THEN** relative icon paths still resolve against the configuration file's directory

#### Scenario: Generation configuration is incomplete
- **WHEN** generation mode lacks required provider settings or an explicitly configured field is invalid
- **THEN** configuration loading reports actionable validation errors before generation

### Requirement: Motifs have conservative stable identities
The icon component SHALL resolve ingredient/process concepts to safe namespaced identifiers independently of provider transport and graph rendering. Supported aliases SHALL share an identity. It SHALL NOT use a simple substring match that conflates distinct compound ingredients, assume ingredient and node IDs are linked, or infer a device solely from temperature. Ambiguous requests SHALL return an unavailable reason; intermediate-state nodes SHALL NOT request icons in this version. Asset paths SHALL remain confined to the configured library.

#### Scenario: Singular and plural share one motif
- **WHEN** supported requests refer to Ei and Eier
- **THEN** they resolve to the same ingredient motif and reusable asset

#### Scenario: Compound ingredient is distinct
- **WHEN** a request refers to Ei-Ersatz or Apfelsaft
- **THEN** it does not resolve to the plain egg or raw apple motif by substring matching

#### Scenario: Explicit action supports process illustration
- **WHEN** a process explicitly matches a supported baking action
- **THEN** it can resolve to the oven motif, whereas a temperature without a supported action does not establish an oven motif

#### Scenario: Request contains unsafe path text
- **WHEN** a concept includes traversal characters or path separators
- **THEN** it cannot cause asset reads or writes outside the library

### Requirement: Codex generation uses a verified bounded process contract
The initial generator adapter SHALL invoke an installed Codex CLI through a verified noninteractive image-generation workflow. Codex's version-reviewed internal image writer MAY save to its configured `generated_images` cache as an explicit trusted-client exception; this SHALL NOT be represented as OS-enforced staging confinement. Agent command write access SHALL remain restricted to operation-specific staging without blanket sandbox/approval bypass or repository write permissions. The application, not the agent, SHALL validate and copy an unambiguously session-correlated cache PNG into its designated staging destination before publication. Cache originals SHALL remain untouched. Invocation SHALL use a tested platform-safe executable/argument strategy without shell interpolation of recipe text, bounded diagnostics, finite timeout, and process-tree termination on timeout/cancellation. Missing CLI, unavailable image capability/authentication, process errors, successful exits without a valid artifact, ambiguous candidates, and paths outside the verified cache/session boundary SHALL yield unavailable results rather than recipe failure. The adapter SHALL NOT silently substitute another generator. Local-only/off modes SHALL NOT launch Codex. Automated tests SHALL substitute a process runner and SHALL NOT invoke live Codex or paid generation.

Session identity SHALL come from validated structured CLI events, not agent prose. For a fresh session, the adapter MAY select exactly one regular PNG from the precisely derived session cache directory after process completion, provided freshness, exclusive operation ownership, path confinement, link/reparse-point handling, bounded enumeration, and file-identity checks are proven. Zero or multiple candidates SHALL be rejected; scanning the whole cache or selecting the newest file SHALL NOT be used. If `exec` cannot satisfy these checks, a separately verified structured app-server image-event contract MAY be used instead. Neither transport SHALL be assumed proven by this requirement. Prompt instructions SHALL NOT be treated as enforcement of filesystem restrictions or image-call budgets.

#### Scenario: Codex produces the designated image
- **WHEN** the verified Codex workflow finishes and the application correlates, validates, and copies its cache PNG into the designated staging destination
- **THEN** the image can be published through the library's normal bundle contract

#### Scenario: Text success is not image success
- **WHEN** Codex exits successfully but provides only text, an out-of-boundary artifact path, ambiguous cache candidates, or no usable PNG
- **THEN** acquisition returns unavailable and no valid asset is published

#### Scenario: Codex uses its internal image cache
- **WHEN** the version-reviewed internal writer saves an image in the verified cache/session boundary
- **THEN** the application validates and copies it to operation-owned staging without modifying the original or claiming that the command sandbox confined the internal writer

#### Scenario: Multiple images exist in the fresh session
- **WHEN** session-directory acquisition finds more than one PNG candidate
- **THEN** acquisition returns unavailable rather than choosing by modification time or agent text

#### Scenario: Codex capability is unavailable
- **WHEN** the executable, authentication, or supported image-generation workflow is unavailable
- **THEN** acquisition reports an actionable prerequisite and preserves text-only recipe output without using another backend

#### Scenario: Prompt contains shell-special characters
- **WHEN** a concept or workspace path includes spaces or shell-special characters
- **THEN** those values remain data and cannot become shell commands or escape staging write restrictions

#### Scenario: Agent exceeds its time budget
- **WHEN** the Codex invocation times out or is cancelled
- **THEN** its launched process tree is stopped and no partial image is published

### Requirement: Usable local bundles are reused
The library SHALL persist Git-friendly motif bundles containing image bytes and versioned metadata with relative references. Availability SHALL require supported consistent metadata and a readable, bounded, decodable PNG matching its recorded checksum. Metadata SHALL document canonical identity, dimensions, MIME type, creation time, generator backend and CLI version, requested/reported agent model, generation prompt/style version, and the configured usage-terms reference without secrets. The underlying image model SHALL be recorded only when verifiably reported, otherwise explicitly marked unknown, and SHALL NOT be inferred from the agent model. Existing valid assets SHALL be reused despite later prompt/model changes. Unmanaged or inconsistent files SHALL NOT be silently adopted or overwritten.

#### Scenario: Cached motif is requested again
- **WHEN** a valid saved egg bundle is requested in a later run
- **THEN** the same image bytes are returned without an image-generation request

#### Scenario: Style prompt changes
- **WHEN** a usable existing bundle was generated with an older prompt version
- **THEN** it remains reusable without automatic regeneration

#### Scenario: Library is cloned to another machine
- **WHEN** image and metadata are copied to a different absolute project location
- **THEN** relative references still resolve without machine-specific metadata edits

#### Scenario: User file differs from its metadata
- **WHEN** an asset checksum mismatches or a file is unmanaged
- **THEN** the library reports a cache miss and preserves the existing files rather than replacing them destructively

### Requirement: Missing assets are generated on demand when enabled
In `generate-missing` mode, the component SHALL attempt to generate and persist a technically valid missing motif before returning it for current use. A metadata-only entry, missing metadata, unsupported/malformed metadata, missing image, or invalid image SHALL NOT count as an available asset. Replacement of conflicting bundles SHALL use a new safe revision without destroying existing files. Publication SHALL expose only validated assets, metadata last, and recover from incomplete publication as a cache miss. Concurrent same-motif requests within one process SHALL share acquisition, and each motif SHALL have at most one provider attempt per run. `local-only` mode SHALL never generate.

The application SHALL launch at most one bounded Codex session per motif per program run, without application-level automatic retries. Concurrent requests SHALL share that session. This is NOT a guarantee of one underlying image-service request: Codex may make repeated image requests internally, including failed attempts that leave no PNG. Timeout and resource limits bound the session, not its monetary cost. This limitation SHALL be disclosed when documenting generation mode.

#### Scenario: First egg request generates an asset
- **WHEN** generation is enabled and no egg bundle exists
- **THEN** one valid egg image and metadata are saved and the current request receives that image
- **AND** subsequent requests reuse it

#### Scenario: Git clone contains metadata but no image
- **WHEN** egg metadata exists but its referenced image is absent
- **THEN** generation mode attempts repair and local-only mode returns unavailable without network access

#### Scenario: Corrupt asset is replaced safely
- **WHEN** an existing image cannot be decoded or contradicts its metadata
- **THEN** generation mode can publish a valid replacement revision while preserving the conflicting files

#### Scenario: Two requests arrive together
- **WHEN** two in-process requests need the same missing motif
- **THEN** they share at most one bounded Codex session and use the same published result

#### Scenario: Publication is interrupted
- **WHEN** acquisition leaves only incomplete staging files or an incomplete bundle
- **THEN** lookup does not return that bundle as usable and later requests can recover according to mode

### Requirement: Generation uses a versioned recognition-oriented prompt
Generation SHALL combine a centrally versioned style prompt with a delimited motif description. The style SHALL request colored schematic factual illustrations with strong contours, a clear silhouette, few distinguishing details, a centered motif, an uncluttered background, and recognition at small display sizes. It SHALL discourage photorealism, text, branding, faces, and decoration. Generated assets SHALL pass technical format, decoding, dimension, and byte-limit checks before use. Technical acceptance SHALL NOT be presented as human approval, measured recognizability, or legal clearance.

#### Scenario: Generator receives an egg request
- **WHEN** a missing egg motif is generated
- **THEN** the request includes both the common recognition criteria and egg-specific concept description
- **AND** metadata records the prompt and style version used

#### Scenario: Provider returns unusable content
- **WHEN** an image response is malformed, unsupported, oversized, or undecodable
- **THEN** it is not published or used as a valid asset

### Requirement: Unmet demand is reported without failing recipes
In enabled modes the system SHALL produce a deduplicated per-run unmet-demand report containing motif/phrase, reason, occurrence count, and a recipe reference. Unresolved concepts, local-only misses, provider failures, and storage failures SHALL result in an explicit unavailable result and text-only fallback with a warning where actionable. Successful repairs SHALL NOT remain unmet entries. Provider calls SHALL have finite timeout/resource limits; secrets SHALL NOT appear in reports, metadata, or diagnostics. A report write failure SHALL warn without failing recipe output. Icon failures SHALL NOT swallow graph-renderer failures.

#### Scenario: Provider is unavailable
- **WHEN** icon generation times out or returns an error
- **THEN** the recipe still renders without that icon and the unmet request is reported without credentials

#### Scenario: Repeated local-only misses occur
- **WHEN** the same unavailable motif is requested multiple times during one run
- **THEN** one report entry records its occurrence count instead of duplicate entries

#### Scenario: Report location cannot be written
- **WHEN** writing the unmet-demand report fails
- **THEN** the CLI emits a warning and does not fail an otherwise successful recipe
