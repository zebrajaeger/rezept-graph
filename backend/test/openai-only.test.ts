import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "../src/config/config";
import type { LlmConfig } from "../src/config/config";
import { createLlmClient } from "../src/llm/llm-client";
import { createCompletionClient } from "../src/llm/completion-client";
import { createLlmCacheKey, getOrCreateLlmResponse } from "../src/llm/llm-response-cache";

const settings = { baseUrl: "https://example.test/custom", model: "fixture", apiKeyEnv: "KEY", timeoutMs: 1000 };

test("normalized configuration has no selector and ignores obsolete JSON fields", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openai-config-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const configPath = path.join(dir, "config.json");
  const urlsPath = path.join(dir, "urls.txt");
  fs.writeFileSync(urlsPath, "https://example.test/recipe\n");
  for (const provider of [undefined, "openai", "ollama", "server", "unknown", null, 7, {}, []]) {
    fs.writeFileSync(configPath, JSON.stringify({
      llm: { ...settings, provider, apiKey: "private-credential" },
      cache: { directory: "cache", mode: "cache-first" },
      output: { directory: "outputs", includeIntermediateStates: true },
    }));
    const normalized = loadConfig(configPath).llm;
    assert.equal("provider" in normalized, false);
    assert.equal("apiKey" in normalized, false);
    assert.equal(normalized.baseUrl, settings.baseUrl);
  }
  assert.ok(!fs.existsSync(path.join(dir, "cache")));
});

test("obsolete extra properties cannot select a native transport", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openai-invalid-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const provider of ["ollama", "server", "unknown", null, 7, {}, []]) {
    const config = { ...settings, provider, responseCacheDir: dir } as unknown as LlmConfig;
    const client = createLlmClient(config, { env: {}, fetcher: async (url) => {
      assert.equal(url, `${settings.baseUrl}/chat/completions`);
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "compatible" } }] }) };
    } });
    assert.equal(await client.complete([]), "compatible");
  }
});

test("compatible transport normalizes roots without inferring API versions", async () => {
  for (const baseUrl of ["https://example.test/custom///", "http://localhost:11434/v1/"]) {
    const client = createLlmClient({ ...settings, baseUrl }, {
      env: {},
      fetcher: async (url, options) => {
        assert.equal(url, `${baseUrl.replace(/\/+$/, "")}/chat/completions`);
        assert.equal(options?.method, "POST");
        assert.equal(new Headers(options?.headers).has("authorization"), false);
        assert.deepEqual(JSON.parse(String(options?.body)), { model: "fixture", messages: [], temperature: 0.1, response_format: { type: "json_object" } });
        return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "{}" } }] }) };
      },
    });
    assert.equal(await client.complete([]), "{}");
  }
});

test("compatible failures do not fall back and always clear timeout resources", async (t) => {
  for (const failure of ["http", "content", "timeout"] as const) {
    let calls = 0;
    const cleared: unknown[] = [];
    const scheduled: Array<{ callback: () => void; delay: number | undefined }> = [];
    const timer = setTimeout(() => {}, 10000);
    clearTimeout(timer);
    t.mock.method(globalThis, "setTimeout", (callback: () => void, delay?: number) => { scheduled.push({ callback, delay }); return timer; });
    t.mock.method(globalThis, "clearTimeout", (handle: unknown) => { cleared.push(handle); });
    const client = createLlmClient(settings, { env: {}, fetcher: async (_url, options) => {
      calls++;
      if (failure === "timeout") {
        scheduled[0]!.callback();
        assert.equal(options?.signal?.aborted, true);
        throw new DOMException("Aborted", "AbortError");
      }
      return { ok: failure !== "http", status: 503, json: async () => ({ choices: [] }) };
    } });
    await assert.rejects(client.complete([]), failure === "http" ? /HTTP 503/ : failure === "content" ? /Textinhalt/ : /1000ms/);
    assert.equal(calls, 1);
    assert.equal(scheduled[0]?.delay, 1000);
    assert.deepEqual(cleared, [timer]);
    t.mock.restoreAll();
  }
});

test("cache keys omit selectors and leave all legacy entries untouched", async (t) => {
  const responseCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "openai-cache-"));
  t.after(() => fs.rmSync(responseCacheDir, { recursive: true, force: true }));
  for (const provider of ["openai", "ollama"]) {
    await getOrCreateLlmResponse({ cacheDir: responseCacheDir, cacheKeyParts: { provider, baseUrl: settings.baseUrl, model: settings.model, messages: [] }, createResponse: async () => "legacy" });
  }
  const originals = fs.readdirSync(responseCacheDir).map(name => [name, fs.readFileSync(path.join(responseCacheDir, name), "utf8")] as const);
  let calls = 0;
  for (const provider of [undefined, "openai", "ollama", "server"]) {
    const config = { ...settings, provider, responseCacheDir } as unknown as LlmConfig;
    const client = createCompletionClient(config, {}, { complete: async () => { calls++; return "compatible"; } });
    assert.equal(await client.complete([]), "compatible");
  }
  assert.equal(calls, 1);
  const key = createLlmCacheKey({ baseUrl: settings.baseUrl, model: settings.model, messages: [] });
  assert.equal(JSON.parse(fs.readFileSync(path.join(responseCacheDir, `${key}.json`), "utf8")).content, "compatible");
  assert.equal(fs.readdirSync(responseCacheDir).length, 3);
  for (const [name, content] of originals) assert.equal(fs.readFileSync(path.join(responseCacheDir, name), "utf8"), content);
});
