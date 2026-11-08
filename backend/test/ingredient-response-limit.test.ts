import assert from "node:assert/strict";
import test from "node:test";
import { createLlmClient } from "../src/llm/llm-client";

test("optional semantic response limit bounds transport before JSON parsing", async () => {
  const client = createLlmClient({ baseUrl: "https://invalid", model: "small", apiKeyEnv: "NONE", timeoutMs: 1000, maxResponseBytes: 20 }, { fetcher: async () => new Response("x".repeat(100)) });
  await assert.rejects(client.complete([]), /limit/i);
});
