import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const src = path.resolve(__dirname, "../../src");

test("responsibility imports stay within concrete allowed boundaries", () => {
  const allowed: Record<string, string[]> = {
    analysis: ["recipe", "llm", "ingestion"],
    recipe: ["recipe"],
    llm: ["llm", "config"],
    discovery: ["discovery"],
    ingestion: ["ingestion", "config"],
    presentation: ["presentation", "recipe"],
    output: ["output", "recipe", "presentation"],
    planning: ["planning", "recipe", "llm", "ingestion", "analysis", "output", "presentation"],
    workflows: ["workflows", "ingestion", "analysis", "discovery", "llm", "output", "config", "planning"],
    config: ["config", "cli"],
    cli: ["cli", "config", "workflows", "llm", "ingestion", "output", "planning"],
  };
  for (const [area, dependencies] of Object.entries(allowed)) {
    for (const name of fs.readdirSync(path.join(src, area)).filter((name) => name.endsWith(".ts"))) {
      const content = fs.readFileSync(path.join(src, area, name), "utf8");
      for (const match of content.matchAll(/from "(\.[^"]+)"/g)) {
        const target = path.relative(src, path.resolve(src, area, match[1]!)).split(path.sep);
        if (target.length > 1) assert.ok(dependencies.includes(target[0]!), `${area}/${name} imports ${match[1]}`);
      }
      if (area === "analysis") assert.doesNotMatch(content, /createLlmClient|getOrCreateLlmResponse|responseCacheDir/);
      if (area === "presentation") assert.doesNotMatch(content, /classDef|processHot|flowchart|node:fs|#[0-9a-f]{6}/);
      if (area === "workflows") assert.doesNotMatch(content, /console\.|process\.(stdout|stderr|argv)/);
      if (area === "output") assert.doesNotMatch(content, /isHotProcess|isPassiveProcess|bridgeHiddenIntermediateEdges/);
    }
  }
});
