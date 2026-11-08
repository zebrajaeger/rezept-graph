import { spawn, execFile } from "node:child_process";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";

type ProcessStatus = "completed" | "missing" | "failed" | "timeout" | "cancelled" | "output-limit" | "invalid-output" | "unsupported-launcher" | "termination-failed";
export interface IconProcessInput {
  executable: string;
  args: string[];
  cwd: string;
  input: string;
  timeoutMs: number;
  maxOutputBytes: number;
  signal?: AbortSignal;
  onStdout?: (chunk: string) => void;
}
export interface IconProcessResult { status: ProcessStatus; stdout: string; exitCode: number | null }

/** No raw stderr is returned: providers can echo credentials into otherwise useful errors. */
export async function runIconProcess(input: IconProcessInput): Promise<IconProcessResult> {
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1 || input.timeoutMs > 600000 || !Number.isSafeInteger(input.maxOutputBytes) || input.maxOutputBytes < 1 || input.maxOutputBytes > 1024 * 1024) throw new Error("Invalid icon process limits.");
  if (input.signal?.aborted) return { status: "cancelled", stdout: "", exitCode: null };
  if (process.platform === "win32" && /\.(cmd|bat|ps1)$/i.test(input.executable)) return { status: "unsupported-launcher", stdout: "", exitCode: null };
  return new Promise(resolve => {
    const child = spawn(input.executable, input.args, { cwd: input.cwd, shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: ["pipe", "pipe", "pipe"] });
    const decoder = new StringDecoder("utf8");
    let stdout = "", bytes = 0;
    let status: ProcessStatus | undefined;
    let termination: Promise<void> | undefined;
    const stop = (reason: ProcessStatus) => {
      if (status) return;
      status = reason;
      if (!child.pid) return;
      termination = new Promise<void>(done => {
        if (process.platform === "win32") {
          const taskkill = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "taskkill.exe");
          execFile(taskkill, ["/PID", String(child.pid), "/T", "/F"], { shell: false, windowsHide: true, timeout: 10000, maxBuffer: 4096 }, error => {
            if (error && child.exitCode === null) { status = "termination-failed"; child.kill("SIGKILL"); }
            done();
          });
        } else {
          try { process.kill(-child.pid!, "SIGKILL"); } catch { child.kill("SIGKILL"); }
          done();
        }
      });
    };
    const timer = setTimeout(() => stop("timeout"), input.timeoutMs);
    const cancel = () => stop("cancelled");
    input.signal?.addEventListener("abort", cancel, { once: true });
    if (input.signal?.aborted) cancel();
    child.stdout.on("data", (chunk: Buffer) => {
      if (status) return;
      bytes += chunk.length;
      if (bytes > input.maxOutputBytes) { stop("output-limit"); return; }
      const text = decoder.write(chunk);
      stdout += text;
      try { input.onStdout?.(text); } catch { stop("invalid-output"); }
    });
    child.stderr.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > input.maxOutputBytes) stop("output-limit");
    });
    child.on("error", (error: NodeJS.ErrnoException) => { status ??= error.code === "ENOENT" ? "missing" : "failed"; });
    child.stdin.on("error", () => { /* Early child exit is represented by its exit status. */ });
    child.on("close", async code => {
      clearTimeout(timer);
      input.signal?.removeEventListener("abort", cancel);
      await termination;
      if (!status) {
        const tail = decoder.end();
        stdout += tail;
        try { if (tail) input.onStdout?.(tail); } catch { status = "invalid-output"; }
      }
      resolve({ status: status || (code === 0 ? "completed" : "failed"), stdout, exitCode: code });
    });
    child.stdin.end(input.input);
  });
}
