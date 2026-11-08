import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { writeRecipeOutputs } from "../src/output/output-writer";
import { renderGraphImages, runRenderer } from "../src/output/image-renderer";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

const recipe: RecipeAnalysis = { metadata: { title: "Image fixture" }, ingredients: [], ingredientList: ["Bread"], nodes: [{ id: "bread", type: "ingredient", label: "Bread" }, { id: "dough", type: "intermediate", label: "Dough" }], edges: [{ from: "bread", to: "dough", type: "produces" }] };

test("output awaits both staged images and preserves names and presentation on repeat", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graph & images "));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const includeIntermediateStates of [true, false]) {
    const outputs = await writeRecipeOutputs(recipe, dir, { includeIntermediateStates }, {
      renderImages: async ({ mermaidPath, svgPath, pngPath }) => {
        const text = fs.readFileSync(mermaidPath, "utf8");
        assert.equal(text.includes("Dough"), includeIntermediateStates);
        await Promise.resolve();
        fs.writeFileSync(svgPath, text);
        fs.writeFileSync(pngPath, text);
      },
    });
    assert.equal(Object.keys(outputs).length, 5);
    assert.equal(outputs.svgPath, outputs.mermaidPath.replace(/\.mmd$/, ".svg"));
    assert.equal(outputs.pngPath, outputs.mermaidPath.replace(/\.mmd$/, ".png"));
    assert.equal(fs.readFileSync(outputs.svgPath, "utf8"), fs.readFileSync(outputs.pngPath, "utf8"));
    assert.equal(fs.readdirSync(dir).length, 5);
  }
});

test("failed second render, invalid images, and publication failure remove both old images only", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graph-failure-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const renderImages = async ({ svgPath, pngPath }: { svgPath: string; pngPath: string }) => { fs.writeFileSync(svgPath, "svg"); fs.writeFileSync(pngPath, "png"); };
  for (const failure of ["second", "empty", "missing", "publish"]) {
    const old = await writeRecipeOutputs(recipe, dir, {}, { renderImages });
    fs.writeFileSync(path.join(dir, "unrelated.svg"), "keep");
    if (failure === "publish") {
      const rename = fs.renameSync;
      t.mock.method(fs, "renameSync", (from: fs.PathLike, to: fs.PathLike) => {
        if (String(to) === old.pngPath) throw new Error("publication failed");
        return rename(from, to);
      });
    }
    await assert.rejects(writeRecipeOutputs(recipe, dir, {}, {
      renderImages: async ({ svgPath, pngPath }) => {
        assert.equal(fs.existsSync(old.svgPath), false);
        assert.equal(fs.existsSync(old.pngPath), false);
        fs.writeFileSync(svgPath, "svg");
        if (failure === "second") throw new Error("second render failed");
        if (failure !== "missing") fs.writeFileSync(pngPath, failure === "empty" ? "" : "png");
      },
    }));
    t.mock.restoreAll();
    assert.equal(fs.existsSync(old.svgPath), false);
    assert.equal(fs.existsSync(old.pngPath), false);
    for (const file of [old.jsonPath, old.ingredientsPath, old.mermaidPath]) assert.ok(fs.statSync(file).size);
    assert.equal(fs.readFileSync(path.join(dir, "unrelated.svg"), "utf8"), "keep");
    assert.equal(fs.readdirSync(dir).some(name => name.startsWith(".render-")), false);
  }
});

test("adapter shares source/settings and invokes installed Node CLI without a shell", async () => {
  const requests: Array<{ args: string[]; executable: string }> = [];
  await renderGraphImages({ mermaidPath: "C:/space & data/source.mmd", svgPath: "C:/space & data/graph.svg", pngPath: "C:/space & data/graph.png" }, {
    run: async (executable, args) => { requests.push({ executable, args }); },
  });
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.executable, process.execPath);
    assert.ok(request.args[0]?.endsWith("cli.js"));
    assert.ok(request.args.includes("C:/space & data/source.mmd"));
    assert.ok(request.args.includes("white"));
  }
  assert.deepEqual(requests[0]!.args.slice(0, -1), requests[1]!.args.slice(0, -1));
});

test("renderer process reports missing executables, bounded diagnostics, and terminates timeout", async () => {
  await assert.rejects(runRenderer("nonexistent-graph-renderer", []), /setup|install/i);
  await assert.rejects(runRenderer(process.execPath, ["-e", "process.stderr.write('browser missing '+ 'x'.repeat(20000));process.exit(1)"]), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /browser missing/);
    assert.ok(error.message.length < 6000);
    return true;
  });
  const start = Date.now();
  await assert.rejects(runRenderer(process.execPath, ["-e", "setInterval(()=>{},1000)"], 100), /timeout/i);
  assert.ok(Date.now() - start < 5000);
});

test("real installed renderer generates valid SVG and PNG without recipe or LLM calls", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "real graph & images "));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const outputs = await writeRecipeOutputs(recipe, dir);
  const svg = fs.readFileSync(outputs.svgPath, "utf8");
  assert.match(svg, /<svg/);
  assert.match(svg, /Bread/);
  const png = fs.readFileSync(outputs.pngPath);
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0);
});
