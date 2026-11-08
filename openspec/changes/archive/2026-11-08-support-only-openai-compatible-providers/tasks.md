## 1. Scope and impact

- [x] 1.1 Inspect the working tree and overlapping OpenSpec changes; identify affected config, client, cache, test, and documentation files without overwriting unrelated work.
- [x] 1.2 Run GitNexus upstream impact analysis before editing each affected implementation symbol and report callers, affected processes, and risk; surface HIGH or CRITICAL warnings before proceeding.

## 2. Test-first coverage

- [x] 2.1 Add failing configuration tests for explicit `openai`, omitted-provider defaulting, and actionable rejection of `ollama`, `server`, unknown strings, and invalid value types without credential disclosure.
- [x] 2.2 Add failing CLI tests proving invalid providers stop execution before recipe fetching or LLM calls.
- [x] 2.3 Add failing transport/factory tests for compatible endpoint construction, trailing-slash handling, JSON-mode payload, environment authentication, response parsing, and direct-call rejection of unsupported providers.
- [x] 2.4 Add regression coverage for timeout cleanup, HTTP errors, missing content, absence of native protocol fallback, and Ollama via its `/v1/chat/completions` endpoint.
- [x] 2.5 Add failing cache tests for identical explicit/default OpenAI identities, isolation from native Ollama entries, and rejection of invalid providers before cache access; add type-level coverage for the narrowed provider contract.
- [x] 2.6 Run the new tests and confirm expected failures before changing production behavior.

## 3. OpenAI-compatible-only implementation

- [x] 3.1 Narrow provider types and config validation to optional `openai`, preserve default normalization, and introduce actionable unsupported-provider errors.
- [x] 3.2 Remove the native Ollama adapter and factory dispatch while retaining the existing compatible transport and guarding runtime factory callers.
- [x] 3.3 Preserve normalized cache identities and enforce provider validation before cache lookup, including injected-client paths.
- [x] 3.4 Update affected fixtures and type tests without retaining obsolete native transport expectations.

## 4. Documentation and verification

- [x] 4.1 Review `config.example.json` and tracked examples for exclusive OpenAI-compatible settings and environment-based credentials; update where necessary without rewriting private config.
- [x] 4.2 Add or update paired English/German documentation under `docs/` and concise README links, covering required API features, API roots, and migration from `server` and native `ollama`.
- [x] 4.3 Run backend type checking and the full test suite; verify all added specification scenarios using deterministic mocks rather than a required live provider.
- [x] 4.4 Validate this OpenSpec change and inspect the diff for unrelated edits or exposed secrets; run GitNexus `detect_changes` before any requested commit and base its message on `support-only-openai-compatible-providers`.

## 5. Remove the redundant selector completely (supersedes selector-related tasks above)

- [x] 5.1 Update proposal, design, and delta specification to remove provider selection and define legacy JSON handling and cold cache misses.
- [x] 5.2 Add and run failing tests for selector-free normalized configuration, cache keys, and type contracts.
- [x] 5.3 Remove provider types, validation, normalization, and cache-key fields; update tests and deterministic fixtures.
- [x] 5.4 Remove the selector from example/private config, update bilingual documentation and current specifications without changing credentials or archived specs.
- [x] 5.5 Run type checks, build, all tests, OpenSpec validation, and scoped diff checks.
