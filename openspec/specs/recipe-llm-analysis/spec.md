# recipe-llm-analysis Specification

## Purpose
TBD - created by archiving change add-recipe-url-graph-cli. Update Purpose after archive.
## Requirements
### Requirement: LLM provider is configurable
The system SHALL load OpenAI-compatible LLM settings from a config file. The supported settings SHALL include API root, model, timeout, and environment-based API key source, but SHALL NOT include a provider selector. All completions SHALL use the OpenAI-compatible chat completions protocol regardless of server vendor.

#### Scenario: Config contains connection settings
- **WHEN** the CLI starts with a valid config file without a provider field
- **THEN** the system uses the configured base URL, model, timeout, and API key source for LLM requests
- **AND** the normalized configuration contains no provider field

#### Scenario: Config is invalid
- **WHEN** required LLM settings are missing or invalid
- **THEN** the system reports a clear configuration error before analyzing recipes

#### Scenario: Legacy selector is present
- **WHEN** otherwise valid external JSON contains an obsolete `llm.provider` field with any value
- **THEN** the field is ignored like other unknown configuration fields and omitted from normalized settings
- **AND** it cannot change the transport or completion cache key

### Requirement: LLM transport is exclusively OpenAI compatible
The system SHALL send LLM completions exclusively through OpenAI-compatible chat completions. It SHALL append `/chat/completions` to the configured API root after trailing-slash normalization and SHALL NOT infer an API version suffix or use native Ollama `/api/chat` requests.

#### Scenario: Compatible server receives a completion
- **WHEN** a completion is requested with valid connection settings
- **THEN** the system sends a POST request to the configured API root followed by `/chat/completions`
- **AND** the JSON payload includes the configured model, messages, and `response_format` set to `{ "type": "json_object" }`
- **AND** authentication uses the configured environment variable when present
- **AND** the system extracts response content from `choices[0].message.content`

#### Scenario: Ollama is used through its compatible API
- **WHEN** the API root is `http://localhost:11434/v1`
- **THEN** the completion request targets `http://localhost:11434/v1/chat/completions`
- **AND** no request is sent to `/api/chat`

#### Scenario: Compatible request fails
- **WHEN** a completion times out, returns an unsuccessful HTTP status, or contains no usable message content
- **THEN** the system reports the corresponding failure without retrying through a vendor-specific protocol
- **AND** timeout resources are cleaned up

### Requirement: Response caching uses connection settings and messages
The system SHALL identify completion cache entries using base URL, model, and messages only, without a provider selector. Legacy keys containing a provider component SHALL NOT be migrated, reused as fallback, or automatically deleted.

#### Scenario: Completion is cached without a selector
- **WHEN** identical connection settings and messages are submitted repeatedly with caching enabled
- **THEN** the response is reused under a key derived from base URL, model, and messages only

#### Scenario: Legacy cache entries exist
- **WHEN** old cache entries containing `openai` or `ollama` provider components exist
- **THEN** the first completion under the new identity creates a new entry rather than reusing those entries
- **AND** subsequent identical requests reuse the new entry
- **AND** the legacy files remain untouched

### Requirement: Recipe analysis returns structured JSON
The system SHALL request structured JSON from the LLM for each recipe analysis.

#### Scenario: LLM returns valid recipe analysis
- **WHEN** the LLM response matches the expected recipe analysis schema
- **THEN** the system accepts the analysis for output generation

#### Scenario: LLM returns invalid recipe analysis
- **WHEN** the LLM response is not valid JSON or does not match the expected schema
- **THEN** the system reports a validation error and does not render graph output from that response

### Requirement: Ingredients are normalized when possible
The system SHALL represent ingredients with normalized quantity fields when possible while preserving original text.

#### Scenario: Ingredient amount can be normalized
- **WHEN** an ingredient line contains a parseable amount and unit
- **THEN** the analyzed ingredient includes name, quantity, unit, and original text

#### Scenario: Ingredient amount cannot be normalized
- **WHEN** an ingredient line cannot be confidently normalized
- **THEN** the analyzed ingredient preserves the original text and marks normalized fields as absent or uncertain

### Requirement: Analysis includes recipe graph nodes
The system SHALL include graph nodes for ingredients and processing steps in the recipe analysis.

#### Scenario: Ingredient node is produced
- **WHEN** the recipe contains an ingredient
- **THEN** the analysis includes a node representing that ingredient and its available normalized amount

#### Scenario: Processing step node is produced
- **WHEN** the recipe contains an actionable instruction such as peeling, boiling, baking, resting, mixing, or cooling
- **THEN** the analysis includes a processing node with action, label, and relevant timing or temperature data when available

### Requirement: Analysis can include intermediate state nodes
The system SHALL support intermediate state nodes produced during recipe preparation.

#### Scenario: Intermediate state is identifiable
- **WHEN** recipe steps create a meaningful intermediate result such as dough, peeled apples, filling, sauce, or batter
- **THEN** the analysis includes an intermediate node representing that state

#### Scenario: Intermediate state is not identifiable
- **WHEN** the recipe text does not clearly describe an intermediate state
- **THEN** the analysis remains valid without intermediate state nodes

### Requirement: Analysis includes graph edges
The system SHALL include directed graph edges that connect ingredients, processing steps, and intermediate states.

#### Scenario: Ingredient is used in a step
- **WHEN** an ingredient is consumed by a processing step
- **THEN** the analysis includes an edge from the ingredient node to the processing node

#### Scenario: Step produces an intermediate state
- **WHEN** a processing step creates an intermediate state
- **THEN** the analysis includes an edge from the processing node to the intermediate state node

#### Scenario: Step ordering is known
- **WHEN** one processing step must occur before another
- **THEN** the analysis includes a directed edge representing that dependency

### Requirement: Analysis includes a human-readable ingredient list
The system SHALL provide an ingredient list suitable for immediate reading by a human.

#### Scenario: Ingredient list is generated
- **WHEN** a recipe analysis succeeds
- **THEN** the result includes a list of ingredient lines derived from the analyzed ingredients
