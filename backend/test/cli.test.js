const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { main } = require("../src/cli");

test("analyze command does not invoke Chefkoch seeding fetcher", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-"));
  const configPath = path.join(tmpDir, "config.json");
  const urlsPath = path.join(tmpDir, "recipe-urls.txt");

  fs.writeFileSync(
    configPath,
    JSON.stringify({
      llm: {
        baseUrl: "http://localhost:1234/v1",
        model: "test-model",
        apiKeyEnv: "OPENAI_API_KEY",
        timeoutMs: 1000,
      },
      cache: {
        directory: "cache",
        mode: "cache-first",
      },
      output: {
        directory: "outputs",
        includeIntermediateStates: true,
      },
    })
  );
  fs.writeFileSync(urlsPath, "https://example.test/recipe.html\n");

  const exitCode = await main(
    [
      "analyze",
      "--config",
      configPath,
      "--urls",
      urlsPath,
      "--cache-mode",
      "offline",
    ],
    {},
    {
      fetcher: async () => {
        throw new Error("fetcher must not be called for analyze");
      },
    }
  );

  assert.equal(exitCode, 0);
});
