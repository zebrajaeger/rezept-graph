import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createCompletionClient } from "../src/llm/completion-client";
import { createLlmCacheKey } from "../src/llm/llm-response-cache";
import { analyzeRecipeContent } from "../src/analysis/recipe-analyzer";

test("uncached completion composition preserves provider request and repeats calls", async () => {
  let calls = 0;
  const client = createCompletionClient({ baseUrl: "https://example.test/v1", model: "fixture", apiKeyEnv: "KEY" }, {
    env: { KEY: "fixture-key" },
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url, "https://example.test/v1/chat/completions");
      assert.equal(new Headers(options?.headers).get("authorization"), "Bearer fixture-key");
      assert.deepEqual(JSON.parse(String(options?.body)), { model: "fixture", messages: [], temperature: 0.1, response_format: { type: "json_object" } });
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "raw" } }] }) };
    },
  });
  assert.equal(await client.complete([]), "raw");
  assert.equal(await client.complete([]), "raw");
  assert.equal(calls, 2);
});

test("cached composition reuses exact raw invalid analysis responses without another provider call", async (t) => {
  const responseCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "completion-composition-"));
  t.after(() => fs.rmSync(responseCacheDir, { recursive: true, force: true }));
  const config = { provider: "ollama" as const, baseUrl: "https://example.test", model: "fixture", apiKeyEnv: "KEY", responseCacheDir };
  let calls = 0;
  const raw = "```json\n{\"invalid\":true}\n```";
  const client = createCompletionClient(config, {}, { complete: async () => { calls++; return raw; } });
  for (let i = 0; i < 2; i++) {
    await assert.rejects(analyzeRecipeContent({ content: { text: "Toast" }, client }), /Recipe analysis ist ungueltig/);
  }
  assert.equal(calls, 1);
  assert.equal(await client.complete([]), raw);
  const key = createLlmCacheKey({ provider: "ollama", baseUrl: config.baseUrl, model: config.model, messages: [] });
  assert.equal(JSON.parse(fs.readFileSync(path.join(responseCacheDir, `${key}.json`), "utf8")).content, raw);
});
