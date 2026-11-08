import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "../src/config/config";
import { writeRecipeOutputs } from "../src/output/output-writer";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";
import { analyzeUrls } from "../src/workflows/analyze-urls";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import { png } from "./icon-library.test";
import { fakePlanning } from "./fixtures/fake-planning";

test("loaded icon configuration normalizes paths and rejects malformed supplied values", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-config-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, "config.json");
  const config = { llm: { baseUrl: "https://example.test", model: "fixture", apiKeyEnv: "KEY", timeoutMs: 1 }, cache: { directory: "cache", mode: "offline" }, output: { directory: "out", includeIntermediateStates: true }, icons: { mode: "local-only", libraryDirectory: "icons" } };
  fs.writeFileSync(file, JSON.stringify(config));
  assert.equal(loadConfig(file).icons?.libraryDirectory, path.join(root, "icons"));
  fs.writeFileSync(file, JSON.stringify({ ...config, icons: false }));
  assert.throws(() => loadConfig(file), /icons/);
});

test("writer enriches a pure presentation, preserves facts/cues/edges and falls back nonfatally", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-writer-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const analysis: RecipeAnalysis = { metadata: { title: "Egg" }, ingredients: [], ingredientList: ["2 Eier"], nodes: [{ id: "egg", type: "ingredient", label: "Eier" }, { id: "bake", type: "process", label: "backen", temperature: "180 C", duration: "20 minutes" }], edges: [{ from: "egg", to: "bake", type: "used_in" }] };
  const original = JSON.stringify(analysis);
  const renderImages = async ({ svgPath, pngPath }: { svgPath: string; pngPath: string }) => { fs.writeFileSync(svgPath, "svg"); fs.writeFileSync(pngPath, "png"); };
  const dataUri = "data:image/png;base64,iVBORw0KGgo=";
  const result = await writeRecipeOutputs(analysis, root, { icons: new Map([["egg", { dataUri, width: 1, height: 1 }]]) }, { renderImages });
  const source = fs.readFileSync(result.mermaidPath, "utf8");
  assert.match(source, /%% inline-icon/); assert.match(source, /Eier/); assert.match(source, /180 C/); assert.match(source, /processHot/); assert.match(source, /egg -->/);
  assert.equal(JSON.stringify(analysis), original); assert.doesNotMatch(fs.readFileSync(result.jsonPath, "utf8"), /data:image|icons/);
  const baseline = await writeRecipeOutputs(analysis, root, {}, { renderImages }); assert.doesNotMatch(fs.readFileSync(baseline.mermaidPath, "utf8"), /img:/);
});

test("workflow generation failure is nonfatal but rendering failure after icons stays fatal", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-workflow-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const recipe: RecipeAnalysis = { metadata: { title: "Egg" }, ingredients: [], ingredientList: ["2 Eier"], nodes: [{ id: "egg", type: "ingredient", label: "Eier" }], edges: [] };
  const icons = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  const config = { llm: { baseUrl: "https://example.test", model: "fixture", apiKeyEnv: "KEY" }, cache: { directory: root, mode: "offline" as const }, output: { directory: path.join(root, "outputs"), includeIntermediateStates: false }, icons };
  let progress = 0;
  const common = { getRecipePage: async () => ({ html: "fixture" }), extractRecipeContent: () => ({ sourceUrl: "recipe", text: "fixture", extractionMethod: "text" as const, structuredRecipe: null }), analyzeRecipeContent: async () => recipe, enrichPlanning: fakePlanning, clearTimelineImages: () => {}, writeTimelineOutputs: async () => ({ timelineJsonPath: "f", timelineMermaidPath: "g", timelineSvgPath: "h", timelinePngPath: "i" }) };
  const result = await analyzeUrls({ urls: ["recipe"], config, client: { complete: async () => "{}" }, onProgress: () => progress++ }, { ...common, createIconLibrary: (configuration, warn) => new IconLibrary(configuration, { warn, generator: { generate: async () => { throw new Error("secret"); } } }) });
  assert.equal(progress, 1);
  const original = result[0]!.outputs;
  for (const file of [original.jsonPath, original.ingredientsPath, original.mermaidPath, original.svgPath, original.pngPath]) assert.ok(fs.statSync(file).size);
  await assert.rejects(analyzeUrls({ urls: ["recipe"], config, client: { complete: async () => "{}" }, onProgress: () => progress++ }, { ...common, createIconLibrary: configuration => new IconLibrary(configuration, { generator: { generate: async request => { fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } }; } } }), writeRecipeOutputs: (analysis, directory, options) => writeRecipeOutputs(analysis, directory, options, { renderImages: async ({ mermaidPath }) => { assert.match(fs.readFileSync(mermaidPath, "utf8"), /%% inline-icon/); throw Error("renderer fixture failed"); } }) }), /renderer fixture failed/);
  assert.equal(progress, 1);
  assert.equal(fs.existsSync(original.svgPath), false); assert.equal(fs.existsSync(original.pngPath), false);
});
