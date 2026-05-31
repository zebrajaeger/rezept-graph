const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { loadDotEnv, parseDotEnv } = require("../src/env-loader");

test("parseDotEnv reads simple quoted and unquoted values", () => {
  assert.deepEqual(
    parseDotEnv(`
      # Kommentar
      OLLAMA_API_KEY=test-key
      QUOTED="hello world"
      SINGLE='x'
    `),
    {
      OLLAMA_API_KEY: "test-key",
      QUOTED: "hello world",
      SINGLE: "x",
    }
  );
});

test("loadDotEnv fills missing env values without overwriting existing variables", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-env-"));
  fs.writeFileSync(
    path.join(tmpDir, ".env"),
    ["OLLAMA_API_KEY=from-file", "EXISTING=from-file"].join("\n")
  );
  const env = { EXISTING: "from-shell" };

  const loaded = loadDotEnv({ cwd: tmpDir, env });

  assert.deepEqual(loaded, [path.join(tmpDir, ".env")]);
  assert.equal(env.OLLAMA_API_KEY, "from-file");
  assert.equal(env.EXISTING, "from-shell");
});
