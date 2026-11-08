import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { createDisplayIcon, selectBudgetedIcons } from "../src/icons/icon-display";
import { renderGraphImages } from "../src/output/image-renderer";
import { writeRecipeOutputs } from "../src/output/output-writer";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

test("offline derivatives decode PNGs, preserve originals/aspect ratio and visibly render", async (t) => {
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setOfflineMode(true);
  const uri = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1254; canvas.height = 627;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ff0000"; ctx.fillRect(0, 0, 627, 627);
    ctx.fillStyle = "#00ff00"; ctx.fillRect(627, 0, 627, 627);
    return canvas.toDataURL("image/png");
  });
  const input = Buffer.from(uri.split(",")[1]!, "base64");
  const original = Buffer.from(input);
  const icon = await createDisplayIcon(input);
  assert.deepEqual(input, original);
  assert.equal(icon.width, 96); assert.equal(icon.height, 48);
  assert.ok(icon.bytes.length <= 8192);
  assert.deepEqual(await createDisplayIcon(input), icon);
  const colors = await page.evaluate(async uri => {
    const image = new Image(); image.src = uri; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 96; canvas.height = 48;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    return [Array.from(ctx.getImageData(10, 10, 1, 1).data), Array.from(ctx.getImageData(80, 10, 1, 1).data)];
  }, icon.dataUri);
  assert.deepEqual(colors, [[255, 0, 0, 255], [0, 255, 0, 255]]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "display-graph-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const mermaidPath = path.join(dir, "graph.mmd"), svgPath = path.join(dir, "graph.svg"), pngPath = path.join(dir, "graph.png");
  fs.writeFileSync(mermaidPath, `---\nconfig:\n  htmlLabels: false\n---\nflowchart TD\n egg@{img: "${icon.dataUri}",label: "Egg 2 pieces",w: 48,h: 24}\n bake["Bake 20 minutes 180 C"]\n egg --> bake\n`);
  await renderGraphImages({ mermaidPath, svgPath, pngPath });
  assert.match(fs.readFileSync(svgPath, "utf8"), /<image[^>]+href="data:image\/png;base64,/);
  assert.equal(fs.readFileSync(pngPath).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
});

test("display preprocessing rejects oversized, non-PNG, malformed and undecodable bytes", async () => {
  const signatureOnly = Buffer.from("89504e470d0a1a0a", "hex");
  const forged = Buffer.alloc(33);
  signatureOnly.copy(forged); forged.writeUInt32BE(13, 8); forged.write("IHDR", 12); forged.writeUInt32BE(48, 16); forged.writeUInt32BE(48, 20);
  const oversizedDimensions = Buffer.from(forged); oversizedDimensions.writeUInt32BE(4097, 16);
  for (const bytes of [Buffer.from("not PNG"), signatureOnly, forged, oversizedDimensions, Buffer.alloc(4194305)]) {
    await assert.rejects(createDisplayIcon(bytes), /PNG|display/i);
  }
});

test("whole-source budgeting is deterministic, retains text, and counts duplicate embeddings", () => {
  const candidates = [{ id: "egg", data: "x".repeat(20000) }, { id: "bake", data: "y".repeat(20000) }, { id: "repeat", data: "x".repeat(20000) }];
  const serialize = (selected: ReadonlyMap<string, typeof candidates[number]>) => "flowchart TD\n" + candidates.map(c => `${c.id}[full text ${selected.get(c.id)?.data || ""}]`).join("\n");
  const selected = selectBudgetedIcons(candidates, c => c.id, serialize);
  assert.deepEqual([...selected.keys()], ["egg", "bake"]);
  assert.ok(serialize(selected).length <= 48000);
  assert.match(serialize(selected), /repeat\[full text \]/);
  assert.deepEqual([...selectBudgetedIcons(candidates, c => c.id, serialize)], [...selected]);
  assert.throws(() => selectBudgetedIcons(candidates, c => c.id, () => "x".repeat(48001)), /budget/i);
});

test("oversized actual Mermaid source is rejected and existing fatal writer cleanup applies", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "error-card-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const recipe: RecipeAnalysis = { metadata: { title: "Oversized" }, ingredients: [], ingredientList: ["Egg"], nodes: [{ id: "egg", type: "ingredient", label: "Egg" }], edges: [] };
  const old = await writeRecipeOutputs(recipe, dir);
  recipe.nodes[0]!.label = "x".repeat(60000);
  await assert.rejects(writeRecipeOutputs(recipe, dir), /source.*budget/i);
  assert.equal(fs.existsSync(old.svgPath), false); assert.equal(fs.existsSync(old.pngPath), false);
  assert.ok(fs.existsSync(old.jsonPath)); assert.ok(fs.existsSync(old.mermaidPath));
});
