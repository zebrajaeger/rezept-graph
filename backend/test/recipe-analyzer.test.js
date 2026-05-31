const assert = require("node:assert/strict");
const test = require("node:test");
const {
  analyzeRecipeContent,
  createAnalysisMessages,
  parseJsonResponse,
} = require("../src/recipe-analyzer");

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
  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /JSON/);
  assert.match(messages[1].content, /ingredientList/);
});

test("parseJsonResponse accepts plain JSON and fenced JSON", () => {
  assert.deepEqual(parseJsonResponse(JSON.stringify(validAnalysis)), validAnalysis);
  assert.deepEqual(parseJsonResponse(`\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``), validAnalysis);
});

test("analyzeRecipeContent validates a fake successful LLM response", async () => {
  const analysis = await analyzeRecipeContent({
    content: { text: "Toast toasten" },
    llmConfig: {},
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
      llmConfig: {},
      client: {
        complete: async () => JSON.stringify({ nope: true }),
      },
    }),
    /Recipe analysis ist ungueltig/
  );
});
