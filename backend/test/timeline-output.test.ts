import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeTimelineOutputs } from "../src/planning/timeline-output";
import { phase, recipeFor, inputFor } from "./timeline.test";
import { scheduleCooking } from "../src/planning/schedule-cooking";
import { renderGraphImages } from "../src/output/image-renderer";

test("timeline writer awaits two images and isolates failures from original files", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "timeline-"));
  try {
    const base = path.join(dir, "cake.mmd"); fs.writeFileSync(base, "original");
    const phases = [phase("mix", 5)], plan = scheduleCooking(inputFor(phases), recipeFor(phases));
    const result = await writeTimelineOutputs(plan, base, { renderImages: async paths => {
      fs.writeFileSync(paths.svgPath, "<svg/>"); await Promise.resolve(); fs.writeFileSync(paths.pngPath, "png");
    } });
    assert.equal(Object.keys(result).length, 4);
    for (const file of Object.values(result)) assert.ok(fs.statSync(file).size > 0);
    await assert.rejects(writeTimelineOutputs(plan, base, { renderImages: async paths => { fs.writeFileSync(paths.svgPath, "partial"); throw new Error("second failed"); } }), /second failed/);
    assert.equal(fs.existsSync(result.timelineSvgPath), false);
    assert.equal(fs.existsSync(result.timelinePngPath), false);
    assert.equal(fs.readFileSync(base, "utf8"), "original");
    assert.ok(fs.existsSync(result.timelineJsonPath));
    assert.ok(!fs.readdirSync(dir).some(name => name.startsWith(".timeline-")));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("real timeline Mermaid renders both image formats", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "timeline-real-"));
  try {
    const phases = [phase("knead", 10), phase("rise", 30, "unattended", ["knead"]), phase("topping", 10)];
    const result = await writeTimelineOutputs(scheduleCooking(inputFor(phases), recipeFor(phases)), path.join(dir, "bread.mmd"), { renderImages: renderGraphImages });
    assert.match(fs.readFileSync(result.timelineSvgPath, "utf8"), /<svg/);
    assert.equal(fs.readFileSync(result.timelinePngPath).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
