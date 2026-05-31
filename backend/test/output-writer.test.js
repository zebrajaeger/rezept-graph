const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  formatIngredientLine,
  formatIngredientList,
  writeRecipeOutputs,
} = require("../src/output-writer");

test("formatIngredientLine includes quantity, unit, and preparation", () => {
  assert.equal(
    formatIngredientLine({
      name: "Aepfel",
      quantity: 1.5,
      unit: "kg",
      preparation: "geschaelt",
      originalText: "1.5 kg Aepfel",
    }),
    "1,5 kg Aepfel (geschaelt)"
  );
});

test("formatIngredientLine falls back to unit text without numeric quantity", () => {
  assert.equal(
    formatIngredientLine({
      name: "Butter",
      quantity: null,
      unit: "viel",
      preparation: "zum Bestreichen",
      originalText: "viel Butter",
    }),
    "viel Butter (zum Bestreichen)"
  );
});

test("formatIngredientList derives lines from normalized ingredients", () => {
  assert.deepEqual(
    formatIngredientList({
      ingredients: [
        {
          name: "Eier",
          quantity: 3,
          unit: null,
          preparation: null,
          originalText: "3 Eier",
        },
      ],
      ingredientList: ["Eier"],
    }),
    ["3 Eier"]
  );
});

test("writeRecipeOutputs writes JSON, ingredient list, and Mermaid files", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-output-"));
  const result = writeRecipeOutputs(
    {
      metadata: {
        title: "Apfelkuchen",
        sourceUrl: "https://example.test/apfelkuchen",
      },
      ingredients: [],
      ingredientList: ["2 Aepfel", "200 g Mehl"],
      nodes: [{ id: "step", type: "process", label: "Backen" }],
      edges: [],
    },
    outputDir,
    { includeIntermediateStates: true }
  );

  assert.match(fs.readFileSync(result.jsonPath, "utf8"), /Apfelkuchen/);
  assert.equal(fs.readFileSync(result.ingredientsPath, "utf8"), "2 Aepfel\n200 g Mehl\n");
  assert.match(fs.readFileSync(result.mermaidPath, "utf8"), /flowchart TD/);
});
