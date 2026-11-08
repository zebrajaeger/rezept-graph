import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runIconProcess } from "../src/icons/icon-process";

test("icon process preserves Windows-special prompt arguments as stdin data without a shell", async () => {
  const prompt = 'egg & echo BAD | %PATH% "quoted"\nsecond line';
  const result = await runIconProcess({ executable: process.execPath, args: ["-e", "process.stdin.pipe(process.stdout)"], cwd: process.cwd(), input: prompt, timeoutMs: 5000, maxOutputBytes: 4096 });
  assert.equal(result.status, "completed");
  assert.equal(result.stdout, prompt);
});

test("icon process returns fixed non-secret diagnostics for missing executable and failures", async () => {
  const common = { cwd: process.cwd(), input: "", timeoutMs: 5000, maxOutputBytes: 4096 };
  assert.equal((await runIconProcess({ ...common, executable: "missing-icon-cli", args: [] })).status, "missing");
  const failure = await runIconProcess({ ...common, executable: process.execPath, args: ["-e", "process.stderr.write('secret-token');process.exit(1)"] });
  assert.equal(failure.status, "failed");
  assert.doesNotMatch(JSON.stringify(failure), /secret-token/);
});

test("icon process bounds diagnostics and propagates output callbacks safely", async () => {
  const common = { executable: process.execPath, cwd: process.cwd(), input: "", timeoutMs: 5000, maxOutputBytes: 1024 };
  const result = await runIconProcess({ ...common, args: ["-e", "process.stdout.write('x'.repeat(100000))"] });
  assert.equal(result.status, "output-limit");
  assert.ok(Buffer.byteLength(result.stdout) <= 1024);
  const rejected = await runIconProcess({ ...common, args: ["-e", "console.log('event');setInterval(()=>{},1000)"], onStdout: () => { throw new Error("credential"); } });
  assert.equal(rejected.status, "invalid-output");
  assert.doesNotMatch(JSON.stringify(rejected), /credential/);
});

test("icon process cancels before launch and terminates a timed-out child process tree", async (t) => {
  const abort = new AbortController();
  abort.abort();
  const common = { executable: process.execPath, cwd: process.cwd(), input: "", timeoutMs: 5000, maxOutputBytes: 4096 };
  assert.equal((await runIconProcess({ ...common, args: [], signal: abort.signal })).status, "cancelled");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "icon-tree-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const marker = path.join(dir, "escaped.txt");
  const code = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify("setTimeout(()=>require('node:fs').writeFileSync(" + JSON.stringify(marker) + ",'escaped'),1200)")}],{stdio:'ignore'});console.log('ready');setInterval(()=>{},1000)`;
  const result = await runIconProcess({ ...common, args: ["-e", code], timeoutMs: 250 });
  assert.equal(result.status, "timeout");
  assert.match(result.stdout, /ready/);
  await new Promise(resolve => setTimeout(resolve, 1500));
  assert.equal(fs.existsSync(marker), false);
});

test("icon process kills active cancellation and refuses Windows script launchers", async () => {
  const abort = new AbortController();
  const result = await runIconProcess({ executable: process.execPath, args: ["-e", "console.log('ready');setInterval(()=>{},1000)"], cwd: process.cwd(), input: "", timeoutMs: 5000, maxOutputBytes: 4096, signal: abort.signal, onStdout: () => abort.abort() });
  assert.equal(result.status, "cancelled");
  if (process.platform === "win32") {
    const refused = await runIconProcess({ executable: "codex.cmd", args: [], cwd: process.cwd(), input: "", timeoutMs: 100, maxOutputBytes: 1024 });
    assert.equal(refused.status, "unsupported-launcher");
  }
});
