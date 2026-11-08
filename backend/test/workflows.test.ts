import assert from "node:assert/strict";
import test from "node:test";
import { analyzeUrls } from "../src/workflows/analyze-urls";
import { seedChefkochUrls } from "../src/workflows/seed-chefkoch-urls";
import type { Config } from "../src/config/config";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

const config: Config = { llm: { baseUrl: "https://example.test", model: "test", apiKeyEnv: "KEY" }, cache: { directory: "cache", mode: "offline" }, output: { directory: "output", includeIntermediateStates: false } };
const recipe: RecipeAnalysis = { metadata: { title: "Toast" }, ingredients: [], ingredientList: [], nodes: [], edges: [] };

test("analysis workflow runs in order with injected dependencies and progress, without terminal IO", async () => {
  const calls: string[] = [];
  const results = await analyzeUrls({ urls: ["first", "second"], config, client: { complete: async () => "{}" }, onProgress: (result) => { calls.push(`progress:${result.url}`); } }, {
    getRecipePage: async ({ url }) => { calls.push(`page:${url}`); return { html: url }; },
    extractRecipeContent: (html, sourceUrl) => { calls.push(`extract:${html}`); return { sourceUrl, extractionMethod: "text", text: html, structuredRecipe: null }; },
    analyzeRecipeContent: async ({ content }) => { calls.push(`analyze:${content.sourceUrl}`); return recipe; },
    writeRecipeOutputs: async () => { calls.push("write"); await Promise.resolve(); return { jsonPath: "a", ingredientsPath: "b", mermaidPath: "c", svgPath: "d", pngPath: "e" }; },
  });
  assert.deepEqual(calls, ["page:first", "extract:first", "analyze:first", "write", "progress:first", "page:second", "extract:second", "analyze:second", "write", "progress:second"]);
  assert.equal(results.length, 2);
});

test("analysis stops at the first failure and reports no false success", async () => {
  const visited: string[] = [];
  await assert.rejects(analyzeUrls({ urls: ["first", "second"], config, client: { complete: async () => "{}" } }, {
    getRecipePage: async ({ url }) => { visited.push(url); throw new Error("missing page"); },
  }), /missing page/);
  assert.deepEqual(visited, ["first"]);
});

test("render failure is awaited, reports no success, and prevents later URLs", async () => {
  const visited: string[] = [];
  let progress = 0;
  await assert.rejects(analyzeUrls({ urls: ["first", "second"], config, client: { complete: async () => "{}" }, onProgress: () => { progress++; } }, {
    getRecipePage: async ({ url }) => { visited.push(url); return { html: "fixture" }; },
    extractRecipeContent: () => ({ sourceUrl: "first", text: "fixture", extractionMethod: "text", structuredRecipe: null }),
    analyzeRecipeContent: async () => recipe,
    writeRecipeOutputs: async () => { await Promise.resolve(); throw new Error("render failed"); },
  }), /render failed/);
  assert.deepEqual(visited, ["first"]);
  assert.equal(progress, 0);
});

test("discovery workflow persists ordered candidates through injected URL storage", async () => {
  const result = await seedChefkochUrls({ urlsPath: "urls.txt", limit: 2 }, {
    discoverChefkochUrls: async ({ limit }) => { assert.equal(limit, 2); return { urls: ["one", "two"], sourceUrl: "source" }; },
    appendUniqueUrls: (file, urls) => { assert.equal(file, "urls.txt"); assert.deepEqual(urls, ["one", "two"]); return { added: ["two"], skipped: 1 }; },
  });
  assert.deepEqual(result, { added: ["two"], skipped: 1, discovered: 2, sourceUrl: "source" });
});
