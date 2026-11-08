import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { validateConfig } from "../src/config";
import { validateRecipeAnalysis } from "../src/recipe-schema";
import { createLlmClient } from "../src/llm-client";
import { createLlmCacheKey, getOrCreateLlmResponse } from "../src/llm-response-cache";

const root = path.resolve(__dirname, "../../..");

test("compiled and legacy CLI entries preserve help and error exit codes", () => {
  for (const entry of ["backend/dist/cli.js", "backend/src/cli.js"]) {
    const help = spawnSync(process.execPath, [entry, "--help"], { cwd: root, encoding: "utf8" });
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /Rezept Graph CLI/);
    const invalid = spawnSync(process.execPath, [entry, "unknown"], { cwd: root, encoding: "utf8" });
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /Unbekanntes Kommando/);
  }
});

test("legacy launcher explains missing build output without a stack trace", (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "typescript-launcher-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(tmp, "src"));
  fs.copyFileSync(path.join(root, "backend/src/cli.js"), path.join(tmp, "src/cli.js"));
  const result = spawnSync(process.execPath, [path.join(tmp, "src/cli.js"), "--help"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /npm --prefix backend run build/);
  assert.doesNotMatch(result.stderr, /MODULE_NOT_FOUND|at Object/);
});

test("legacy launcher exports the compiled main function", () => {
  const result = spawnSync(process.execPath, ["-e", "console.log(typeof require('./backend/src/cli.js').main)"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "function");
});

test("npm start rebuilds fresh output and removes stale emitted modules", (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "typescript-build-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const backend = path.join(root, "backend");
  // Run in an isolated package so this test never deletes an in-use build.
  for (const filename of ["package.json", "tsconfig.base.json", "tsconfig.json"]) {
    fs.copyFileSync(path.join(backend, filename), path.join(tmp, filename));
  }
  fs.cpSync(path.join(backend, "src"), path.join(tmp, "src"), { recursive: true });
  fs.symlinkSync(path.join(backend, "node_modules"), path.join(tmp, "node_modules"), "junction");
  fs.mkdirSync(path.join(tmp, "dist"));
  fs.writeFileSync(path.join(tmp, "dist/stale.js"), "obsolete");
  fs.writeFileSync(path.join(tmp, "keep.txt"), "user data");
  const result = spawnSync(process.platform === "win32" ? "cmd.exe" : "npm", process.platform === "win32" ? ["/d", "/c", "npm start -- --help"] : ["start", "--", "--help"], { cwd: tmp, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Rezept Graph CLI/);
  assert.equal(fs.existsSync(path.join(tmp, "dist/stale.js")), false);
  assert.equal(fs.readFileSync(path.join(tmp, "keep.txt"), "utf8"), "user data");
  assert.equal(fs.readdirSync(path.join(tmp, "dist")).some((name) => name.endsWith(".test.js")), false);
});

test("external config and provider payloads are checked before use", async () => {
  for (const config of [null, [], {}, { llm: 2, cache: null }]) {
    assert.throws(() => validateConfig(config, "test.json"), /Config-Datei/);
  }
  for (const provider of ["openai", "ollama"] as const) {
    for (const payload of [null, [], {}, { choices: [null] }, { message: { content: 42 } }]) {
      const client = createLlmClient({ provider, baseUrl: "https://example.test", model: "test", apiKeyEnv: "KEY" }, {
        env: {}, fetcher: async () => ({ ok: true, status: 200, json: async () => payload }),
      });
      await assert.rejects(client.complete([]), /keinen Textinhalt/);
    }
  }
});

test("validated recipes preserve nullable fields and reject malformed members", () => {
  const value = {
    metadata: { title: "Toast", sourceUrl: null, servings: null },
    ingredients: [{ id: "bread", name: "Bread", originalText: "Bread", quantity: null, unit: null, preparation: null, confidence: null }],
    nodes: [{ id: "bread", type: "ingredient", label: "Bread", duration: null, temperature: null }],
    edges: [], ingredientList: ["Bread"],
  };
  assert.equal(validateRecipeAnalysis(value), value);
  assert.throws(() => validateRecipeAnalysis({ ...value, nodes: [null] }), /nodes\[0\]/);
  assert.throws(() => validateRecipeAnalysis({ ...value, ingredients: [42] }), /ingredients\[0\]/);
  assert.throws(() => validateRecipeAnalysis({ ...value, edges: [{ from: "bread", to: "missing", type: "before" }] }), /unbekannten Node/);
});

test("malformed cached completions are rejected without granting a string contract", async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "typescript-cache-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const cacheKeyParts = { model: "test" };
  fs.writeFileSync(path.join(tmp, `${createLlmCacheKey(cacheKeyParts)}.json`), '{"content":42}');
  let called = false;
  await assert.rejects(getOrCreateLlmResponse({ cacheDir: tmp, cacheKeyParts, createResponse: async () => { called = true; return "unexpected"; } }), /keinen Textinhalt/);
  assert.equal(called, false);
});
