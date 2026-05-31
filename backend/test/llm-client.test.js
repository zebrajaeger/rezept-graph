const assert = require("node:assert/strict");
const test = require("node:test");
const { createLlmClient, createOllamaClient, createOpenAiCompatibleClient } = require("../src/llm-client");

test("createOpenAiCompatibleClient calls chat completions endpoint", async () => {
  let request;
  const client = createOpenAiCompatibleClient(
    {
      baseUrl: "http://localhost:1234/v1",
      model: "test-model",
      apiKeyEnv: "TEST_API_KEY",
    },
    {
      env: { TEST_API_KEY: "secret" },
      fetcher: async (url, options) => {
        request = { url, options };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: "{\"ok\":true}" } }],
          }),
        };
      },
    }
  );

  const result = await client.complete([{ role: "user", content: "Hallo" }]);

  assert.equal(result, "{\"ok\":true}");
  assert.equal(request.url, "http://localhost:1234/v1/chat/completions");
  assert.equal(request.options.headers.authorization, "Bearer secret");
  assert.match(request.options.body, /test-model/);
});

test("createOllamaClient calls native Ollama chat endpoint", async () => {
  let request;
  const client = createOllamaClient(
    {
      baseUrl: "https://ollama.com",
      model: "test-model",
      apiKeyEnv: "API_KEY",
    },
    {
      env: { API_KEY: "secret" },
      fetcher: async (url, options) => {
        request = { url, options };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            message: { content: "{\"ok\":true}" },
          }),
        };
      },
    }
  );

  const result = await client.complete([{ role: "user", content: "Hallo" }]);

  assert.equal(result, "{\"ok\":true}");
  assert.equal(request.url, "https://ollama.com/api/chat");
  assert.equal(request.options.headers.authorization, "Bearer secret");
  assert.match(request.options.body, /"stream":false/);
  assert.match(request.options.body, /"format":"json"/);
});

test("createLlmClient selects Ollama provider", async () => {
  const client = createLlmClient(
    {
      provider: "ollama",
      baseUrl: "https://ollama.com",
      model: "test-model",
      apiKeyEnv: "API_KEY",
    },
    {
      env: { API_KEY: "secret" },
      fetcher: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ message: { content: "{\"ok\":true}" } }),
      }),
    }
  );

  assert.equal(await client.complete([{ role: "user", content: "Hallo" }]), "{\"ok\":true}");
});
