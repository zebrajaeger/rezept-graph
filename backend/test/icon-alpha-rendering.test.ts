import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { DisplayIconCache } from "../src/icons/icon-display-cache";
import { hasTransparentBackground } from "../src/icons/png-background";
import { preparePresentation } from "../src/presentation/prepare-presentation";
import { enrichIconPresentation } from "../src/output/icon-presentation";
import { renderMermaid } from "../src/output/mermaid";
import { renderGraphImages } from "../src/output/image-renderer";
import { iconFixture } from "./fixtures/transparent-icon";

test("white cutouts retain transparency through resizing, persisted cache, SVG and final PNG", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "alpha-rendering-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const original = iconFixture({ size: 200 }), saved = Buffer.from(original);
  const directory = path.join(root, "cache");
  const display = await new DisplayIconCache(directory).acquire(original);
  assert.equal(display.width, 96); assert.equal(hasTransparentBackground(display.bytes), true);
  const cached = await new DisplayIconCache(directory, { resize: async () => { throw Error("cache must retain alpha"); } }).acquire(original);
  assert.deepEqual(cached.bytes, display.bytes); assert.deepEqual(original, saved);
  const presentation = preparePresentation({ nodes: [{ id: "egg", type: "ingredient", label: "3 Eier" }], edges: [] });
  const source = renderMermaid(enrichIconPresentation(presentation, new Map([["egg", display]])));
  const paths = { mermaidPath: path.join(root, "graph.mmd"), svgPath: path.join(root, "graph.svg"), pngPath: path.join(root, "graph.png") };
  fs.writeFileSync(paths.mermaidPath, source); await renderGraphImages(paths);
  const svg = fs.readFileSync(paths.svgPath, "utf8"); assert.match(svg, /data:image\/png;base64,/);
  const browser = await puppeteer.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage(); await page.setOfflineMode(true); await page.setContent(svg);
  const bounds = await page.evaluate(() => {
    const image = document.querySelector("g.node image")!;
    return { x: Number(image.getAttribute("x")), y: Number(image.getAttribute("y")), width: Number(image.getAttribute("width")), height: Number(image.getAttribute("height")) };
  });
  for (const [mime, bytes] of [["image/svg+xml", Buffer.from(svg)], ["image/png", fs.readFileSync(paths.pngPath)]] as const) {
    const counts = await page.evaluate(async uri => {
      const image = new Image(); image.src = uri; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let white = 0, green = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255 && data[i + 3] === 255) white++;
        if (data[i] === 230 && data[i + 1] === 244 && data[i + 2] === 234 && data[i + 3] === 255) green++;
      }
      return { white, green };
    }, `data:${mime};base64,${bytes.toString("base64")}`);
    assert.ok(counts.white > 100, `${mime}: white foreground remains`);
    assert.ok(counts.green > 100, `${mime}: green node remains`);
  }
  // Inspect pixels within the SVG image bounds, not just elsewhere in the green node.
  const samples = await page.evaluate(async svgText => {
    const svgElement = document.querySelector("svg")!, element = document.querySelector("g.node image") as SVGGraphicsElement;
    const box = element.getBBox(), matrix = element.getCTM()!, view = svgElement.viewBox.baseVal;
    const image = new Image(); image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    return [0.1, 0.5].map(fraction => {
      const point = new DOMPoint(box.x + box.width * fraction, box.y + box.height * fraction).matrixTransform(matrix);
      const x = Math.floor((point.x - view.x) * canvas.width / view.width), y = Math.floor((point.y - view.y) * canvas.height / view.height);
      return Array.from(ctx.getImageData(x, y, 1, 1).data);
    });
  }, svg);
  assert.deepEqual(samples, [[230, 244, 234, 255], [255, 255, 255, 255]]);
  assert.ok(bounds.width > 0);
});
