import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { main } from "../src/cli";

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

  const requestedUrls: string[] = [];
  const exitCode = await main(
    [
      "analyze",
      "--config",
      configPath,
      "--urls",
      urlsPath,
      "--cache-mode",
      "cache-first",
    ],
    {},
    {
      fetcher: async (url) => {
        requestedUrls.push(url);
        return {
          ok: true,
          status: 200,
          url,
          headers: { get: () => "text/html" },
          text: async () => "<html><body>Toast toasten.</body></html>",
        };
      },
      llmClient: {
        complete: async () =>
          JSON.stringify({
            metadata: {
              title: "Toast",
              sourceUrl: "https://example.test/recipe.html",
              servings: "1 Portion",
            },
            ingredients: [
              {
                id: "ing_bread",
                name: "Brot",
                quantity: 1,
                unit: "Scheibe",
                preparation: null,
                originalText: "1 Scheibe Brot",
                confidence: 0.95,
              },
            ],
            nodes: [
              { id: "ing_bread", type: "ingredient", label: "1 Scheibe Brot" },
              { id: "step_toast", type: "process", label: "Toasten" },
            ],
            edges: [{ from: "ing_bread", to: "step_toast", type: "used_in" }],
            ingredientList: ["1 Scheibe Brot"],
          }),
      },
    }
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(requestedUrls, ["https://example.test/recipe.html"]);
});
