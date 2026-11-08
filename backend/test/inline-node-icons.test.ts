import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { preparePresentation } from "../src/presentation/prepare-presentation";
import { enrichIconPresentation } from "../src/output/icon-presentation";
import { renderMermaid } from "../src/output/mermaid";
import { renderGraphImages } from "../src/output/image-renderer";
import { png } from "./icon-library.test";

test("inline icons preserve green stadium and position image inside left of text in portable SVG", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "inline-icons-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const presentation = preparePresentation({ nodes: [{ id: "egg", type: "ingredient", label: "3 Eier" }], edges: [] });
  const source = renderMermaid(enrichIconPresentation(presentation, new Map([["egg", { dataUri: `data:image/png;base64,${png.toString("base64")}`, width: 1, height: 1 }]])));
  assert.match(source, /egg\(\[/); assert.doesNotMatch(source, /@\{ img:/);
  const paths = { mermaidPath: path.join(root, "graph.mmd"), svgPath: path.join(root, "graph.svg"), pngPath: path.join(root, "graph.png") };
  fs.writeFileSync(paths.mermaidPath, source); await renderGraphImages(paths);
  const svg = fs.readFileSync(paths.svgPath, "utf8"); assert.doesNotMatch(svg, /foreignObject/);
  const browser = await puppeteer.launch({ headless: true }); t.after(() => browser.close());
  const page = await browser.newPage(); await page.setOfflineMode(true); await page.setContent(svg);
  const result = await page.evaluate(() => {
    const node = document.querySelector("g.node")!;
    const image = node.querySelector("image")!, shape = node.querySelector("path,rect")!, label = node.querySelector(".label")!;
    const i = image.getBoundingClientRect(), s = shape.getBoundingClientRect(), l = label.getBoundingClientRect();
    return { inside: i.left >= s.left && i.right <= s.right && i.top >= s.top && i.bottom <= s.bottom, left: i.right <= l.left, fill: getComputedStyle(shape).fill, text: label.textContent };
  });
  assert.equal(result.inside, true); assert.equal(result.left, true); assert.equal(result.fill, "rgb(230, 244, 234)"); assert.match(result.text!, /3 Eier/);
  assert.ok(fs.statSync(paths.pngPath).size > 100);
});
