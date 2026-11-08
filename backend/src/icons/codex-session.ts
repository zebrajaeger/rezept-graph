/** Bounded identity parsing only; this does not prove image generation or call budgeting. */
export class CodexSession {
  readonly maxLineBytes = 16 * 1024;
  readonly maxStreamBytes = 256 * 1024;
  private pending = "";
  private bytes = 0;
  private state: "initial" | "thread" | "turn" | "complete" | "failed" = "initial";
  private identity?: string;

  get threadId(): string | undefined { return this.identity; }

  push(chunk: string): void {
    this.bytes += Buffer.byteLength(chunk, "utf8");
    if (this.state === "failed" || this.bytes > this.maxStreamBytes) this.fail();
    this.pending += chunk;
    let newline: number;
    while ((newline = this.pending.indexOf("\n")) !== -1) {
      const line = this.pending.slice(0, newline).replace(/\r$/, "");
      this.pending = this.pending.slice(newline + 1);
      this.consume(line);
    }
    if (Buffer.byteLength(this.pending, "utf8") > this.maxLineBytes) this.fail();
  }

  finish(exitCode: number | null): { threadId: string } {
    if (this.pending) {
      const line = this.pending;
      this.pending = "";
      this.consume(line);
    }
    if (exitCode !== 0 || this.state !== "complete" || !this.identity) this.fail();
    return { threadId: this.identity };
  }

  private consume(line: string): void {
    if (!line || Buffer.byteLength(line, "utf8") > this.maxLineBytes) this.fail();
    let value: unknown;
    try { value = JSON.parse(line); } catch { this.fail(); }
    if (!value || typeof value !== "object" || Array.isArray(value)) this.fail();
    const event = value as Record<string, unknown>;
    switch (event.type) {
      case "thread.started":
        if (this.state !== "initial" || typeof event.thread_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(event.thread_id)) this.fail();
        this.identity = event.thread_id;
        this.state = "thread";
        break;
      case "turn.started":
        if (this.state !== "thread") this.fail();
        this.state = "turn";
        break;
      case "turn.completed":
        if (this.state !== "turn") this.fail();
        this.state = "complete";
        break;
      case "item.started":
      case "item.updated":
      case "item.completed":
        if (this.state !== "turn") this.fail();
        break;
      default:
        this.fail();
    }
  }

  private fail(): never {
    this.state = "failed";
    throw new Error("Invalid Codex session stream; no artifact may be acquired.");
  }
}
