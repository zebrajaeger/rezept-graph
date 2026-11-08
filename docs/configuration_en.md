# Configuration and providers

[Overview](../README.md) · [Deutsch](configuration_de.md)

## Local configuration

Use [`config.example.json`](../config.example.json) as the template for a local
`config.json` in the project root; see [setup](setup_en.md). `config.json` is
ignored by Git.

Move an existing `backend/config.json` to the root manually, without overwriting
an existing root file. Relative cache and output paths are resolved against the
configuration directory and must be adjusted when moving it, for example
`outputs` → `backend/outputs`.

## Path resolution

| Path | Base directory |
| --- | --- |
| Default `config.json` | Always the project root. |
| Explicit `--config <path>` | Working directory, unless absolute. |
| Configured cache and output paths | Configuration file's directory. |
| `--output-dir <path>` | Working directory, unless absolute. |

## LLM settings

| Field | Meaning |
| --- | --- |
| `llm.baseUrl` | OpenAI-compatible API root, including `/v1` if required by the server. |
| `llm.baseUrlEnv` | Optional environment variable name for the base URL. |
| `llm.model` | Model name. |
| `llm.apiKeyEnv` | Environment variable name for the API key. |
| `llm.timeoutMs` | Timeout in milliseconds. |

Only OpenAI-compatible chat completions APIs are supported, regardless of vendor.
The client trims trailing slashes and appends `/chat/completions` to the API root;
it does not automatically insert `/v1`. For example, `http://localhost:1234/v1`
targets `http://localhost:1234/v1/chat/completions`. Custom gateway roots are supported.

The server must accept `model`, `messages`, and JSON mode
(`response_format: { "type": "json_object" }`) and return text in
`choices[0].message.content`. The configured environment variable supplies the
optional bearer token. Timeouts and response caching remain supported; there is
no native-protocol fallback, Responses API, or streaming support.

## Migration from legacy providers

- Remove `llm.provider` entirely, including old `server`, `ollama`, or `openai`
  values. There is no selector in the code or typed configuration anymore.
  Obsolete fields in external JSON are ignored and not copied into normalized settings.
- Verify the server's OpenAI-compatible API root and JSON-mode support. Do not
  simply reuse a native API root without checking it.
- For local Ollama, use `http://localhost:11434/v1`; requests then target
  `/v1/chat/completions`, never native `/api/chat`. Native Ollama Cloud access is
  no longer supported; a service must expose the compatible API described above.
- Keep credentials in environment variables selected by `apiKeyEnv`, not an
  inline `apiKey` field. Private configurations are not migrated automatically.
- Completion cache keys now contain only API root, model, and messages. Old cache
  entries containing a provider component (including OpenAI entries) become cold
  misses: the next request makes a fresh LLM call. Old files are neither migrated
  nor deleted, and subsequent identical requests reuse the new entry.

## Environment variables

The CLI automatically loads `.env` from the current working directory, its parent,
and the configuration directory. Existing shell variables take precedence.

If the configuration uses `"apiKeyEnv": "API_KEY"` and `"baseUrlEnv": "BASE_URL"`,
your `.env` can contain:

```dotenv
API_KEY=...
BASE_URL=...
```

The supplied template uses `OPENAI_API_KEY` and `OPENAI_BASE_URL` instead;
variable names must match your configuration.
