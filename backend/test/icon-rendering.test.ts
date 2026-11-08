import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";
import { renderGraphImages } from "../src/output/image-renderer";

test("Mermaid image nodes remain visibly portable in relocated SVG and PNG offline", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portable icons & graphs "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const library = path.join(root, "library");
  const moved = path.join(root, "moved");
  fs.mkdirSync(library);
  fs.mkdirSync(moved);
  const browser = await puppeteer.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setOfflineMode(true);
  // A known two-color fixture makes actual raster visibility measurable.
  const fixture = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 48;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ff0000";
    context.fillRect(0, 0, 24, 48);
    context.fillStyle = "#00ff00";
    context.fillRect(24, 0, 24, 48);
    return canvas.toDataURL("image/png");
  });
  const asset = path.join(library, "known.png");
  fs.writeFileSync(asset, Buffer.from(fixture.split(",")[1]!, "base64"));
  const image = `data:image/png;base64,${fs.readFileSync(asset).toString("base64")}`;
  const source = path.join(root, "graph.mmd");
  fs.writeFileSync(source, `---\nconfig:\n  htmlLabels: false\n---\nflowchart TD\n  egg@{ img: "${image}", label: "Egg 2 pieces", pos: "b", w: 48, h: 48, constraint: "on" }\n  bake["Bake 20 minutes at 180 C"]\n  egg -->|uses| bake\n`);
  const svgPath = path.join(root, "graph.svg");
  const pngPath = path.join(root, "graph.png");
  await renderGraphImages({ mermaidPath: source, svgPath, pngPath });
  for (const file of [svgPath, pngPath]) fs.renameSync(file, path.join(moved, path.basename(file)));
  fs.rmSync(library, { recursive: true });
  const svg = fs.readFileSync(path.join(moved, "graph.svg"), "utf8");
  assert.match(svg, /<image[^>]+href="data:image\/png;base64,/);
  assert.doesNotMatch(svg, /<foreignObject|file:\/\/\/|https?:\/\/(?!www\.w3\.org)/);
  const text = svg.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  for (const label of ["Egg 2 pieces", "Bake 20 minutes at 180 C", "uses"]) assert.ok(text.includes(label));
  for (const name of ["graph.svg", "graph.png"]) {
    const bytes = fs.readFileSync(path.join(moved, name));
    const mime = name.endsWith("svg") ? "image/svg+xml" : "image/png";
    const counts = await page.evaluate(async (uri) => {
      const image = new Image();
      image.src = uri;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let red = 0, green = 0, dark = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i]! > 240 && pixels[i + 1]! < 15 && pixels[i + 2]! < 15) red++;
        if (pixels[i]! < 15 && pixels[i + 1]! > 240 && pixels[i + 2]! < 15) green++;
        if (pixels[i]! < 100 && pixels[i + 1]! < 100 && pixels[i + 2]! < 100 && pixels[i + 3]! > 200) dark++;
      }
      return { red, green, dark };
    }, `data:${mime};base64,${bytes.toString("base64")}`);
    assert.ok(counts.red > 500 && counts.green > 500, `${name}: both icon halves must be visible: ${JSON.stringify(counts)}`);
    assert.ok(counts.dark > 100, `${name}: labels and graph strokes must remain visible`);
  }
});
