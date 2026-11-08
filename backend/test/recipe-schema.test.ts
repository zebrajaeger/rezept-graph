import assert from "node:assert/strict";
import test from "node:test";
import { validateRecipeAnalysis } from "../src/recipe/recipe-schema";

function validAnalysis() {
  return {
    metadata: {
      title: "Pfannkuchen",
      sourceUrl: "https://example.test/pfannkuchen",
      servings: "2 Portionen",
    },
    ingredients: [
      {
        id: "ing_egg",
        name: "Ei",
        quantity: 2,
        unit: "Stueck",
        preparation: null,
        originalText: "2 Eier",
        confidence: 0.95,
      },
    ],
    nodes: [
      {
        id: "ing_egg",
        type: "ingredient",
        label: "2 Eier",
      },
      {
        id: "step_mix",
        type: "process",
        label: "Teig ruehren",
        action: "ruehren",
        duration: "5 Minuten",
      },
      {
        id: "state_batter",
        type: "intermediate",
        label: "Teig",
      },
    ],
    edges: [
      {
        from: "ing_egg",
        to: "step_mix",
        type: "used_in",
        label: "wird verwendet in",
      },
      {
        from: "step_mix",
        to: "state_batter",
        type: "produces",
      },
    ],
    ingredientList: ["2 Eier"],
  };
}

test("validateRecipeAnalysis accepts valid recipe analysis payloads", () => {
  const analysis = validAnalysis();
  assert.equal(validateRecipeAnalysis(analysis), analysis);
});

test("validateRecipeAnalysis rejects unknown node and edge types", () => {
  const analysis = validAnalysis();
  assert.ok(analysis.nodes[0]);
  assert.ok(analysis.edges[0]);
  analysis.nodes[0].type = "tool";
  analysis.edges[0].type = "contains";

  assert.throws(() => validateRecipeAnalysis(analysis), /nodes\[0\]\.type.*edges\[0\]\.type/);
});

test("validateRecipeAnalysis rejects edges pointing to unknown nodes", () => {
  const analysis = validAnalysis();
  assert.ok(analysis.edges[0]);
  analysis.edges[0].to = "missing";

  assert.throws(() => validateRecipeAnalysis(analysis), /edges\[0\]\.to/);
});
