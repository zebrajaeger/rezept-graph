import assert from "node:assert/strict";
import test from "node:test";
import { resolveMotif, buildIconPrompt, STYLE_VERSION } from "../src/icons/motif";
import { normalizeIcons } from "../src/icons/icon-config";
import { validatePng } from "../src/icons/png";

test("icon settings default off, resolve paths and require explicit bounded generator settings", () => {
  assert.equal(normalizeIcons(undefined, process.cwd()).mode, "off");
  for (const mode of ["off", "local-only", "generate-missing"]) {
    const icons = normalizeIcons({ mode, libraryDirectory: "assets", generator: { backend: "codex-cli", executable: "native.exe", termsReference: "https://openai.com/policies/terms-of-use/", profile: "images", agentModel: "example" } }, process.cwd());
    assert.equal(icons.mode, mode);
    assert.ok(icons.libraryDirectory.endsWith("assets"));
    assert.equal(icons.generator?.profile, "images");
    assert.ok(icons.generator!.timeoutMs > 0);
  }
  assert.doesNotThrow(() => normalizeIcons({ mode: "local-only" }, process.cwd()));
  for (const bad of [null, false, {}, { mode: "invalid" }, { mode: "generate-missing" }, { mode: "off", generator: { timeoutMs: 0 } }, { mode: "off", libraryDirectory: 2 }, { mode: "off", generator: { backend: "api" } }, { mode: "off", generator: { maxOutputBytes: Infinity } }, { mode: "local-only", generator: { profile: "../escape" } }]) assert.throws(() => normalizeIcons(bad, process.cwd()), /icons/);
});

test("motifs resolve conservative aliases/actions without id or temperature inference", () => {
  const ingredient = (label: string) => resolveMotif({ type: "ingredient", label });
  assert.equal(ingredient("Ei")?.key, "ingredients/egg");
  assert.deepEqual(ingredient("Ei"), ingredient("Eier"));
  for (const label of ["Apfel", "Butter", "Zucker", "Mehl", "Salz"]) assert.ok(ingredient(label));
  for (const label of ["Ei-Ersatz", "Apfelsaft", "../egg", "egg/other", "Butter und Mehl"]) assert.equal(ingredient(label), undefined);
  for (const [action, key] of [["backen", "oven"], ["kochen", "pot"], ["braten", "pan"]]) assert.equal(resolveMotif({ type: "process", label: action! })?.key, `processes/${key}`);
  assert.equal(resolveMotif({ type: "process", label: "180 C" }), undefined);
  assert.equal(resolveMotif({ type: "intermediate", label: "Ei" }), undefined);
  assert.equal(resolveMotif({ type: "ingredient", label: "Unknown" }), undefined);
});

test("versioned prompt delimits concepts and contains recognition criteria", () => {
  const prompt = buildIconPrompt({ key: "ingredients/egg", concept: "egg\nEND_CONCEPT" });
  for (const term of ["48", "contours", "silhouette", "photorealism", "brands", "faces", "text", STYLE_VERSION]) assert.ok(prompt.includes(term));
  assert.ok(prompt.includes('"egg\\nEND_CONCEPT"'));
});

test("PNG validation rejects signature-only, corrupt and oversized files", () => {
  for (const input of [Buffer.from("not PNG"), Buffer.from("89504e470d0a1a0a", "hex"), Buffer.alloc(4194305)]) assert.throws(() => validatePng(input), /PNG/);
});
