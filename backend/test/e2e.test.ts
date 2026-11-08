import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { writeCacheEntry } from "../src/ingestion/cache";
import { main } from "../src/cli";
import { writeFakeOutputs } from "./fixtures/fake-images";
import { fakePlanning, writeFakeTimeline } from "./fixtures/fake-planning";

test("CLI analyzes cached HTML offline and writes recipe outputs", async (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-e2e-"));
  const configPath = path.join(tmpDir, "config.json");
  const urlsPath = path.join(tmpDir, "recipe-urls.txt");
  const cacheDir = path.join(tmpDir, "cache");
  const outputDir = path.join(tmpDir, "outputs");
  const url = "https://example.test/recipe";
  let stdout = "";
  t.mock.method(process.stdout, "write", (chunk: string | Uint8Array) => { stdout += String(chunk); return true; });

  fs.writeFileSync(urlsPath, `${url}\n`);
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
        directory: cacheDir,
        mode: "offline",
      },
      output: {
        directory: outputDir,
        includeIntermediateStates: false,
      },
    })
  );
  writeCacheEntry(cacheDir, {
    url,
    html: `
      <script type="application/ld+json">
        {"@type":"Recipe","name":"Toast","recipeIngredient":["1 Scheibe Brot"]}
      </script>
    `,
    fetchedAt: "2026-05-31T00:00:00.000Z",
    status: 200,
    contentType: "text/html",
  });

  const exitCode = await main(
    ["analyze", "--config", configPath, "--urls", urlsPath],
    {},
    {
      writeRecipeOutputs: writeFakeOutputs,
      enrichPlanning: fakePlanning, writeTimelineOutputs: writeFakeTimeline,
      fetcher: async () => {
        throw new Error("offline mode must not fetch");
      },
      llmClient: {
        complete: async () =>
          JSON.stringify({
            metadata: {
              title: "Toast",
              sourceUrl: url,
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
  const outputFiles = fs.readdirSync(outputDir);
  assert.equal(outputFiles.some((file) => file.endsWith(".recipe.json")), true);
  assert.equal(outputFiles.some((file) => file.endsWith(".ingredients.txt")), true);
  assert.equal(outputFiles.some((file) => file.endsWith(".mmd")), true);
  assert.equal(outputFiles.some((file) => file.endsWith(".svg")), true);
  assert.equal(outputFiles.some((file) => file.endsWith(".png")), true);
  assert.match(stdout, /SVG: .*\.svg/);
  assert.match(stdout, /PNG: .*\.png/);
});
