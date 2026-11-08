## Context

The change removes native Ollama transport. Following user review, even an optional `openai` selector is unnecessary: the only supported wire protocol is OpenAI-compatible chat completions. Configuration, clients, cache keys, tests, and documentation must reflect that there is no protocol choice.

## Goals / Non-Goals

**Goals:**
- Remove the provider field and type, its validator, normalization, and cache-key component.
- Keep one transport with configurable API root, model, timeout, JSON mode, and environment authentication.
- Preserve response caching with a simpler identity and document the resulting cold misses.
- Update the private configuration by removing only its provider line, alongside tracked examples and bilingual docs.

**Non-Goals:**
- Native protocols, automatic protocol detection, Responses API, streaming, API-root probing, or SDK dependencies.
- Modifying credentials, migrating/deleting cache files, or automatically running live recipe analysis.

## Decisions

### No selector in any active contract

Remove `LlmProvider`, `LlmConfig.provider`, `validateLlmProvider`, and every runtime read of the selector. The existing factory can remain as a stable composition boundary, but always creates the compatible client. Type tests reject a provider property even with value `openai`.

External JSON's obsolete provider property is ignored like existing unknown fields and is not copied into normalized settings. Rejecting it would retain provider-specific validation with no functional purpose. Typed callers must remove it; untyped extra fields cannot alter transport behavior.

### Endpoint semantics stay explicit

Trim trailing slashes and append `/chat/completions`. Do not insert `/v1`: custom gateways may use another root. Local Ollama can use `http://localhost:11434/v1`, with no selector. Preserve model/messages, JSON mode, environment bearer authentication, response parsing, timeouts, and errors.

### Simplify cache identity, accept cold misses

Cache keys contain only base URL, model, and messages. Do not keep a constant provider tag or implement legacy lookup: either would preserve unnecessary coupling. Old OpenAI and native Ollama entries become misses and remain untouched. Existing callers will incur one fresh completion per new key. Update the deterministic cache-key fixture while preserving recipe output fixtures.

### Documentation and local configuration

Remove the field from tracked examples and the user's private `config.json`, without exposing or modifying credentials. English/German docs explain removing old selector lines and verifying a compatible API root and JSON-mode support. Historical archived changes remain historical; update the active delta and current main specification as requested. Main requirements must match the delta and type contract.

## Risks / Trade-offs

- [Cache misses increase LLM calls] → Clearly document the one-time invalidation; no automatic live calls or cache deletion.
- [Native endpoint settings remain invalid] → Explain API-root migration; ignoring a selector does not add native protocol support.
- [Old typed callers break] → Type errors explicitly identify obsolete properties; external JSON remains loadable.
- [Private config contains secrets] → Remove only the exact selector line without logging its contents.
- [Concurrent user changes] → Leave unrelated changes, notably `AGENTS.md`, untouched and run impact analysis before symbol edits.

## Migration Plan

1. Add failing tests for selector-free normalized configuration and cache identities, plus type tests rejecting all selector values.
2. Remove selector code, update test fixtures and sample/private configuration.
3. Update active and current specifications and bilingual docs; leave archived specs unchanged.
4. Run type checks, build, deterministic tests, and OpenSpec validation.
5. Rollback requires the previous code/config version; legacy cache files remain available for that version.

## Open Questions

None blocking. Verify any private gateway API root separately before a live run.
