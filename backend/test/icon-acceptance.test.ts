import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import { acquirePresentationIcons } from "../src/output/acquire-icons";
import { writeRecipeOutputs } from "../src/output/output-writer";
import { png } from "./icon-library.test";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

test("integrated real outputs are portable and deterministic with original recipe facts", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-acceptance-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  const recipe: RecipeAnalysis = { metadata: { title: "Egg fixture" }, ingredients: [{ id: "unrelated", name: "Ei", originalText: "2 Eier", quantity: 2 }], ingredientList: ["2 Eier"], nodes: [{ id: "unrelated-to-ingredient-id", type: "ingredient", label: "Eier" }, { id: "oven", type: "process", label: "backen", duration: "20 minutes", temperature: "180 C" }, { id: "hidden", type: "intermediate", label: "Dough" }], edges: [{ from: "unrelated-to-ingredient-id", to: "oven", type: "used_in" }, { from: "oven", to: "hidden", type: "produces" }] };
  let calls = 0;
  const library = new IconLibrary(config, { generator: { generate: async request => { calls++; fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } }; } } });
  const icons = await acquirePresentationIcons(recipe, library, false, () => {});
  assert.equal(icons.size, 2); assert.equal(calls, 2); assert.equal(icons.has("hidden"), false);
  const output = await writeRecipeOutputs(recipe, path.join(root, "out"), { includeIntermediateStates: false, icons });
  const originalMmd = fs.readFileSync(output.mermaidPath, "utf8"), originalJson = fs.readFileSync(output.jsonPath, "utf8"), originalIngredients = fs.readFileSync(output.ingredientsPath, "utf8");
  assert.doesNotMatch(originalMmd, /Dough/); assert.match(originalMmd, /180 C/);
  await writeRecipeOutputs(recipe, path.join(root, "out"), { includeIntermediateStates: false, icons });
  assert.equal(fs.readFileSync(output.mermaidPath, "utf8"), originalMmd);
  await writeRecipeOutputs(recipe, path.join(root, "baseline"), { includeIntermediateStates: false });
  const baseline = fs.readdirSync(path.join(root, "baseline"));
  assert.equal(fs.readFileSync(path.join(root, "baseline", baseline.find(name => name.endsWith("recipe.json"))!), "utf8"), originalJson);
  assert.equal(fs.readFileSync(path.join(root, "baseline", baseline.find(name => name.endsWith("ingredients.txt"))!), "utf8"), originalIngredients);
  fs.rmSync(config.libraryDirectory, { recursive: true });
  const moved = path.join(root, "moved"); fs.mkdirSync(moved); fs.renameSync(output.svgPath, path.join(moved, "graph.svg")); fs.renameSync(output.pngPath, path.join(moved, "graph.png"));
  const browser = await puppeteer.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage(); await page.setOfflineMode(true);
  for (const [name, mime] of [["graph.svg", "image/svg+xml"], ["graph.png", "image/png"]]) {
    const result = await page.evaluate(async uri => { const image = new Image(); image.src = uri; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0); const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data; let red = 0; for (let i = 0; i < pixels.length; i += 4) if (pixels[i]! > 240 && pixels[i + 1]! < 15 && pixels[i + 2]! < 15) red++; return red; }, `data:${mime};base64,${fs.readFileSync(path.join(moved, name!)).toString("base64")}`);
    assert.ok(result > 50, `${name}: actual red fixture icon visible`);
  }
});
