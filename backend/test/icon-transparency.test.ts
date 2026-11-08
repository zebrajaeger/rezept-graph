import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import test from "node:test";
import * as background from "../src/icons/png-background";
import { buildIconPrompt, STYLE_VERSION } from "../src/icons/motif";
import { presentationPlan } from "../src/icons/ingredient-presentation";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";
import { iconFixture, pngChunk } from "./fixtures/transparent-icon";
import { deflateSync } from "node:zlib";

test("icon prompts require real transparent margins while retaining grouped egg state", () => {
  for (const state of ["raw", "boiled", "fried"] as const) {
    const motif = presentationPlan({ kind: "single", concepts: ["egg"], state, quantity: 3, unit: "piece" }).motifs[0]!;
    const prompt = buildIconPrompt(motif);
    assert.match(prompt, /truly transparent PNG background with transparent margins/);
    assert.match(prompt, /No opaque white or colored backgrounds, checkerboards, backdrops or scenes/);
    assert.match(prompt, /exactly 3/); assert.ok(prompt.includes(state));
    assert.ok(prompt.includes(JSON.stringify(motif.concept))); assert.notEqual(STYLE_VERSION, "recipe-icon-v1");
  }
});

test("decoded transparency handles all filters, sample depths and alpha color types without changing pixels", () => {
  for (const depth of [8, 16]) for (const color of [4, 6]) for (let filter = 0; filter < 5; filter++) {
    const bytes = iconFixture({ depth, color, filter, alpha: (x, y) => x > 1 && x < 8 && y > 1 && y < 8 ? (x === 2 ? 128 : 255) : 0 });
    const original = Buffer.from(bytes);
    assert.equal(background.hasTransparentBackground(bytes), true, `${depth}/${color}/${filter}`);
    assert.deepEqual(bytes, original);
  }
});

test("opaque, empty, token-alpha and edge-touching images fail the background gate", () => {
  for (const bytes of [iconFixture({ color: 2 }), iconFixture({ color: 0 }), iconFixture({ alpha: () => 255 }), iconFixture({ alpha: () => 0 }), iconFixture({ alpha: (x, y) => x === 0 && y === 0 ? 0 : 255 }), iconFixture({ alpha: (x, y) => x === 0 && y === 5 ? 255 : 0 }), iconFixture({ size: 100, alpha: (x, y) => x === 50 && y === 50 ? 255 : 0 })]) {
    assert.equal(background.hasTransparentBackground(bytes), false);
  }
});

test("background gate rejects malformed, unsupported and oversized PNGs with bounded decoding", () => {
  const valid = iconFixture();
  for (const bytes of [Buffer.from("bad"), Buffer.alloc(4194305), valid.subarray(0, -1), iconFixture({ filter: 5 })]) assert.throws(() => background.hasTransparentBackground(bytes));
  for (const [offset, value] of [[0, 4097], [8, 4], [9, 3], [12, 1]] as const) {
    const header = Buffer.from(valid.subarray(16, 29));
    if (offset === 0) header.writeUInt32BE(value); else header[offset!] = value;
    const changed = Buffer.concat([valid.subarray(0, 8), pngChunk("IHDR", header), valid.subarray(33)]);
    assert.throws(() => background.hasTransparentBackground(changed));
  }
});

test("grayscale and RGB transparency keys are decoded at both sample depths", () => {
  for (const depth of [8, 16]) for (const color of [0, 2]) {
    const channels = color === 0 ? 1 : 3, sampleBytes = depth / 8;
    const header = Buffer.alloc(13); header.writeUInt32BE(10); header.writeUInt32BE(10, 4); header[8] = depth; header[9] = color;
    const rows: Buffer[] = [];
    for (let y = 0; y < 10; y++) {
      const row = Buffer.alloc(1 + 10 * channels * sampleBytes);
      for (let x = 3; x < 7 && y >= 3 && y < 7; x++) row.fill(255, 1 + x * channels * sampleBytes, 1 + (x + 1) * channels * sampleBytes);
      rows.push(row);
    }
    const prefix = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), pngChunk("IHDR", header)]);
    const key = pngChunk("tRNS", Buffer.alloc(channels * 2)), data = pngChunk("IDAT", deflateSync(Buffer.concat(rows))), end = pngChunk("IEND", Buffer.alloc(0));
    assert.equal(background.hasTransparentBackground(Buffer.concat([prefix, key, data, end])), true);
    assert.throws(() => background.hasTransparentBackground(Buffer.concat([prefix, data, key, end])), /transparency/);
    assert.throws(() => background.hasTransparentBackground(Buffer.concat([prefix, key, key, data, end])), /transparency/);
    assert.throws(() => background.hasTransparentBackground(Buffer.concat([prefix, pngChunk("tRNS", Buffer.alloc(1)), data, end])), /transparency/);
  }
});

test("inflation cannot exceed header-derived allocation", () => {
  const valid = iconFixture();
  const oversizedData = pngChunk("IDAT", deflateSync(Buffer.alloc(1024 * 1024)));
  assert.throws(() => background.hasTransparentBackground(Buffer.concat([valid.subarray(0, 33), oversizedData, pngChunk("IEND", Buffer.alloc(0))])));
});

test("opaque generation is deduplicated, reported, never published or retried; legacy reuse is unchanged", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "transparent-icons-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "fixture" } }, root);
  const bytes = iconFixture({ alpha: () => 255 }); let calls = 0;
  const generator = { generate: async (request: { stagingPngPath: string }) => {
    calls++; fs.writeFileSync(request.stagingPngPath, bytes);
    return { available: true as const, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } };
  } };
  const motif = { key: "ingredients/egg", concept: "three eggs" }, library = new IconLibrary(config, { generator });
  assert.deepEqual(await Promise.all([library.acquire(motif, "a"), library.acquire(motif, "b")]), [undefined, undefined]);
  await library.acquire(motif, "c"); await library.report();
  assert.equal(calls, 1); assert.equal(fs.existsSync(path.join(config.libraryDirectory, motif.key)), false);
  const report = JSON.parse(fs.readFileSync(config.reportPath, "utf8")); assert.equal(report[0].reason, "background-not-transparent"); assert.equal(report[0].count, 3);
  assert.deepEqual(fs.readdirSync(config.libraryDirectory), []);
  const folder = path.join(config.libraryDirectory, motif.key); fs.mkdirSync(folder, { recursive: true });
  const metadata = JSON.stringify({ schemaVersion: 1, key: motif.key, imagePath: "image.png", prompt: "legacy", styleVersion: "recipe-icon-v1", createdAt: "fixture", termsReference: "fixture", identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null }, checksum: createHash("sha256").update(bytes).digest("hex"), width: 10, height: 10, mime: "image/png" });
  fs.writeFileSync(path.join(folder, "image.png"), bytes); fs.writeFileSync(path.join(folder, "metadata.json"), metadata);
  for (const mode of ["generate-missing", "local-only"] as const) assert.deepEqual(await new IconLibrary({ ...config, mode }, { generator }).acquire(motif, "a"), bytes);
  assert.equal(await new IconLibrary({ ...config, mode: "off" }, { generator }).acquire(motif, "a"), undefined);
  assert.equal(calls, 1); assert.equal(fs.readFileSync(path.join(folder, "metadata.json"), "utf8"), metadata);
});
