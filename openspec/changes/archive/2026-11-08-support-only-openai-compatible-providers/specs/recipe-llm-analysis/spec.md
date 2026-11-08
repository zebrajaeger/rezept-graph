## MODIFIED Requirements

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

## ADDED Requirements

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
