## ADDED Requirements

### Requirement: Prompt-to-image has a provider-neutral asynchronous contract
The backend SHALL expose a provider-neutral asynchronous image-generation contract accepting a prompt, application-owned staging destination, cancellation signal, and optional supported dimensions/seed. It SHALL return either one technically validated PNG with provenance or a typed unavailable result. Provider adapters SHALL NOT own recipe interpretation, motif identities, prompt policy, library publication, or rendering. Unsupported explicit options SHALL be rejected before provider submission.

#### Scenario: Same caller uses either provider
- **WHEN** an icon request selects Codex or ComfyUI
- **THEN** the same icon-facing contract supplies a validated staging PNG or an unavailable result without provider branches in recipe logic

#### Scenario: Requested control is unsupported
- **WHEN** a caller explicitly requests a size or seed that the selected adapter cannot enforce
- **THEN** it receives an unsupported-option result before submission rather than a false claim of compliance

### Requirement: Provider selection is explicit and backward compatible
The system SHALL support explicitly selected `codex-cli` and `comfyui` providers using separately validated settings and a single provider factory. It SHALL preserve existing valid Codex configuration, credential ownership, bounded process execution, cache acquisition, and security restrictions. It SHALL NOT execute arbitrary configured shell templates or automatically fall back to another provider. Off/local-only icon modes SHALL NOT construct active provider transports or start processes, submissions, or capability probes.

#### Scenario: Existing Codex settings are reused
- **WHEN** a previously valid Codex generation configuration is loaded
- **THEN** it retains its existing behavior without ComfyUI settings or credential migration

#### Scenario: Selected service is unavailable
- **WHEN** ComfyUI cannot be reached
- **THEN** the request becomes unavailable without starting Codex or another backend

### Requirement: ComfyUI uses a validated operator-owned workflow
The ComfyUI adapter SHALL validate an operator-owned API workflow, explicit typed input bindings and designated output node before submission. Prompt text SHALL remain data in the parsed workflow. The adapter SHALL submit at most once, track the returned prompt identifier, inspect that job's structured execution status, and acquire exactly one image from the configured output node through the configured origin. It SHALL reject missing, failed or ambiguous outputs and SHALL NOT accept another job's image or textual success as proof of generation.

#### Scenario: A workflow produces its expected image
- **WHEN** the submitted job succeeds and its designated output node identifies one image
- **THEN** that image is downloaded, validated and copied to the application-owned staging destination

#### Scenario: Workflow bindings are invalid
- **WHEN** configured bindings reference absent nodes or incompatible fields
- **THEN** an actionable configuration error occurs before any job is submitted

#### Scenario: Job outputs are ambiguous
- **WHEN** the designated output node identifies multiple images or no image
- **THEN** no candidate is guessed or published

### Requirement: Generation lifecycle and resource consumption are bounded
The adapter SHALL enforce finite end-to-end deadlines including admission wait, bounded polling/response/download resources, and one active ComfyUI job per provider instance within a process. It SHALL stop local waiting and I/O on cancellation, clean operation-owned partial files, and avoid automatic retries after uncertain submission outcomes. Remote cancellation SHALL target only the owned job where supported; it SHALL NOT interrupt unrelated jobs. Documentation SHALL disclose that an already running remote job may continue and that admission control is not a cross-process GPU lock.

#### Scenario: Concurrent local requests arrive
- **WHEN** two requests use the same ComfyUI provider instance
- **THEN** the second waits within its deadline rather than immediately submitting concurrent GPU work

#### Scenario: Cancellation occurs on a shared service
- **WHEN** the caller cancels an active request
- **THEN** local polling/download stops, no partial image is published, and no global service interrupt is issued

#### Scenario: Submission response is lost
- **WHEN** the network fails after submission may have reached the service
- **THEN** the adapter reports failure without automatically submitting a duplicate

### Requirement: External endpoints and artifacts have explicit trust boundaries
ComfyUI endpoints SHALL be operator-configured, with HTTP permitted only for explicit loopback destinations and HTTPS required for remote destinations. URL credentials/query/fragment, cross-origin redirects, arbitrary artifact URLs and unsafe image selectors SHALL be rejected. Secrets SHALL come from environment references and SHALL NOT appear in diagnostics or metadata. Downloads SHALL be bounded and validated as decodable PNGs before success; provider filenames SHALL NOT select local output paths.

#### Scenario: Returned artifact selector contains traversal
- **WHEN** an output contains a filename/subfolder that escapes the supported selector boundary
- **THEN** it is rejected without writing outside the request's staging destination

#### Scenario: Response is not an acceptable PNG
- **WHEN** a service returns HTML, malformed PNG, excessive bytes or excessive dimensions
- **THEN** it returns an artifact failure without library publication

### Requirement: Provenance distinguishes requested and verified facts
Generation results SHALL identify the backend, verified adapter/runtime version when available, requested controls, reported effective controls when verified, and reported image-model identity or explicit unknown. ComfyUI results SHALL include a workflow digest and requested checkpoint reference when configured. The adapter SHALL NOT infer model identity from an agent model or checkpoint filename, fabricate a CLI version, or claim seed-based reproducibility across engines. Operating documentation SHALL explain model files, runtime/pipeline, GPU prerequisites, container packaging, endpoint trust and manual smoke-test authorization.

#### Scenario: Model identity is not reported
- **WHEN** the workflow names a checkpoint but the service cannot verify the actual model identity
- **THEN** provenance records the requested checkpoint separately and marks the reported model unknown
