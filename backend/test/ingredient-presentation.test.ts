import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { presentationPlan, acquireIngredientDisplay } from "../src/icons/ingredient-presentation";
import { DisplayIconCache } from "../src/icons/icon-display-cache";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import { validatePng } from "../src/icons/png";
import { png } from "./icon-library.test";

test("egg policy bounds group generation and never rounds or invents counts", () => {
  const plan = (quantity?: number, unit = "piece") => presentationPlan({ kind: "single", concepts: ["egg"], state: "raw", ...(quantity !== undefined ? { quantity, unit } : {}) });
  assert.equal(plan(1).motifs[0]?.key, "ingredients/egg-raw");
  for (const count of [2, 3, 4, 5]) assert.equal(plan(count).motifs[0]?.key, `ingredients/egg-raw-count-${count}`);
  for (const count of [6, 12]) { assert.equal(plan(count).motifs[0]?.key, "ingredients/egg-raw"); assert.equal(plan(count).badge, count); }
  for (const quantity of [undefined, 0.5]) assert.equal(plan(quantity).badge, undefined);
  assert.equal(plan(3, "kg").motifs[0]?.key, "ingredients/egg-raw");
  assert.equal(plan(3, "kg").badge, undefined);
});

test("alternatives normalize symmetry without new generated composite identities", () => {
  const a = presentationPlan({ kind: "alternative", concepts: ["butter", "margarine"] });
  assert.deepEqual(a, presentationPlan({ kind: "alternative", concepts: ["margarine", "butter"] }));
  assert.deepEqual(a.motifs.map(m => m.key), ["ingredients/butter", "ingredients/margarine"]);
  assert.equal(a.alternative, true);
});

test("acquisition generates only requested groups and composes bounded reusable local derivatives", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ingredient-display-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "fixture" } }, root);
  const calls: string[] = [];
  const library = new IconLibrary(config, { generator: { generate: async request => {
    calls.push(request.canonicalKey); fs.writeFileSync(request.stagingPngPath, png);
    return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } };
  } } });
  const cache = new DisplayIconCache(config.displayCacheDirectory);
  const acquire = (quantity: number) => acquireIngredientDisplay({ kind: "single", concepts: ["egg"], state: "raw", quantity, unit: "piece" }, library, cache, "fixture");
  await acquire(3); await acquire(3);
  const six = await acquire(6), twelve = await acquire(12);
  assert.deepEqual(calls, ["ingredients/egg-raw-count-3", "ingredients/egg-raw"]);
  assert.ok(six && twelve); assert.notDeepEqual(six.bytes, twelve.bytes);
  for (const display of [six, twelve]) { assert.ok(display.bytes.length <= 8192); const dims = validatePng(display.bytes); assert.ok(dims.width <= 96 && dims.height <= 96); }
  const alt = await acquireIngredientDisplay({ kind: "alternative", concepts: ["butter", "margarine"] }, library, cache, "fixture"); assert.ok(alt);
  assert.deepEqual(calls.slice(2), ["ingredients/butter", "ingredients/margarine"]);
  const local = new IconLibrary({ ...config, mode: "local-only" });
  const fallback = await acquireIngredientDisplay({ kind: "single", concepts: ["egg"], state: "raw", quantity: 4, unit: "piece" }, local, cache, "fixture"); assert.ok(fallback);
  assert.deepEqual(await acquireIngredientDisplay({ kind: "single", concepts: ["egg"], state: "raw", quantity: 6, unit: "piece" }, local, new DisplayIconCache(config.displayCacheDirectory), "fixture"), six);
  const missing = new IconLibrary({ ...config, libraryDirectory: path.join(root, "missing"), mode: "local-only" });
  assert.equal(await acquireIngredientDisplay({ kind: "alternative", concepts: ["butter", "margarine"] }, missing, cache, "fixture"), undefined);
});
