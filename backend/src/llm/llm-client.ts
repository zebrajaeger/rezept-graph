import { CliError } from "../errors";
import { isRecord, errorMessage, isAbortError } from "../unknown-data";
import type { LlmConfig } from "../config/config";
import type { JsonFetcher } from "../http-types";

export interface CompletionMessage { role: "system" | "user" | "assistant"; content: string }
export interface CompletionClient { complete(messages: CompletionMessage[]): Promise<string> }
interface ClientOptions { fetcher?: JsonFetcher; env?: NodeJS.ProcessEnv }

export function createOpenAiCompatibleClient(config: LlmConfig, options: ClientOptions = {}): CompletionClient {
  const fetcher = options.fetcher || fetch;
  const env = options.env || process.env;

  return {
    async complete(messages) {
      const apiKey = env[config.apiKeyEnv];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 60000);

      try {
        const response = await fetcher(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          throw new CliError(`LLM-Anfrage fehlgeschlagen: HTTP ${response.status}`);
        }

        const payload: unknown = await response.json();
        const choice: unknown = isRecord(payload) && Array.isArray(payload.choices) ? payload.choices[0] : undefined;
        const content = isRecord(choice) && isRecord(choice.message) ? choice.message.content : undefined;
        if (typeof content !== "string" || content.trim().length === 0) {
          throw new CliError("LLM-Antwort enthaelt keinen Textinhalt.");
        }
        return content;
      } catch (error) {
        if (error instanceof CliError) throw error;
        if (isAbortError(error)) {
          throw new CliError(`LLM-Anfrage wurde nach ${config.timeoutMs || 60000}ms abgebrochen.`);
        }
        throw new CliError(`LLM-Anfrage fehlgeschlagen: ${errorMessage(error)}`);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function createOllamaClient(config: LlmConfig, options: ClientOptions = {}): CompletionClient {
  const fetcher = options.fetcher || fetch;
  const env = options.env || process.env;

  return {
    async complete(messages) {
      const apiKey = env[config.apiKeyEnv];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 60000);

      try {
        const response = await fetcher(`${config.baseUrl}/api/chat`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            stream: false,
            format: "json",
          }),
        });

        if (!response.ok) {
          throw new CliError(`LLM-Anfrage fehlgeschlagen: HTTP ${response.status}`);
        }

        const payload: unknown = await response.json();
        const content = isRecord(payload) ? (isRecord(payload.message) ? payload.message.content : undefined) || payload.response : undefined;
        if (typeof content !== "string" || content.trim().length === 0) {
          throw new CliError("LLM-Antwort enthaelt keinen Textinhalt.");
        }
        return content;
      } catch (error) {
        if (error instanceof CliError) throw error;
        if (isAbortError(error)) {
          throw new CliError(`LLM-Anfrage wurde nach ${config.timeoutMs || 60000}ms abgebrochen.`);
        }
        throw new CliError(`LLM-Anfrage fehlgeschlagen: ${errorMessage(error)}`);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function createLlmClient(config: LlmConfig, options: ClientOptions = {}): CompletionClient {
  if (config.provider === "ollama") {
    return createOllamaClient(config, options);
  }
  return createOpenAiCompatibleClient(config, options);
}
