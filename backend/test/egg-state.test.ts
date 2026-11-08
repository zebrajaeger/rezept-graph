import assert from "node:assert/strict";
import test from "node:test";
import { deterministicDescriptor, validateDescriptor } from "../src/icons/ingredient-semantics";
import { presentationPlan, acquireIngredientDisplay } from "../src/icons/ingredient-presentation";
import { DisplayIconCache } from "../src/icons/icon-display-cache";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { png } from "./icon-library.test";

test("egg state is explicit, evidence-bound and separate from depicted form", () => {
  for (const [label, state] of [["3 Eier, Größe M", "raw"], ["2 rohe Eier", "raw"], ["2 gekochte Eier", "boiled"], ["hart gekochtes Ei", "boiled"], ["Spiegelei", "fried"], ["2 gebratene Eier", "fried"], ["boiled egg", "boiled"], ["fried egg", "fried"]] as const) {
    const descriptor = deterministicDescriptor(label);
    assert.equal(descriptor?.state, state, label);
    assert.equal(descriptor?.concepts[0], "egg");
  }
  assert.equal(validateDescriptor({ kind: "single", concepts: ["egg"], state: "boiled" }, "rohes Ei"), undefined);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["egg"], state: "raw" }, "gekochtes Ei"), undefined);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["egg"] }, "gekochtes Ei"), undefined);
  assert.equal(validateDescriptor({ kind: "single", concepts: ["butter"], state: "raw" }, "Butter"), undefined);
  for (const label of ["rohes oder gekochtes Ei", "gekochtes gebratenes Ei", "aufgeschlagenes Ei", "Rührei", "pochiertes Ei", "Eiweiß", "Eigelb"]) assert.equal(deterministicDescriptor(label), undefined, label);
});

test("state-specific identities and prompts never substitute cooked bases or legacy groups", () => {
  for (const state of ["raw", "boiled", "fried"] as const) {
    const plan = presentationPlan({ kind: "single", concepts: ["egg"], state, quantity: 3, unit: "piece" });
    assert.equal(plan.motifs[0]?.key, `ingredients/egg-${state}-count-3`);
    assert.equal(plan.fallback?.key, `ingredients/egg-${state}`);
    const six = presentationPlan({ kind: "single", concepts: ["egg"], state, quantity: 6, unit: "piece" });
    assert.equal(six.motifs[0]?.key, `ingredients/egg-${state}`); assert.equal(six.badge, 6);
  }
  const raw = presentationPlan({ kind: "single", concepts: ["egg"], state: "raw" });
  assert.match(raw.motifs[0]!.concept, /raw.*chicken egg.*intact shell/i);
  assert.match(presentationPlan({ kind: "single", concepts: ["egg"], state: "raw", quantity: 3, unit: "piece" }).motifs[0]!.concept, /raw.*intact shell/i);
});

test("local state misses retain text and preserve legacy bundles without migration", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "egg-state-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "fixture" } }, root);
  const writer = new IconLibrary(config, { generator: { generate: async request => {
    fs.writeFileSync(request.stagingPngPath, png);
    return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } };
  } } });
  for (const key of ["egg", "egg-count-3", "egg-boiled"]) await writer.acquire({ key: `ingredients/${key}`, concept: key }, "fixture");
  const legacy = path.join(config.libraryDirectory, "ingredients/egg/metadata.json"), before = fs.readFileSync(legacy);
  const local = new IconLibrary({ ...config, mode: "local-only" });
  const cache = new DisplayIconCache(config.displayCacheDirectory);
  for (const quantity of [1, 3, 6]) assert.equal(await acquireIngredientDisplay({ kind: "single", concepts: ["egg"], state: "raw", quantity, unit: "piece" }, local, cache, "fixture"), undefined);
  assert.ok(await acquireIngredientDisplay({ kind: "single", concepts: ["egg"], state: "boiled" }, local, cache, "fixture"));
  assert.deepEqual(fs.readFileSync(legacy), before);
  assert.equal(fs.existsSync(path.join(config.libraryDirectory, "ingredients/egg-raw")), false);
});
