import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { IngredientInterpreter, validateDescriptor, deterministicDescriptor } from "../src/icons/ingredient-semantics";
import { normalizeIcons } from "../src/icons/icon-config";

const settings = { enabled: true, baseUrl: "https://model.invalid/v1", model: "small", apiKeyEnv: "ICON_KEY", timeoutMs: 30, maxOutputBytes: 4096, cacheDirectory: "semantic" };
const single = { kind: "single", concepts: ["margarine"] };

test("ingredient descriptors reject unsafe meanings, extra fields and quantity conflicts", () => {
  assert.deepEqual(validateDescriptor(single, "weiche Margarine"), single);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["butter"] }, "Butter oder Margarine"), undefined);
  for (const value of [{ ...single, path: "../image" }, { kind: "single", concepts: ["unknown"] }, { kind: "single", concepts: ["../egg"] }, { kind: "single", concepts: ["egg"], quantity: 4, unit: "piece" }]) {
    assert.equal(validateDescriptor(value, "3 Eier"), undefined);
  }
  for (const label of ["kein Ei", "Butter und Mehl", "Ei-Ersatz", "Apfelsaft", "../egg", "x".repeat(1025)]) assert.equal(validateDescriptor({ kind: "single", concepts: ["egg"] }, label), undefined);
  assert.deepEqual(deterministicDescriptor("3 Eier, Größe M"), { kind: "single", concepts: ["egg"], state: "raw", quantity: 3, unit: "piece" });
  assert.equal(deterministicDescriptor("3 kg Eier")?.unit, "kg");
  assert.equal(deterministicDescriptor("Butter oder Margarine"), undefined);
  assert.equal(deterministicDescriptor("3 cartons Eier"), undefined);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["margarine"] }, "margarine/secret"), undefined);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["margarine"] }, "kein Margarineersatz"), undefined);
});

test("semantic opt-in, independent configuration, deduplication and offline validated cache", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ingredient-semantic-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "local-only", interpretation: settings, presentation: true }, root);
  assert.equal(normalizeIcons({ mode: "local-only" }, root).interpretation, undefined);
  assert.equal(config.interpretation?.model, "small");
  assert.equal(config.interpretation?.cacheDirectory, path.join(root, "semantic"));
  let calls = 0;
  const client = { complete: async () => { calls++; return JSON.stringify(single); } };
  const local = new IngredientInterpreter("local-only", config.interpretation, client);
  assert.equal(await local.resolve("weiche Margarine"), undefined); assert.equal(calls, 0);
  assert.equal(await new IngredientInterpreter("off", config.interpretation, client).resolve("Ei"), undefined);
  assert.equal(await new IngredientInterpreter("generate-missing", undefined, client).resolve("weiche Margarine"), undefined);
  const online = new IngredientInterpreter("generate-missing", config.interpretation, client);
  assert.deepEqual(await Promise.all([online.resolve("weiche Margarine"), online.resolve("weiche Margarine")]), [single, single]); assert.equal(calls, 1);
  assert.deepEqual(await new IngredientInterpreter("local-only", config.interpretation, client).resolve("weiche Margarine"), single); assert.equal(calls, 1);
  assert.equal(await new IngredientInterpreter("local-only", { ...config.interpretation!, model: "other" }, client).resolve("weiche Margarine"), undefined);
  const files = fs.readdirSync(config.interpretation!.cacheDirectory);
  fs.writeFileSync(path.join(config.interpretation!.cacheDirectory, files[0]!), JSON.stringify({ ...single, path: "unsafe" }));
  assert.equal(await new IngredientInterpreter("local-only", config.interpretation, client).resolve("weiche Margarine"), undefined);
});

test("semantic failures, oversized responses and timeouts are bounded and never retried", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ingredient-failure-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "local-only", interpretation: settings }, root).interpretation!;
  for (const complete of [async () => { throw Error("secret"); }, async () => "x".repeat(4097), async () => new Promise<string>(() => {})]) {
    let calls = 0;
    const interpreter = new IngredientInterpreter("generate-missing", config, { complete: async () => { calls++; return complete(); } });
    assert.equal(await interpreter.resolve("weiche Margarine"), undefined);
    assert.equal(await interpreter.resolve("weiche Margarine"), undefined); assert.equal(calls, 1);
  }
  for (const interpretation of [{ ...settings, timeoutMs: 0 }, { ...settings, maxOutputBytes: Infinity }, { ...settings, model: "" }, { ...settings, baseUrl: "file:///secret" }, { ...settings, cacheDirectory: "assets/recipe-icons" }]) assert.throws(() => normalizeIcons({ mode: "local-only", interpretation }, root));
});
