import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { createDisplayIcon, type DisplayIcon } from "./icon-display";
import { validatePng } from "./png";

// Bump when resizing, encoding, or acceptance rules change.
export const DISPLAY_CACHE_VERSION = `resize-v1-96-64-48-8192-puppeteer-${require("puppeteer/package.json").version}-${process.platform}-${process.arch}`;

function display(bytes: Buffer): DisplayIcon {
  if (bytes.length > 8192) throw Error("Display cache PNG exceeds byte limit.");
  const { width, height } = validatePng(bytes);
  if (width > 96 || height > 96) throw Error("Display cache PNG exceeds dimension limit.");
  return { bytes, width, height, dataUri: `data:image/png;base64,${bytes.toString("base64")}` };
}

/** Disposable optimization only: never writes into original bundles or invokes a generator. */
export class DisplayIconCache {
  private readonly pending = new Map<string, Promise<DisplayIcon>>();
  constructor(private readonly directory: string, private readonly deps: { resize?: typeof createDisplayIcon; version?: string } = {}) {}

  acquire(original: Buffer): Promise<DisplayIcon> {
    validatePng(original);
    const key = createHash("sha256").update(this.deps.version ?? DISPLAY_CACHE_VERSION).update("\0").update(createHash("sha256").update(original).digest()).digest("hex");
    let result = this.pending.get(key);
    if (!result) { result = this.obtain(key, original); this.pending.set(key, result); }
    return result;
  }

  private async obtain(key: string, original: Buffer): Promise<DisplayIcon> {
    const file = path.join(this.directory, `${key}.png`);
    try {
      const stat = fs.lstatSync(file);
      if (stat.isFile() && !stat.isSymbolicLink() && stat.size <= 8192) {
        const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
        try {
          const bytes = Buffer.alloc(8193);
          const length = fs.readSync(fd, bytes, 0, bytes.length, 0);
          return display(bytes.subarray(0, length));
        } finally { fs.closeSync(fd); }
      }
    } catch { /* Absent, invalid, or unreadable entries rebuild locally. */ }
    const result = display((await (this.deps.resize ?? createDisplayIcon)(original)).bytes);
    const temporary = path.join(this.directory, `.${key}-${randomUUID()}.tmp`);
    let owned = false;
    try {
      fs.mkdirSync(this.directory, { recursive: true });
      fs.writeFileSync(temporary, result.bytes, { flag: "wx" }); owned = true;
      fs.renameSync(temporary, file); owned = false;
    } catch { /* Cache persistence must not prevent use of a valid derivative. */ }
    finally { if (owned) { try { fs.unlinkSync(temporary); } catch { /* Best-effort own temporary cleanup. */ } } }
    return result;
  }
}
