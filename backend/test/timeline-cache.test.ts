import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createCompletionClient } from "../src/llm/completion-client";
import { createAnalysisMessages } from "../src/analysis/recipe-analyzer";
import { enrichPlanning } from "../src/planning/enrich-planning";
import { breadSample, cakeSample } from "./fixtures/timeline-samples";
import { scheduleCooking } from "../src/planning/schedule-cooking";

test("analysis and enrichment have separate cache entries and repeated planning reuses enrichment", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "timeline-cache-"));
  try {
    const { analysis, input } = breadSample();
    const content = { sourceUrl: "fixture", extractionMethod: "text" as const, structuredRecipe: null, text: "Bread fixture" };
    let calls = 0;
    const client = createCompletionClient({ baseUrl: "fixture", model: "fixture", apiKeyEnv: "KEY", responseCacheDir: dir }, {}, {
      complete: async messages => { calls++; return JSON.stringify(messages[1]!.content.includes("single-person-cooking-timeline") ? input : analysis); }
    });
    await client.complete(createAnalysisMessages(content));
    const first = await enrichPlanning({ content, analysis, client });
    assert.deepEqual(await enrichPlanning({ content, analysis, client }), first);
    assert.equal(calls, 2);
    assert.equal(fs.readdirSync(dir).length, 2);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("representative bread and cake schedules preserve one-cook attention and source back times", () => {
  for (const sample of [breadSample(), cakeSample()]) {
    const plan = scheduleCooking(sample.input, sample.analysis);
    const attention = plan.phases.filter(p => p.attention !== "unattended").sort((a, b) => a.start.max! - b.start.max!);
    for (let i = 1; i < attention.length; i++) assert.ok(attention[i]!.start.max! >= attention[i - 1]!.end.max!);
    assert.ok(plan.total.max! >= plan.total.min!);
    for (const phase of plan.phases) assert.ok(phase.start.max! >= phase.start.min!);
  }
  const sample = cakeSample(), plan = scheduleCooking(sample.input, sample.analysis);
  const bake = plan.phases.find(p => p.id === "p9")!, brush = plan.phases.find(p => p.id === "p10")!;
  assert.equal(brush.start.max! - bake.start.max!, 45);
  assert.deepEqual(plan.phases.find(p => p.id === "p12")!.duration, sample.input.phases.find(p => p.id === "p12")!.duration);
});
