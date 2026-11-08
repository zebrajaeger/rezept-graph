import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runRenderer } from "../src/output/image-renderer";

test("zero-exit renderer error SVGs are rejected, valid error CSS is not", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-validation-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, "graph.mmd"), output = path.join(dir, "graph.svg"), runner = path.join(dir, "runner.cjs");
  fs.writeFileSync(source, "flowchart TD\n a[Egg]");
  for (const svg of ['<svg><text class="error-text">Syntax error</text></svg>', '<svg><text><tspan>Maximum</tspan><tspan> text size in</tspan><tspan> diagram exceeded</tspan></text></svg>', '<svg><path class="error-icon"/></svg>']) {
    fs.writeFileSync(runner, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('--output')+1],${JSON.stringify(svg)});`);
    await assert.rejects(runRenderer(process.execPath, [runner, "--input", source, "--output", output]), /error diagram/i);
  }
  fs.writeFileSync(runner, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('--output')+1],'<svg><style>.error-icon{fill:red}.error-text{stroke:red}</style><text>Egg</text></svg>');`);
  await runRenderer(process.execPath, [runner, "--input", source, "--output", output]);
});
