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
| `llm.baseUrl` | Provider base URL. |
| `llm.baseUrlEnv` | Optional environment variable name for the base URL. |
| `llm.provider` | `openai` for OpenAI-compatible `/v1/chat/completions`, `ollama` for native `/api/chat`. |
| `llm.model` | Model name. |
| `llm.apiKeyEnv` | Environment variable name for the API key. |
| `llm.timeoutMs` | Timeout in milliseconds. |

Local providers such as LM Studio or compatible gateways can be used as long as
they offer `/v1/chat/completions`.

For direct Ollama Cloud access, use `provider: "ollama"` and the base URL
`https://ollama.com`. The native cloud API is at `https://ollama.com/api/chat`
and uses `Authorization: Bearer ...`.

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
