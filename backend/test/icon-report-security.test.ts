import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { IconLibrary } from "../src/icons/library";
import { normalizeIcons } from "../src/icons/icon-config";

test("unmet report preserves structured failure reasons and strips credential-bearing recipe URLs", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "icon-report-secure-")); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "fixture", termsReference: "terms" } }, root);
  const library = new IconLibrary(config, { generator: { generate: async () => ({ available: false, reason: "timeout" }) } });
  await library.acquire({ key: "ingredients/egg", concept: "egg" }, "https://user:password@example.test/recipe?api_key=secret#token");
  await library.report();
  const text = fs.readFileSync(config.reportPath, "utf8");
  assert.doesNotMatch(text, /password|secret|api_key|user:|#token/);
  assert.equal(JSON.parse(text)[0].reason, "timeout");
  assert.equal(JSON.parse(text)[0].recipes[0], "https://example.test/recipe");
});
