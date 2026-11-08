import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { LlmConfig } from "../src/config";
import {
  analyzeRecipeContent,
  completeWithOptionalCache,
  compactRecipeContent,
  createAnalysisMessages,
  parseJsonResponse,
} from "../src/recipe-analyzer";

const validAnalysis = {
  metadata: {
    title: "Toast",
    sourceUrl: "https://example.test/toast",
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
      confidence: 0.9,
    },
  ],
  nodes: [
    {
      id: "ing_bread",
      type: "ingredient",
      label: "1 Scheibe Brot",
    },
    {
      id: "step_toast",
      type: "process",
      label: "Toasten",
      action: "toasten",
      duration: "3 Minuten",
    },
  ],
  edges: [
    {
      from: "ing_bread",
      to: "step_toast",
      type: "used_in",
    },
  ],
  ingredientList: ["1 Scheibe Brot"],
};

test("createAnalysisMessages asks for JSON-only structured recipe output", () => {
  const messages = createAnalysisMessages({ text: "Rezept" });
  assert.ok(messages[0]);
  assert.ok(messages[1]);
  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /JSON/);
  assert.match(messages[1].content, /ingredientList/);
});

test("compactRecipeContent omits full text when structured recipe data exists", () => {
  const compact = compactRecipeContent({
    sourceUrl: "https://example.test",
    extractionMethod: "json-ld",
    structuredRecipe: { title: "Toast", ingredients: ["1 Brot"] },
    text: "Navigation Kommentare langer Text",
  });

  assert.deepEqual(compact, {
    sourceUrl: "https://example.test",
    extractionMethod: "json-ld",
    structuredRecipe: { title: "Toast", ingredients: ["1 Brot"] },
  });
});

test("compactRecipeContent limits fallback text length", () => {
  const compact = compactRecipeContent({
    sourceUrl: "https://example.test",
    extractionMethod: "text",
    text: "x".repeat(13000),
  });

  assert.equal(compact.text?.length, 12000);
});

test("parseJsonResponse accepts plain JSON and fenced JSON", () => {
  assert.deepEqual(parseJsonResponse(JSON.stringify(validAnalysis)), validAnalysis);
  assert.deepEqual(parseJsonResponse(`\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``), validAnalysis);
});

test("analyzeRecipeContent validates a fake successful LLM response", async () => {
  const analysis = await analyzeRecipeContent({
    content: { text: "Toast toasten" },
    llmConfig: { baseUrl: "http://example.test", model: "test", apiKeyEnv: "KEY" },
    client: {
      complete: async () => JSON.stringify(validAnalysis),
    },
  });

  assert.equal(analysis.metadata.title, "Toast");
});

test("analyzeRecipeContent rejects invalid fake LLM response", async () => {
  await assert.rejects(
    analyzeRecipeContent({
      content: { text: "Toast toasten" },
      llmConfig: { baseUrl: "http://example.test", model: "test", apiKeyEnv: "KEY" },
      client: {
        complete: async () => JSON.stringify({ nope: true }),
      },
    }),
    /Recipe analysis ist ungueltig/
  );
});

test("completeWithOptionalCache avoids repeated client calls", async () => {
  const responseCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-response-cache-"));
  let calls = 0;
  const client = {
    complete: async () => {
      calls += 1;
      return JSON.stringify(validAnalysis);
    },
  };
  const messages = createAnalysisMessages({ text: "Toast toasten" });
  const llmConfig: LlmConfig = {
    provider: "ollama",
    baseUrl: "https://ollama.com",
    model: "test-model",
    apiKeyEnv: "KEY",
    responseCacheDir,
  };

  await completeWithOptionalCache({ messages, llmConfig, client });
  await completeWithOptionalCache({ messages, llmConfig, client });

  assert.equal(calls, 1);
});
