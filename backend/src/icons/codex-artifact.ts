import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const invalid = () => new Error("Codex artifact acquisition refused; check cache ownership, session and file validity.");
const sessionId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const maxBytes = 4 * 1024 * 1024;

function checkPath(target: string): fs.Stats {
  const absolute = path.resolve(target);
  const root = path.parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || path.resolve(fs.realpathSync.native(current)).toLowerCase() !== current.toLowerCase()) throw invalid();
  }
  return fs.lstatSync(absolute);
}

function sameFile(a: fs.Stats, b: fs.Stats): boolean {
  return a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs && b.nlink === 1;
}

/** Cooperative single-writer lease, not isolation from hostile concurrent local processes. */
export class CodexArtifactLease {
  private readonly root: string;
  private readonly lock: string;
  private readonly token = randomUUID();
  private active = false;
  private session?: string;
  private sessionStat?: fs.Stats;

  constructor(cacheRoot: string) {
    this.root = path.resolve(cacheRoot);
    this.lock = path.join(this.root, ".rezept-graph-writer.lock");
    try {
      if (!checkPath(this.root).isDirectory()) throw invalid();
      fs.writeFileSync(this.lock, this.token, { flag: "wx", mode: 0o600 });
      this.active = true;
    } catch { throw invalid(); }
  }

  claim(identity: string): void {
    try {
      if (!this.active || this.session || !sessionId.test(identity)) throw invalid();
      const session = path.join(this.root, identity);
      // Reserve before Codex can publish its first artifact; existing sessions are never adopted.
      fs.mkdirSync(session);
      this.session = session;
      this.sessionStat = checkPath(session);
    } catch { throw invalid(); }
  }

  copyValidated(destination: string, validate: (bytes: Buffer) => void): void {
    let fd: number | undefined;
    try {
      if (!this.active || !this.session || !this.sessionStat) throw invalid();
      const directory = checkPath(this.session);
      if (!directory.isDirectory() || directory.dev !== this.sessionStat.dev || directory.ino !== this.sessionStat.ino) throw invalid();
      let candidate: string | undefined;
      let count = 0;
      const dir = fs.opendirSync(this.session);
      try {
        let entry: fs.Dirent | null;
        while ((entry = dir.readSync())) {
          if (++count > 32) throw invalid();
          if (entry.name.toLowerCase().endsWith(".png")) {
            if (candidate || !entry.isFile()) throw invalid();
            candidate = path.join(this.session, entry.name);
          }
        }
      } finally { dir.closeSync(); }
      if (!candidate) throw invalid();
      const before = checkPath(candidate);
      if (!before.isFile() || before.nlink !== 1 || before.size < 1 || before.size > maxBytes) throw invalid();
      fd = fs.openSync(candidate, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
      if (!sameFile(before, fs.fstatSync(fd))) throw invalid();
      const bytes = Buffer.alloc(before.size);
      let offset = 0;
      while (offset < bytes.length) {
        const read = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
        if (!read) throw invalid();
        offset += read;
      }
      validate(bytes);
      if (!sameFile(before, fs.fstatSync(fd)) || !sameFile(before, checkPath(candidate))) throw invalid();
      const afterDir = checkPath(this.session);
      if (afterDir.dev !== directory.dev || afterDir.ino !== directory.ino) throw invalid();
      if (!checkPath(path.dirname(destination)).isDirectory()) throw invalid();
      fs.writeFileSync(destination, bytes, { flag: "wx", mode: 0o600 });
    } catch { throw invalid(); }
    finally { if (fd !== undefined) fs.closeSync(fd); }
  }

  release(): void {
    if (!this.active) return;
    this.active = false;
    try {
      const stat = fs.lstatSync(this.lock);
      if (stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1 && stat.size === this.token.length && fs.readFileSync(this.lock, "utf8") === this.token) fs.unlinkSync(this.lock);
    } catch { /* Preserve unknown lock files; stale locks require manual review. */ }
  }
}
