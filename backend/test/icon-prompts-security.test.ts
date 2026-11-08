import assert from "node:assert/strict";
import test from "node:test";
import { normalizeIcons } from "../src/icons/icon-config";

test("terms provenance cannot persist credential-bearing URLs", () => {
  for (const termsReference of ["https://user:secret@example.test/terms", "https://example.test/terms?api_key=secret", "https://example.test/terms#secret"]) {
    assert.throws(() => normalizeIcons({ mode: "generate-missing", generator: { backend: "codex-cli", executable: "native.exe", termsReference } }, process.cwd()), /icons/);
  }
});
