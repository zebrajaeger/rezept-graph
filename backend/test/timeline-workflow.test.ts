import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { analyzeUrls } from "../src/workflows/analyze-urls";
import { writeFakeOutputs, fakeImages } from "./fixtures/fake-images";
import { writeTimelineOutputs } from "../src/planning/timeline-output";
import { phase, inputFor, recipeFor } from "./timeline.test";
import type { Config } from "../src/config/config";

test("workflow writes nine files, keeps original bytes, waits for timeline and isolates enrichment failure", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "timeline-workflow-"));
  try {
    const phases = [phase("mix", 5)], analysis = recipeFor(phases);
    const config: Config = { llm: { baseUrl: "fixture", model: "test", apiKeyEnv: "KEY" }, cache: { directory: dir, mode: "offline" }, output: { directory: dir, includeIntermediateStates: false } };
    let completed = 0, rendered = false;
    const deps = {
      getRecipePage: async () => ({ html: "fixture" }),
      extractRecipeContent: () => ({ sourceUrl: "fixture", extractionMethod: "text" as const, structuredRecipe: null, text: "mix" }),
      analyzeRecipeContent: async () => analysis,
      writeRecipeOutputs: writeFakeOutputs,
      writeTimelineOutputs: async (plan: Parameters<typeof writeTimelineOutputs>[0], file: string) => {
        const result = await writeTimelineOutputs(plan, file, { renderImages: fakeImages }); rendered = true; return result;
      }
    };
    const baseline = await writeFakeOutputs(analysis, dir, { includeIntermediateStates: false });
    const bytes = Object.values(baseline).map(file => fs.readFileSync(file).toString("hex"));
    const results = await analyzeUrls({ urls: ["fixture"], config, client: { complete: async () => JSON.stringify(inputFor(phases)) }, onProgress: () => { assert.ok(rendered); completed++; } }, deps);
    assert.equal(completed, 1);
    assert.equal(Object.keys(results[0]!.outputs).length, 9);
    assert.deepEqual(Object.values(baseline).map(file => fs.readFileSync(file).toString("hex")), bytes);
    const timeline = fs.readFileSync(results[0]!.outputs.timelineJsonPath, "utf8");
    await analyzeUrls({ urls: ["fixture"], config: { ...config, output: { ...config.output, includeIntermediateStates: true } }, client: { complete: async () => JSON.stringify(inputFor(phases)) } }, deps);
    assert.equal(fs.readFileSync(results[0]!.outputs.timelineJsonPath, "utf8"), timeline);
    await assert.rejects(analyzeUrls({ urls: ["fixture", "later"], config, client: { complete: async () => "{}" }, onProgress: () => completed++ }, deps), /planning/i);
    assert.equal(completed, 1);
    for (const file of Object.values(baseline)) assert.ok(fs.existsSync(file));
    assert.equal(fs.existsSync(results[0]!.outputs.timelineSvgPath), false);
    assert.equal(fs.existsSync(results[0]!.outputs.timelinePngPath), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
