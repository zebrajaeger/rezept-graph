import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import type { IconGenerator } from "../src/icons/generator";
import { validatePng } from "../src/icons/png";
import { transparentPng } from "./fixtures/transparent-icon";

// Valid 1x1 RGBA PNG, generated locally with known CRCs by the fixture builder.
import { deflateSync } from "node:zlib";
function fixturePng(): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const b = Buffer.alloc(data.length + 12); b.writeUInt32BE(data.length); b.write(type, 4); data.copy(b, 8);
    let crc = 0xffffffff; for (const byte of b.subarray(4, -4)) { crc ^= byte; for (let i = 0; i < 8; i++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0); } b.writeUInt32BE((crc ^ 0xffffffff) >>> 0, b.length - 4); return b;
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(1); header.writeUInt32BE(1, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.from([0, 255, 0, 0, 255]))), chunk("IEND", Buffer.alloc(0))]);
}
export const png = transparentPng;

test("PNG validates actual scanline data and CRC and rejects corruption", () => {
  assert.deepEqual(validatePng(png), { width: 10, height: 10, mime: "image/png" });
  assert.deepEqual(validatePng(fixturePng()), { width: 1, height: 1, mime: "image/png" });
  const corrupt = Buffer.from(png); corrupt[corrupt.length - 6] = corrupt[corrupt.length - 6]! ^ 1;
  assert.throws(() => validatePng(corrupt), /PNG/);
});

test("library shares one session, reuses bundles after relocation and repairs missing images without overwrite", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-library-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "fixture terms" } }, root);
  let calls = 0;
  const generator: IconGenerator = { generate: async request => { calls++; fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "codex-cli", cliVersion: "fixture", reportedImageModel: null } }; } };
  const library = new IconLibrary(config, { generator });
  const motif = { key: "ingredients/egg", concept: "egg" };
  const first = await Promise.all([library.acquire(motif, "recipe"), library.acquire(motif, "recipe")]);
  assert.equal(calls, 1); assert.ok(first[0]); assert.deepEqual(first[0], first[1]);
  const bundle = path.join(config.libraryDirectory, motif.key);
  const metadata = JSON.parse(fs.readFileSync(path.join(bundle, "metadata.json"), "utf8"));
  assert.equal(metadata.imagePath, "image.png"); assert.equal(metadata.identity.reportedImageModel, null);
  metadata.prompt = "old prompt"; fs.writeFileSync(path.join(bundle, "metadata.json"), JSON.stringify(metadata));
  const moved = path.join(root, "moved"); fs.cpSync(config.libraryDirectory, moved, { recursive: true });
  const local = new IconLibrary({ ...config, mode: "local-only", libraryDirectory: moved }, { generator });
  assert.deepEqual(await local.acquire(motif, "recipe"), png); assert.equal(calls, 1);
  fs.unlinkSync(path.join(bundle, "image.png"));
  const repaired = new IconLibrary(config, { generator }); assert.deepEqual(await repaired.acquire(motif, "recipe"), png); assert.equal(calls, 2);
  assert.ok(fs.existsSync(path.join(bundle, "metadata.json")));
  assert.ok(fs.existsSync(path.join(bundle, "revisions", "r000001", "image.png")));
});

test("library preserves corrupt/unmanaged files and selects valid revisions deterministically", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-conflict-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  const folder = path.join(config.libraryDirectory, "ingredients/egg"); fs.mkdirSync(folder, { recursive: true }); fs.writeFileSync(path.join(folder, "image.png"), "user artwork");
  const generator: IconGenerator = { generate: async request => { fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } }; } };
  assert.deepEqual(await new IconLibrary(config, { generator }).acquire({ key: "ingredients/egg", concept: "egg" }, "recipe"), png);
  assert.equal(fs.readFileSync(path.join(folder, "image.png"), "utf8"), "user artwork");
  assert.deepEqual(await new IconLibrary({ ...config, mode: "local-only" }).acquire({ key: "ingredients/egg", concept: "egg" }, "recipe"), png);
});

test("library reports deduplicated misses, never launches in local/off and does not retry failed sessions", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-report-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  let calls = 0; const warnings: string[] = [];
  const generator: IconGenerator = { generate: async () => { calls++; throw Error("secret-token"); } };
  const library = new IconLibrary(config, { generator, warn: message => warnings.push(message) });
  const motif = { key: "ingredients/egg", concept: "egg" };
  await library.acquire(motif, "a"); await library.acquire(motif, "b"); await library.report(); assert.equal(calls, 1);
  const report = fs.readFileSync(config.reportPath, "utf8"); assert.doesNotMatch(report, /secret-token/);
  const entries = JSON.parse(report); assert.equal(entries[0].count, 2); assert.equal(entries[0].recipes.length, 2); assert.ok(entries[0].recipes.every((reference: string) => reference.startsWith("recipe:")));
  for (const mode of ["off", "local-only"] as const) await new IconLibrary({ ...config, mode }, { generator }).acquire(motif, "a");
  assert.equal(calls, 1);
  const failedReport = new IconLibrary({ ...config, reportPath: root }, { warn: message => warnings.push(message) }); await failedReport.report(); assert.ok(warnings.length);
  assert.doesNotMatch(warnings.join(""), /secret-token/);
  assert.equal(await library.acquire({ key: "../escape", concept: "egg" }, "a"), undefined);
});

test("bundle lookup refuses metadata-only, malformed, unsupported, checksum and dimension conflicts", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-invalid-bundle-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  const motif = { key: "ingredients/egg", concept: "egg" };
  const generator: IconGenerator = { generate: async request => { fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } }; } };
  await new IconLibrary(config, { generator }).acquire(motif, "recipe");
  const source = path.join(config.libraryDirectory, motif.key);
  const metadata = JSON.parse(fs.readFileSync(path.join(source, "metadata.json"), "utf8"));
  for (const scenario of ["metadata-only", "malformed", "schema", "checksum", "dimensions", "missing-metadata", "oversized", "corrupt"]) {
    const libraryDirectory = path.join(root, scenario), folder = path.join(libraryDirectory, motif.key); fs.cpSync(source, folder, { recursive: true });
    const file = path.join(folder, "metadata.json"), image = path.join(folder, "image.png");
    if (scenario === "metadata-only") fs.unlinkSync(image);
    if (scenario === "malformed") fs.writeFileSync(file, "{");
    if (scenario === "schema") fs.writeFileSync(file, JSON.stringify({ ...metadata, schemaVersion: 99 }));
    if (scenario === "checksum") fs.writeFileSync(file, JSON.stringify({ ...metadata, checksum: "wrong" }));
    if (scenario === "dimensions") fs.writeFileSync(file, JSON.stringify({ ...metadata, width: 99 }));
    if (scenario === "missing-metadata") fs.unlinkSync(file);
    if (scenario === "oversized") fs.writeFileSync(image, Buffer.alloc(4194305));
    if (scenario === "corrupt") fs.writeFileSync(image, "corrupt");
    assert.equal(await new IconLibrary({ ...config, mode: "local-only", libraryDirectory }).acquire(motif, "recipe"), undefined, scenario);
  }
});

test("interrupted metadata publication remains unavailable, preserves unrelated files and repairs in a revision", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-interrupt-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  fs.mkdirSync(config.libraryDirectory, { recursive: true }); fs.writeFileSync(path.join(config.libraryDirectory, "keep.txt"), "keep");
  const motif = { key: "ingredients/egg", concept: "egg" };
  const generator: IconGenerator = { generate: async request => { fs.writeFileSync(request.stagingPngPath, png); return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } }; } };
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from: fs.PathLike, to: fs.PathLike) => { if (String(to).endsWith("metadata.json")) throw Error("interrupted"); return rename(from, to); });
  assert.equal(await new IconLibrary(config, { generator }).acquire(motif, "recipe"), undefined);
  t.mock.restoreAll();
  assert.equal(await new IconLibrary({ ...config, mode: "local-only" }).acquire(motif, "recipe"), undefined);
  assert.deepEqual(await new IconLibrary(config, { generator }).acquire(motif, "recipe"), png);
  assert.equal(fs.readFileSync(path.join(config.libraryDirectory, "keep.txt"), "utf8"), "keep");
  assert.equal(fs.readdirSync(config.libraryDirectory).some(name => name.startsWith(".acquire-")), false);
});
