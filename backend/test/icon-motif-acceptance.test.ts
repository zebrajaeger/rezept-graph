import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { appleCakeIcons, appleCakeMotifs } from "./fixtures/apple-cake-icons";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import { acquirePresentationIcons } from "../src/output/acquire-icons";
import { writeRecipeOutputs } from "../src/output/output-writer";
import { png } from "./icon-library.test";

test("realistic apple-cake fixture acquires shared motifs and renders portable visible icons offline", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "apple-motifs-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "fixture terms" } }, root);
  const calls: string[] = [], warnings: string[] = [];
  const library = new IconLibrary(config, { generator: { generate: async request => {
    calls.push(request.canonicalKey); fs.writeFileSync(request.stagingPngPath, png);
    return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } };
  } } });
  const before = JSON.stringify(appleCakeIcons);
  const icons = await acquirePresentationIcons(appleCakeIcons, library, true, message => warnings.push(message), config.displayCacheDirectory);
  assert.deepEqual([...icons.keys()], Object.keys(appleCakeMotifs));
  assert.deepEqual(calls.sort(), [...new Set(Object.values(appleCakeMotifs))].sort());
  const snapshot = (dir: string): string => fs.readdirSync(dir, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()).map(entry => {
    const file = path.join(entry.parentPath, entry.name); return path.relative(dir, file) + ":" + fs.readFileSync(file).toString("base64");
  }).sort().join("\n");
  const originals = snapshot(config.libraryDirectory), derivatives = snapshot(config.displayCacheDirectory);
  const local = new IconLibrary({ ...config, mode: "local-only" }, { generator: { generate: async () => { throw Error("local mode must not generate"); } } });
  const launch = puppeteer.launch.bind(puppeteer);
  t.mock.method(puppeteer, "launch", async () => { throw Error("cache reuse must not decode again"); });
  assert.deepEqual(await acquirePresentationIcons(appleCakeIcons, local, true, message => warnings.push(message), config.displayCacheDirectory), icons);
  t.mock.restoreAll();
  assert.deepEqual(warnings, []);
  assert.equal(snapshot(config.libraryDirectory), originals); assert.equal(snapshot(config.displayCacheDirectory), derivatives);
  const off = new IconLibrary({ ...config, mode: "off" });
  assert.equal((await acquirePresentationIcons(appleCakeIcons, off, true, () => {}, config.displayCacheDirectory)).size, 0);
  const baseline = await writeRecipeOutputs(appleCakeIcons, path.join(root, "baseline"));
  const output = await writeRecipeOutputs(appleCakeIcons, path.join(root, "enriched"), { icons });
  for (const key of ["jsonPath", "ingredientsPath"] as const) assert.deepEqual(fs.readFileSync(output[key]), fs.readFileSync(baseline[key]));
  assert.equal(JSON.stringify(appleCakeIcons), before);
  const source = fs.readFileSync(output.mermaidPath, "utf8");
  assert.equal((source.match(/%% inline-icon/g) || []).length, 8);
  for (const text of ["3 Eier, Größe M", "250 g Mehl", "200 °C", "45 Minuten", "class p9 processHot;", "i4 -->|used_in| p9"]) assert.ok(source.includes(text), text);
  for (const id of ["i1", "i2", "i5", "i9", "p1", "s1"]) assert.doesNotMatch(source, new RegExp(`${id}@\\{ img:`));
  const moved = path.join(root, "moved"); fs.mkdirSync(moved);
  assert.equal((fs.readFileSync(output.svgPath, "utf8").match(/<image\b/g) || []).length, 8);
  fs.renameSync(output.svgPath, path.join(moved, "graph.svg")); fs.renameSync(output.pngPath, path.join(moved, "graph.png"));
  fs.rmSync(config.libraryDirectory, { recursive: true }); fs.rmSync(config.displayCacheDirectory, { recursive: true });
  const browser = await launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage(); await page.setOfflineMode(true);
  for (const [name, mime] of [["graph.svg", "image/svg+xml"], ["graph.png", "image/png"]]) {
    let bytes = fs.readFileSync(path.join(moved, name!));
    if (mime === "image/svg+xml") {
      // Mermaid SVG uses percentage width; rasterize at its viewBox size, not Image's 300px fallback.
      const svg = bytes.toString("utf8"), viewBox = /viewBox="([^"]+)"/.exec(svg)![1]!.split(/\s+/).map(Number);
      bytes = Buffer.from(svg.replace(/width="100%"/, `width="${viewBox[2]}" height="${viewBox[3]}"`));
    }
    const red = await page.evaluate(async uri => {
      const image = new Image(); image.src = uri; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0); const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0; for (let i = 0; i < pixels.length; i += 4) if (pixels[i]! > 240 && pixels[i + 1]! < 15 && pixels[i + 2]! < 15) count++;
      return count;
    }, `data:${mime};base64,${bytes.toString("base64")}`);
    assert.ok(red > 8 * 50, `${name}: visible fixture image pixels for eight nodes (${red})`);
  }
});
