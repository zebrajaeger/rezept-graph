import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { IconConfig } from "./icon-config";
import type { IconGenerator } from "./generator";
import { buildIconPrompt, STYLE_VERSION, type Motif } from "./motif";
import { validatePng } from "./png";

const checksum = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const safeKey = /^(ingredients|processes)\/[a-z][a-z0-9-]{0,63}$/;
function safeDirectory(directory: string): void {
  const absolute = path.resolve(directory), root = path.parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && (fs.lstatSync(current).isSymbolicLink() || fs.realpathSync.native(current).toLowerCase() !== current.toLowerCase())) throw Error("Unsafe icon directory.");
  }
}
function readRegular(file: string, limit: number): Buffer {
  safeDirectory(path.dirname(file));
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > limit) throw Error("Invalid icon file.");
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const opened = fs.fstatSync(fd);
    if (opened.ino !== stat.ino || opened.dev !== stat.dev || opened.size !== stat.size) throw Error("Changed icon file.");
    const bytes = Buffer.alloc(stat.size); let offset = 0;
    while (offset < bytes.length) { const read = fs.readSync(fd, bytes, offset, bytes.length - offset, offset); if (!read) throw Error("Short icon read."); offset += read; }
    const after = fs.fstatSync(fd);
    if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.nlink !== 1) throw Error("Changed icon file.");
    return bytes;
  } finally { fs.closeSync(fd); }
}

export class IconLibrary {
  private readonly reasons = new Map<string, string>();
  private readonly requests = new Map<string, Promise<Buffer | undefined>>();
  private readonly demand = new Map<string, { key: string; reason: string; count: number; recipes: string[] }>();
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly config: IconConfig, private readonly deps: { generator?: IconGenerator; warn?: (message: string) => void } = {}) {}

  async acquire(motif: Motif | undefined, recipe: string, phrase = "unresolved"): Promise<Buffer | undefined> {
    if (this.config.mode === "off") return undefined;
    const key = motif?.key || phrase;
    let bytes: Buffer | undefined;
    if (motif && safeKey.test(motif.key)) {
      let request = this.requests.get(key);
      if (!request) { request = this.queue.then(() => this.obtain(motif)); this.requests.set(key, request); this.queue = request.catch(() => undefined); }
      bytes = await request;
    }
    if (!bytes) {
      const item = this.demand.get(key) || { key: motif && safeKey.test(key) ? key : "unresolved", reason: this.reasons.get(key) || (motif ? "asset-unavailable" : "unresolved-concept"), count: 0, recipes: [] };
      let reference = `recipe:${checksum(Buffer.from(recipe)).slice(0, 16)}`;
      try { const url = new URL(recipe); if (["http:", "https:"].includes(url.protocol)) reference = `${url.protocol}//${url.host}${url.pathname}`; } catch { /* Non-URL references use a non-secret stable identifier. */ }
      item.count++; if (!item.recipes.includes(reference)) item.recipes.push(reference); this.demand.set(key, item);
    }
    return bytes;
  }

  private lookup(motif: Motif): Buffer | undefined {
    const root = path.join(this.config.libraryDirectory, motif.key);
    try {
      safeDirectory(root);
      const revisions = path.join(root, "revisions");
      let names: string[] = [];
      if (fs.existsSync(revisions)) { safeDirectory(revisions); const entries = fs.readdirSync(revisions); if (entries.length > 1000) return undefined; names = entries.filter(name => /^r\d{6}$/.test(name)).sort().map(name => path.join(revisions, name)); }
      for (const folder of [root, ...names]) {
        try {
          const metadata = JSON.parse(readRegular(path.join(folder, "metadata.json"), 65536).toString("utf8"));
          if (metadata.schemaVersion !== 1 || metadata.key !== motif.key || metadata.imagePath !== "image.png" || typeof metadata.prompt !== "string" || typeof metadata.styleVersion !== "string" || typeof metadata.createdAt !== "string" || typeof metadata.termsReference !== "string" || typeof metadata.identity?.backend !== "string" || typeof metadata.identity?.cliVersion !== "string" || !(metadata.identity.reportedImageModel === null || typeof metadata.identity.reportedImageModel === "string")) continue;
          const bytes = readRegular(path.join(folder, "image.png"), 4194304);
          const dimensions = validatePng(bytes);
          if (checksum(bytes) === metadata.checksum && dimensions.width === metadata.width && dimensions.height === metadata.height && metadata.mime === "image/png") return bytes;
        } catch { /* Incomplete/conflicting revisions remain preserved cache misses. */ }
      }
    } catch { /* Missing or unsafe libraries are unavailable. */ }
    return undefined;
  }

  private async obtain(motif: Motif): Promise<Buffer | undefined> {
    const existing = this.lookup(motif); if (existing) return existing;
    if (this.config.mode !== "generate-missing" || !this.deps.generator) { this.reasons.set(motif.key, "local-miss"); return undefined; }
    let staging: string | undefined;
    try {
      safeDirectory(this.config.libraryDirectory); fs.mkdirSync(this.config.libraryDirectory, { recursive: true });
      staging = fs.mkdtempSync(path.join(this.config.libraryDirectory, ".acquire-"));
      const stagingPngPath = path.join(staging, "candidate.png"), prompt = buildIconPrompt(motif);
      const result = await this.deps.generator.generate({ canonicalKey: motif.key, prompt, stagingPngPath });
      if (!result.available) { this.reasons.set(motif.key, result.reason); return undefined; }
      if (result.stagingPngPath !== stagingPngPath) { this.reasons.set(motif.key, "artifact"); return undefined; }
      const bytes = readRegular(stagingPngPath, 4194304), dimensions = validatePng(bytes);
      const metadata = { schemaVersion: 1, key: motif.key, concept: motif.concept, imagePath: "image.png", checksum: checksum(bytes), ...dimensions, identity: result.identity, createdAt: new Date().toISOString(), prompt, styleVersion: STYLE_VERSION, termsReference: this.config.generator?.termsReference || "unknown" };
      const root = path.join(this.config.libraryDirectory, motif.key); safeDirectory(root);
      fs.mkdirSync(path.dirname(root), { recursive: true });
      let destination = root;
      if (fs.existsSync(root)) {
        const revisions = path.join(root, "revisions"); safeDirectory(revisions); fs.mkdirSync(revisions, { recursive: true });
        let found = false;
        for (let revision = 1; revision <= 1000; revision++) { destination = path.join(revisions, `r${String(revision).padStart(6, "0")}`); if (!fs.existsSync(destination)) { found = true; break; } }
        if (!found) throw Error("Icon revision limit.");
      }
      fs.mkdirSync(destination);
      fs.renameSync(stagingPngPath, path.join(destination, "image.png"));
      const stagedMetadata = path.join(staging, "metadata.json"); fs.writeFileSync(stagedMetadata, JSON.stringify(metadata, null, 2) + "\n", { flag: "wx" });
      fs.renameSync(stagedMetadata, path.join(destination, "metadata.json"));
      return bytes;
    } catch { this.reasons.set(motif.key, "generation-or-storage"); this.deps.warn?.("Icon acquisition failed; using text-only nodes."); return undefined; }
    finally { if (staging) { try { fs.rmSync(staging, { recursive: true, force: true }); } catch { this.deps.warn?.("Icon staging cleanup failed."); } } }
  }

  async report(): Promise<void> {
    if (this.config.mode === "off") return;
    try { fs.mkdirSync(path.dirname(this.config.reportPath), { recursive: true }); fs.writeFileSync(this.config.reportPath, JSON.stringify([...this.demand.values()], null, 2) + "\n"); }
    catch { this.deps.warn?.("Icon demand report could not be written."); }
  }
}
