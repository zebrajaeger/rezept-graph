const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { writeRecipeOutputs } = require("../src/output-writer");

test("writeRecipeOutputs writes JSON, ingredient list, and Mermaid files", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-output-"));
  const result = writeRecipeOutputs(
    {
      metadata: {
        title: "Apfelkuchen",
        sourceUrl: "https://example.test/apfelkuchen",
      },
      ingredients: [],
      nodes: [{ id: "step", type: "process", label: "Backen" }],
      edges: [],
      ingredientList: ["2 Aepfel", "200 g Mehl"],
    },
    outputDir,
    { includeIntermediateStates: true }
  );

  assert.match(fs.readFileSync(result.jsonPath, "utf8"), /Apfelkuchen/);
  assert.equal(fs.readFileSync(result.ingredientsPath, "utf8"), "2 Aepfel\n200 g Mehl\n");
  assert.match(fs.readFileSync(result.mermaidPath, "utf8"), /flowchart TD/);
});
