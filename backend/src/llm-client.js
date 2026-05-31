const { CliError } = require("./errors");

function createOpenAiCompatibleClient(config, options = {}) {
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

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content;
        if (typeof content !== "string" || content.trim().length === 0) {
          throw new CliError("LLM-Antwort enthaelt keinen Textinhalt.");
        }
        return content;
      } catch (error) {
        if (error instanceof CliError) throw error;
        if (error.name === "AbortError") {
          throw new CliError(`LLM-Anfrage wurde nach ${config.timeoutMs || 60000}ms abgebrochen.`);
        }
        throw new CliError(`LLM-Anfrage fehlgeschlagen: ${error.message}`);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function createOllamaClient(config, options = {}) {
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

        const payload = await response.json();
        const content = payload?.message?.content || payload?.response;
        if (typeof content !== "string" || content.trim().length === 0) {
          throw new CliError("LLM-Antwort enthaelt keinen Textinhalt.");
        }
        return content;
      } catch (error) {
        if (error instanceof CliError) throw error;
        if (error.name === "AbortError") {
          throw new CliError(`LLM-Anfrage wurde nach ${config.timeoutMs || 60000}ms abgebrochen.`);
        }
        throw new CliError(`LLM-Anfrage fehlgeschlagen: ${error.message}`);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function createLlmClient(config, options = {}) {
  if (config.provider === "ollama") {
    return createOllamaClient(config, options);
  }
  return createOpenAiCompatibleClient(config, options);
}

module.exports = {
  createLlmClient,
  createOllamaClient,
  createOpenAiCompatibleClient,
};
