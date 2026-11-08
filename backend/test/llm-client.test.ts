import assert from "node:assert/strict";
import test from "node:test";
import { createOpenAiCompatibleClient } from "../src/llm/llm-client";

test("createOpenAiCompatibleClient calls chat completions endpoint", async () => {
  let request: { url: string; options?: RequestInit } | undefined;
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
  assert.ok(request?.options);
  assert.equal(request.url, "http://localhost:1234/v1/chat/completions");
  assert.equal(new Headers(request.options.headers).get("authorization"), "Bearer secret");
  assert.equal(typeof request.options.body, "string");
  assert.match(String(request.options.body), /test-model/);
});
