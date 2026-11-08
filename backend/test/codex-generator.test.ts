import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { CodexGenerator } from "../src/icons/codex-generator";
import { png } from "./icon-library.test";
import type { IconProcessInput, IconProcessResult } from "../src/icons/icon-process";

test("configured Codex adapter uses verified version, native safe launch and distinct provenance", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-generator-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const home = path.join(root, "codex"); fs.mkdirSync(home); fs.mkdirSync(path.join(home, "generated_images"));
  const staging = path.join(root, "staging"); fs.mkdirSync(staging);
  const requests: IconProcessInput[] = [];
  const run = async (input: IconProcessInput): Promise<IconProcessResult> => {
    requests.push(input);
    if (input.args.includes("--version")) return { status: "completed", stdout: "codex-cli 0.167.0\n", exitCode: 0 };
    const id = "01a1bc11-4803-7a72-ae5d-f57ddc43b188";
    input.onStdout!(`{"type":"thread.started","thread_id":"${id}"}\n{"type":"turn.started"}\n`);
    fs.writeFileSync(path.join(home, "generated_images", id, "exec-fixture.png"), png);
    input.onStdout!('{"type":"turn.completed"}\n'); return { status: "completed", stdout: "", exitCode: 0 };
  };
  const generator = new CodexGenerator({ backend: "codex-cli", executable: process.execPath, termsReference: "terms", profile: "images", agentModel: "agent-fixture", timeoutMs: 1000, maxOutputBytes: 262144 }, { run, codexHome: home });
  const request = { canonicalKey: "ingredients/egg", prompt: "egg & special", stagingPngPath: path.join(staging, "candidate.png") };
  const result = await generator.generate(request); assert.ok(result.available);
  if (result.available) { assert.equal(result.identity.reportedImageModel, null); assert.equal(result.identity.requestedAgentModel, "agent-fixture"); }
  assert.ok(requests[1]!.args.includes("--ignore-user-config")); assert.ok(requests[1]!.args.includes("--json"));
  assert.ok(requests[1]!.input.includes(request.prompt));
  assert.ok(!requests[1]!.args.some(arg => arg.includes(request.prompt)));
  assert.equal((await generator.generate(request)).available, false); assert.equal(requests.length, 2);
});

test("unreviewed Codex versions and missing native executables never start image sessions", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-version-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  let calls = 0;
  const generator = new CodexGenerator({ backend: "codex-cli", executable: process.execPath, termsReference: "terms", timeoutMs: 1000, maxOutputBytes: 262144 }, { run: async () => { calls++; return { status: "completed", stdout: "codex-cli 9.0.0", exitCode: 0 }; }, codexHome: root });
  assert.equal((await generator.generate({ canonicalKey: "ingredients/egg", prompt: "egg", stagingPngPath: path.join(root, "candidate.png") })).available, false); assert.equal(calls, 1);
});
