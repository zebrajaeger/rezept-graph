import fs from "node:fs";
import path from "node:path";
import { renderGraphImages } from "../output/image-renderer";
import { CliError } from "../errors";
import type { CookingSchedule } from "./schedule-cooking";
import { renderTimeline } from "./render-timeline";

export function clearTimelineImages(graphMermaidPath: string) {
  const stem = graphMermaidPath.replace(/\.mmd$/, "");
  for (const suffix of [".timeline.svg", ".timeline.png"]) fs.rmSync(`${stem}${suffix}`, { force: true });
}

export async function writeTimelineOutputs(plan: CookingSchedule, graphMermaidPath: string, deps: { renderImages?: typeof renderGraphImages } = {}) {
  const stem = graphMermaidPath.replace(/\.mmd$/, "");
  const outputs = { timelineJsonPath: `${stem}.timeline.json`, timelineMermaidPath: `${stem}.timeline.mmd`, timelineSvgPath: `${stem}.timeline.svg`, timelinePngPath: `${stem}.timeline.png` };
  clearTimelineImages(graphMermaidPath);
  fs.writeFileSync(outputs.timelineJsonPath, `${JSON.stringify(plan, null, 2)}\n`);
  fs.writeFileSync(outputs.timelineMermaidPath, renderTimeline(plan));
  const stage = fs.mkdtempSync(path.join(path.dirname(graphMermaidPath), ".timeline-"));
  try {
    const paths = { mermaidPath: path.join(stage, "timeline.mmd"), svgPath: path.join(stage, "timeline.svg"), pngPath: path.join(stage, "timeline.png") };
    fs.copyFileSync(outputs.timelineMermaidPath, paths.mermaidPath);
    await (deps.renderImages || renderGraphImages)(paths);
    for (const image of [paths.svgPath, paths.pngPath]) if (!fs.statSync(image).isFile() || !fs.statSync(image).size) throw new Error("Empty timeline image");
    fs.renameSync(paths.svgPath, outputs.timelineSvgPath);
    fs.renameSync(paths.pngPath, outputs.timelinePngPath);
  } catch (error) {
    clearTimelineImages(graphMermaidPath);
    throw new CliError(`Timeline image generation failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  return outputs;
}
