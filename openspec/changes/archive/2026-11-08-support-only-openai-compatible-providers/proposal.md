## Why

The integration contract is OpenAI compatibility only. A provider selector has no meaning when there is only one protocol and creates unnecessary configuration, validation, and cache-key complexity.

## What Changes

- Remove native Ollama `/api/chat` support and completely remove the provider selector from configuration types, normalization, validation, and transport composition.
- Route all production LLM requests through the existing OpenAI-compatible chat completions client.
- Ignore obsolete provider fields in external JSON like other unknown fields; they cannot select a protocol or affect cache identity.
- Preserve configurable endpoint, model, timeout, environment-based credentials, structured JSON requests, and response caching.
- **BREAKING**: Remove the provider component from completion cache keys; old entries become cold misses without migration or fallback.
- Update example configuration and English/German documentation to explain compatibility requirements and migration, including Ollama's OpenAI-compatible API.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-llm-analysis`: Restrict supported LLM integrations to the OpenAI-compatible chat completions protocol and define configuration validation and migration behavior.

## Impact

Affected areas include configuration, LLM clients and caching, tests and fixtures, `config.example.json`, the private `config.json` (remove only the provider field), and bilingual documentation. Existing native Ollama configurations require an OpenAI-compatible base URL. No new runtime dependencies are required. Credentials must not be copied into artifacts or documentation. Cache entries are not deleted or migrated automatically.
