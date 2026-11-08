import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createCacheKey } from "../src/ingestion/cache";
import { createLlmCacheKey } from "../src/llm/llm-response-cache";
import { createAnalysisMessages } from "../src/analysis/recipe-analyzer";
import { createOutputSlug, writeRecipeOutputs } from "../src/output/output-writer";
import { validateRecipeAnalysis } from "../src/recipe/recipe-schema";
import { writeCacheEntry } from "../src/ingestion/cache";
import { analyzeUrls } from "../src/workflows/analyze-urls";

const fixtures = path.resolve(__dirname, "../../test/fixtures");

test("fixed recipe preserves exact serialized outputs, names, prompts and cache identities", (t) => {
  const recipe = validateRecipeAnalysis(JSON.parse(fs.readFileSync(path.join(fixtures, "responsibility-recipe.json"), "utf8")));
  const baseline = JSON.parse(fs.readFileSync(path.join(fixtures, "responsibility-baseline.json"), "utf8"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "responsibility-baseline-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const before = JSON.stringify(recipe);
  assert.equal(createOutputSlug(recipe), baseline.slug);
  assert.equal(createCacheKey(recipe.metadata.sourceUrl!), baseline.pageKey);
  const messages = createAnalysisMessages({ sourceUrl: recipe.metadata.sourceUrl!, text: "Mehl rühren und backen" });
  assert.deepEqual(messages, baseline.messages);
  assert.equal(createLlmCacheKey({ baseUrl: "https://example.test/v1", model: "fixture", messages }), baseline.llmKey);
  for (const includeIntermediateStates of [true, false]) {
    const outputs = writeRecipeOutputs(recipe, tmp, { includeIntermediateStates });
    assert.equal(path.basename(outputs.jsonPath), `${baseline.slug}.recipe.json`);
    assert.equal(path.basename(outputs.ingredientsPath), `${baseline.slug}.ingredients.txt`);
    assert.equal(path.basename(outputs.mermaidPath), `${baseline.slug}.mmd`);
    assert.equal(fs.readFileSync(outputs.jsonPath, "utf8"), baseline.json);
    assert.equal(fs.readFileSync(outputs.ingredientsPath, "utf8"), baseline.ingredients);
    assert.equal(fs.readFileSync(outputs.mermaidPath, "utf8"), includeIntermediateStates ? baseline.shown : baseline.hidden);
  }
  assert.equal(JSON.stringify(recipe), before);
});

test("fixed HTML and completion pass through the offline workflow without leaking presentation into recipe JSON", async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "responsibility-workflow-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const recipe = validateRecipeAnalysis(JSON.parse(fs.readFileSync(path.join(fixtures, "responsibility-recipe.json"), "utf8")));
  const baseline = JSON.parse(fs.readFileSync(path.join(fixtures, "responsibility-baseline.json"), "utf8"));
  const url = recipe.metadata.sourceUrl!;
  const cacheDir = path.join(tmp, "cache");
  writeCacheEntry(cacheDir, { url, html: fs.readFileSync(path.join(fixtures, "responsibility-page.html"), "utf8"), fetchedAt: "2026-11-08T00:00:00.000Z", status: 200 });
  const results = await analyzeUrls({
    urls: [url],
    config: { llm: { baseUrl: "https://example.test", model: "fixture", apiKeyEnv: "KEY" }, cache: { directory: cacheDir, mode: "offline" }, output: { directory: path.join(tmp, "outputs"), includeIntermediateStates: false } },
    fetcher: async () => { throw new Error("Offline fixture must not fetch"); },
    client: { complete: async (messages) => {
      assert.match(messages[1]!.content, /json-ld/);
      return JSON.stringify(recipe);
    } },
  });
  const outputs = results[0]!.outputs;
  assert.equal(fs.readFileSync(outputs.jsonPath, "utf8"), baseline.json);
  assert.equal(fs.readFileSync(outputs.ingredientsPath, "utf8"), baseline.ingredients);
  assert.equal(fs.readFileSync(outputs.mermaidPath, "utf8"), baseline.hidden);
  const serialized = JSON.parse(fs.readFileSync(outputs.jsonPath, "utf8"));
  assert.deepEqual(serialized.nodes, recipe.nodes);
  assert.deepEqual(serialized.edges, recipe.edges);
  assert.doesNotMatch(JSON.stringify(serialized), /"cues"|"hot"|danach/);
});
