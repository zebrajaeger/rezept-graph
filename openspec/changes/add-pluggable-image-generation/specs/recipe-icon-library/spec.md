## MODIFIED Requirements

### Requirement: Icon acquisition is explicitly configured
The system SHALL support optional icon modes `off`, `local-only`, and `generate-missing`. Omitted icon configuration SHALL behave as `off` without invalidating existing configurations. Library/report paths SHALL resolve relative to the configuration file. Generation SHALL use an explicitly selected Codex CLI or ComfyUI backend behind a replaceable generator interface, with provider-specific settings and finite resource limits. Existing valid Codex settings SHALL remain compatible. Codex authentication SHALL remain managed by Codex without copying credentials or changing global Codex configuration, and no direct image API configuration SHALL be required for that backend. ComfyUI SHALL require an explicit endpoint, validated operator-owned workflow and bindings, usage-terms reference, and bounded transport settings; workflow paths SHALL resolve relative to the configuration file. Generation-only fields SHALL be required only in generation mode; explicitly invalid settings SHALL produce configuration errors. The application SHALL NOT provision local models, containers or services automatically.

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

#### Scenario: ComfyUI is explicitly configured
- **WHEN** valid ComfyUI settings are selected in generation mode
- **THEN** image requests use that endpoint and workflow without launching Codex or provisioning the service

### Requirement: Usable local bundles are reused
The library SHALL persist Git-friendly motif bundles containing image bytes and versioned metadata with relative references. Availability SHALL require supported consistent metadata and a readable, bounded, decodable PNG matching its recorded checksum. Metadata SHALL document canonical identity, dimensions, MIME type, creation time, generation prompt/style version, and the configured usage-terms reference without secrets. New metadata SHALL use provider-neutral provenance recording backend, verified runtime version when available, requested/reported model and generation settings as distinct facts, and a ComfyUI workflow digest where applicable. Reported image-model identity SHALL be recorded only when verifiably reported, otherwise explicitly marked unknown; it SHALL NOT be inferred from an agent model or checkpoint filename. Existing supported Codex bundle metadata SHALL remain readable without rewriting files or inventing missing fields. Existing valid assets SHALL be reused despite later prompt/model/provider/workflow changes. Unmanaged or inconsistent files SHALL NOT be silently adopted or overwritten.

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

#### Scenario: Provider changes with old assets present
- **WHEN** ComfyUI is selected and a valid legacy Codex bundle already exists
- **THEN** its original bytes and metadata are reused without generation or metadata rewriting

### Requirement: Missing assets are generated on demand when enabled
In `generate-missing` mode, the component SHALL attempt to generate and persist a technically valid missing motif before returning it for current use. A metadata-only entry, missing metadata, unsupported/malformed metadata, missing image, or invalid image SHALL NOT count as an available asset. Replacement of conflicting bundles SHALL use a new safe revision without destroying existing files. Publication SHALL expose only validated assets, metadata last, and recover from incomplete publication as a cache miss. Concurrent same-motif requests within one process SHALL share acquisition, and each motif SHALL have at most one provider attempt per run. `local-only` mode SHALL never generate.

The application SHALL submit at most one bounded provider operation per motif per program run, without application-level automatic retries or fallback to another provider. For Codex this means at most one bounded session; for ComfyUI this means at most one job submission. Concurrent requests SHALL share that operation. This is NOT a guarantee of one underlying image-service request: Codex may make repeated image requests internally, including failed attempts that leave no PNG. Timeout and resource limits bound local waiting/session execution, not monetary cost or guaranteed termination of a remote running job. These limitations SHALL be disclosed when documenting generation mode.

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
- **THEN** they share at most one bounded operation of the selected provider and use the same published result

#### Scenario: Publication is interrupted
- **WHEN** acquisition leaves only incomplete staging files or an incomplete bundle
- **THEN** lookup does not return that bundle as usable and later requests can recover according to mode
