import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { acquireCodexArtifact } from "../src/icons/codex-acquisition";
import type { IconProcessInput, IconProcessResult } from "../src/icons/icon-process";

const id = "01a1bc11-4803-7a72-ae5d-f57ddc43b188";
const start = `{"type":"thread.started","thread_id":"${id}"}\n{"type":"turn.started"}\n`;
const done = '{"type":"turn.completed"}\n';

test("fixture Codex acquisition reserves fresh identity before images and ignores prose paths", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fixture codex & run "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cacheRoot = path.join(root, "cache");
  const staging = path.join(root, "staging");
  fs.mkdirSync(cacheRoot); fs.mkdirSync(staging);
  const destination = path.join(staging, "candidate.png");
  const bytes = Buffer.from("validated fixture bytes");
  const request: IconProcessInput = { executable: process.execPath, args: [], cwd: staging, input: "egg & secret", timeoutMs: 1000, maxOutputBytes: 4096 };
  const run = async (input: IconProcessInput): Promise<IconProcessResult> => {
    assert.equal(input.input, request.input);
    input.onStdout!(start);
    assert.ok(fs.statSync(path.join(cacheRoot, id)).isDirectory());
    fs.writeFileSync(path.join(cacheRoot, id, "exec-fixture.png"), bytes);
    input.onStdout!('{"type":"item.completed","item":{"type":"agent_message","text":"../../unrelated.png"}}\n' + done);
    return { status: "completed", stdout: "", exitCode: 0 };
  };
  assert.equal(await acquireCodexArtifact({ cacheRoot, destination, process: request, validate: data => assert.deepEqual(data, bytes) }, { run }), true);
  assert.deepEqual(fs.readFileSync(destination), bytes);
  assert.deepEqual(fs.readFileSync(path.join(cacheRoot, id, "exec-fixture.png")), bytes);
});

test("fixture acquisition fails closed on process/auth/capability/text-only/artifact failure", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fixture failures "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const scenario of ["missing", "auth", "capability", "text-only", "multiple", "invalid", "timeout", "old-session"]) {
    const dir = path.join(root, scenario);
    const cacheRoot = path.join(dir, "cache");
    fs.mkdirSync(cacheRoot, { recursive: true });
    if (scenario === "old-session") fs.mkdirSync(path.join(cacheRoot, id));
    const destination = path.join(dir, "candidate.png");
    const run = async (input: IconProcessInput): Promise<IconProcessResult> => {
      if (["missing", "auth", "capability", "timeout"].includes(scenario)) return { status: scenario === "missing" ? "missing" : scenario === "timeout" ? "timeout" : "failed", stdout: "", exitCode: 1 };
      input.onStdout!(start);
      if (["multiple", "invalid"].includes(scenario)) fs.writeFileSync(path.join(cacheRoot, id, "a.png"), "invalid");
      if (scenario === "multiple") fs.writeFileSync(path.join(cacheRoot, id, "b.png"), "invalid");
      input.onStdout!(done);
      return { status: "completed", stdout: "", exitCode: 0 };
    };
    const result = await acquireCodexArtifact({ cacheRoot, destination, process: { executable: "fixture", args: [], cwd: dir, input: "", timeoutMs: 1000, maxOutputBytes: 4096 }, validate: () => { throw new Error("secret"); } }, { run });
    assert.equal(result, false, scenario);
    assert.equal(fs.existsSync(destination), false);
    assert.equal(fs.existsSync(path.join(cacheRoot, ".rezept-graph-writer.lock")), false);
  }
});
