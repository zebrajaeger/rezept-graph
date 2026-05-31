const assert = require("node:assert/strict");
const test = require("node:test");
const { createOpenAiCompatibleClient } = require("../src/llm-client");

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
