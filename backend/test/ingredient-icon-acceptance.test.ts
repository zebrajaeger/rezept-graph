import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { normalizeIcons } from "../src/icons/icon-config";
import { IconLibrary } from "../src/icons/library";
import { IngredientInterpreter } from "../src/icons/ingredient-semantics";
import { acquirePresentationIcons } from "../src/output/acquire-icons";
import { writeRecipeOutputs } from "../src/output/output-writer";
import { trialRecipe, createTrialFixtures } from "./fixtures/ingredient-icon-trial";

test("five ingredient cases render real portable offline graph and contact sheet without borrowing quantities", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ingredient-trial-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const fixtures = await createTrialFixtures();
  const config = normalizeIcons({ mode: "generate-missing", presentation: true, interpretation: { enabled: true, baseUrl: "https://invalid", model: "fixture", apiKeyEnv: "NONE" }, generator: { backend: "codex-cli", executable: "fixture", termsReference: "Local hand-drawn test fixtures, not AI output" } }, root);
  const calls: string[] = [];
  const library = new IconLibrary(config, { generator: { generate: async request => {
    calls.push(request.canonicalKey);
    fs.writeFileSync(request.stagingPngPath, fixtures.get(request.canonicalKey)!);
    return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "local-fixture", cliVersion: "1", reportedImageModel: null } };
  } } });
  let semanticCalls = 0;
  const interpreter = new IngredientInterpreter("generate-missing", config.interpretation, { complete: async messages => {
    semanticCalls++;
    const label = (JSON.parse(messages[1]!.content) as { ingredientText: string }).ingredientText;
    return JSON.stringify(label.includes("oder") ? { kind: "alternative", concepts: ["butter", "margarine"] } : { kind: "single", concepts: ["margarine"] });
  } });
  const before = JSON.stringify(trialRecipe), warnings: string[] = [];
  const icons = await acquirePresentationIcons(trialRecipe, library, true, message => warnings.push(message), config.displayCacheDirectory, { interpreter, presentation: true });
  assert.equal(icons.size, 5); assert.deepEqual(warnings, []); assert.equal(semanticCalls, 2);
  assert.deepEqual(calls.sort(), ["ingredients/butter", "ingredients/margarine", "ingredients/egg-raw-count-3", "ingredients/egg-raw"].sort());
  const local = new IconLibrary({ ...config, mode: "local-only" });
  const cached = new IngredientInterpreter("local-only", config.interpretation, { complete: async () => { throw Error("No network permitted"); } });
  t.mock.method(puppeteer, "launch", async () => { throw Error("All derivatives must reuse persistent cache"); });
  assert.deepEqual(await acquirePresentationIcons(trialRecipe, local, true, () => {}, config.displayCacheDirectory, { interpreter: cached, presentation: true }), icons);
  t.mock.restoreAll();
  assert.equal(JSON.stringify(trialRecipe), before);
  const baseline = await writeRecipeOutputs(trialRecipe, path.join(root, "baseline"));
  const output = await writeRecipeOutputs(trialRecipe, path.join(root, "enriched"), { icons });
  for (const key of ["jsonPath", "ingredientsPath"] as const) assert.deepEqual(fs.readFileSync(output[key]), fs.readFileSync(baseline[key]));
  assert.equal((fs.readFileSync(output.svgPath, "utf8").match(/<image\b/g) || []).length, 5);
  assert.ok(fs.statSync(output.pngPath).size > 1000);
  fs.rmSync(config.libraryDirectory, { recursive: true }); fs.rmSync(config.displayCacheDirectory, { recursive: true });
  const browser = await puppeteer.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage(); await page.setOfflineMode(true); await page.setViewport({ width: 1000, height: 540 });
  await page.setContent(`<html><head><style>body{font:18px sans-serif;background:white;color:#18212b;margin:24px}h1{font-size:24px}.row{display:flex;gap:20px}.item{width:170px;text-align:center}.actual img{width:48px;height:48px}.large img{width:144px;height:144px;image-rendering:auto}p{min-height:48px}small{font-size:14px}</style></head><body><h1>Offline layout trial — hand-drawn fixtures, not generated AI icons</h1><p>Actual icon size: 48 px · Enlarged preview: 3× · Visual acceptance pending</p><div class="row">${trialRecipe.nodes.map(node => `<div class="item"><p>${node.label}</p><div class="actual"><img src="${icons.get(node.id)!.dataUri}"></div><p><small>48 px</small></p><div class="large"><img src="${icons.get(node.id)!.dataUri}"></div></div>`).join("")}</div></body></html>`);
  await page.evaluate(async () => Promise.all(Array.from(document.images).map(image => image.decode())));
  const sheet = path.join(root, "contact-sheet.png"); await page.screenshot({ path: sheet, fullPage: true });
  for (const file of [output.svgPath, output.pngPath]) {
    let bytes = fs.readFileSync(file); const svg = file.endsWith(".svg");
    if (svg) { const text = bytes.toString(), box = /viewBox="([^"]+)"/.exec(text)![1]!.split(/\s+/); bytes = Buffer.from(text.replace('width="100%"', `width="${box[2]}" height="${box[3]}"`)); }
    const pixels = await page.evaluate(async uri => { const image = new Image(); image.src = uri; await image.decode(); return image.naturalWidth * image.naturalHeight; }, `data:${svg ? "image/svg+xml" : "image/png"};base64,${bytes.toString("base64")}`);
    assert.ok(pixels > 1000);
  }
  // Explicit opt-in exports review evidence; ordinary tests leave no repository artifacts.
  const preview = process.env.INGREDIENT_ICON_PREVIEW_DIR;
  if (preview) {
    fs.mkdirSync(preview, { recursive: true });
    fs.copyFileSync(sheet, path.join(preview, "contact-sheet.png"));
    fs.copyFileSync(output.pngPath, path.join(preview, "graph.png"));
    fs.copyFileSync(output.svgPath, path.join(preview, "graph.svg"));
  }
});
