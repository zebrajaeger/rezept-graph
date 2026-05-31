const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  createLlmCacheKey,
  getOrCreateLlmResponse,
  stableStringify,
} = require("../src/llm-response-cache");

test("stableStringify produces stable output independent of object key order", () => {
  assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }));
});

test("createLlmCacheKey changes when relevant prompt parts change", () => {
  const first = createLlmCacheKey({ model: "a", prompt: "x" });
  const second = createLlmCacheKey({ model: "a", prompt: "y" });

  assert.notEqual(first, second);
});

test("getOrCreateLlmResponse stores and reuses LLM response content", async () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-llm-cache-"));
  let calls = 0;

  const first = await getOrCreateLlmResponse({
    cacheDir,
    cacheKeyParts: { model: "test", prompt: "hello" },
    createResponse: async () => {
      calls += 1;
      return "{\"ok\":true}";
    },
  });
  const second = await getOrCreateLlmResponse({
    cacheDir,
    cacheKeyParts: { prompt: "hello", model: "test" },
    createResponse: async () => {
      calls += 1;
      return "{\"ok\":false}";
    },
  });

  assert.equal(first.fromCache, false);
  assert.equal(second.fromCache, true);
  assert.equal(second.content, "{\"ok\":true}");
  assert.equal(calls, 1);
});
