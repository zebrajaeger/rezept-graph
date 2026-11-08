import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { DisplayIconCache } from "../src/icons/icon-display-cache";
import { normalizeIcons } from "../src/icons/icon-config";
import { png } from "./icon-library.test";
import puppeteer from "puppeteer";
import { IconLibrary } from "../src/icons/library";
import { acquirePresentationIcons } from "../src/output/acquire-icons";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

test("display cache reuses across instances and invalidates original and rule versions", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "display-cache-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  let calls = 0;
  const resize = async () => { calls++; return { bytes: png, dataUri: `data:image/png;base64,${png.toString("base64")}`, width: 1, height: 1 }; };
  const original = Buffer.from(png);
  const first = new DisplayIconCache(root, { resize, version: "rules-v1" });
  const results = await Promise.all([first.acquire(png), first.acquire(png)]);
  assert.deepEqual(results[0].bytes, png); assert.equal(calls, 1);
  await new DisplayIconCache(root, { resize, version: "rules-v1" }).acquire(png); assert.equal(calls, 1);
  // A different valid original: same image data with a different compression stream.
  const { deflateSync, inflateSync } = await import("node:zlib");
  const changed = Buffer.from(png);
  const size = changed.readUInt32BE(33), raw = inflateSync(changed.subarray(41, 41 + size));
  const compressed = deflateSync(raw, { level: 0 });
  const chunk = Buffer.alloc(compressed.length + 12); chunk.writeUInt32BE(compressed.length); chunk.write("IDAT", 4); compressed.copy(chunk, 8);
  let crc = 0xffffffff; for (const byte of chunk.subarray(4, -4)) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0); } chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4);
  const alternate = Buffer.concat([changed.subarray(0, 33), chunk, changed.subarray(45 + size)]);
  await first.acquire(alternate); assert.equal(calls, 2);
  await new DisplayIconCache(root, { resize, version: "rules-v2" }).acquire(png); assert.equal(calls, 3);
  assert.deepEqual(png, original);
});

test("display cache rebuilds deleted/corrupt entries and tolerates unwritable storage", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "display-repair-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, "cache"); let calls = 0;
  const resize = async () => { calls++; return { bytes: png, dataUri: "ignored", width: 1, height: 1 }; };
  const acquire = () => new DisplayIconCache(directory, { resize }).acquire(png);
  await acquire(); assert.equal(calls, 1);
  fs.writeFileSync(path.join(directory, fs.readdirSync(directory)[0]!), "corrupt");
  await acquire(); assert.equal(calls, 2);
  fs.rmSync(directory, { recursive: true }); await acquire(); assert.equal(calls, 3);
  fs.rmSync(directory, { recursive: true }); fs.writeFileSync(directory, "not a directory");
  assert.deepEqual((await acquire()).bytes, png); assert.equal(calls, 4);
  assert.equal(fs.readFileSync(directory, "utf8"), "not a directory");
});

test("display cache rejects invalid or oversized derivatives and original inputs", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "display-invalid-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  let calls = 0;
  const cache = new DisplayIconCache(root, { resize: async () => { calls++; return { bytes: Buffer.alloc(8193), dataUri: "", width: 1, height: 1 }; } });
  await assert.rejects(cache.acquire(png));
  assert.throws(() => cache.acquire(Buffer.from("bad"))); assert.equal(calls, 1);
  assert.deepEqual(fs.readdirSync(root), []);
});

test("cache paths are config-relative, separate from originals, and defaults have Git exclusions", () => {
  const base = path.resolve("config-folder");
  assert.equal(normalizeIcons({ mode: "local-only", displayCacheDirectory: "cache/icons" }, base).displayCacheDirectory, path.join(base, "cache/icons"));
  assert.equal(normalizeIcons(undefined, base).displayCacheDirectory, path.join(base, "backend/.cache/recipe-icons"));
  for (const displayCacheDirectory of [false, "", 1, "assets/recipe-icons/cache", "assets"]) assert.throws(() => normalizeIcons({ mode: "local-only", displayCacheDirectory }, base), /icons/);
  const repo = path.resolve(__dirname, "../../..");
  const ignored = (file: string) => spawnSync("git", ["check-ignore", "--no-index", file], { cwd: repo, encoding: "utf8" }).status;
  assert.equal(ignored("backend/.cache/recipe-icons/example.png"), 0);
  assert.equal(ignored("backend/outputs/icon-demand.json"), 0);
  assert.equal(ignored("assets/recipe-icons/ingredients/egg/image.png"), 1);
  assert.equal(ignored("assets/recipe-icons/ingredients/egg/metadata.json"), 1);
});

test("presentation reuses persisted display images without launching Chromium or generating originals again", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "display-integrated-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  let generations = 0;
  const library = new IconLibrary(config, { generator: { generate: async request => {
    generations++; fs.writeFileSync(request.stagingPngPath, png);
    return { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "fixture", cliVersion: "1", reportedImageModel: null } };
  } } });
  const recipe: RecipeAnalysis = { metadata: { title: "Eggs" }, ingredients: [], ingredientList: [], nodes: [{ id: "a", type: "ingredient", label: "Ei" }, { id: "b", type: "ingredient", label: "Eier" }], edges: [] };
  const warnings: string[] = [];
  const first = await acquirePresentationIcons(recipe, library, true, message => warnings.push(message), config.displayCacheDirectory);
  assert.equal(first.size, 2); assert.equal(generations, 1); assert.equal(fs.readdirSync(config.displayCacheDirectory).length, 1);
  const originalFile = path.join(config.libraryDirectory, "ingredients/egg/image.png"), original = fs.readFileSync(originalFile);
  const metadataFile = path.join(config.libraryDirectory, "ingredients/egg/metadata.json"), metadata = fs.readFileSync(metadataFile);
  t.mock.method(puppeteer, "launch", async () => { throw Error("cache hit must not launch a browser"); });
  const local = new IconLibrary({ ...config, mode: "local-only" });
  const second = await acquirePresentationIcons(recipe, local, true, message => warnings.push(message), config.displayCacheDirectory);
  assert.deepEqual(second, first); assert.deepEqual(warnings, []);
  assert.deepEqual(fs.readFileSync(originalFile), original); assert.deepEqual(fs.readFileSync(metadataFile), metadata);
  await local.report(); assert.deepEqual(JSON.parse(fs.readFileSync(config.reportPath, "utf8")), []);
});
