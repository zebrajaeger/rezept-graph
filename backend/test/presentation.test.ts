import assert from "node:assert/strict";
import test from "node:test";
import { preparePresentation } from "../src/presentation/prepare-presentation";
import { renderMermaid } from "../src/output/mermaid";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";

test("presentation is independent, immutable and syntax-free with existing cue precedence", () => {
  const recipe: Pick<RecipeAnalysis, "nodes" | "edges"> = {
    nodes: [
      { id: "a-b", type: "process", label: "Backen und warten", temperature: "180 C" },
      { id: "state", type: "intermediate", label: "Teig" },
      { id: "cold", type: "process", label: "Abkühlen lassen" },
    ],
    edges: [{ from: "a-b", to: "state", type: "produces" }, { from: "state", to: "cold", type: "before" }],
  };
  const original = structuredClone(recipe);
  recipe.nodes.forEach(Object.freeze);
  recipe.edges.forEach(Object.freeze);
  Object.freeze(recipe.nodes); Object.freeze(recipe.edges); Object.freeze(recipe);
  const shown = preparePresentation(recipe);
  const hidden = preparePresentation(recipe, { includeIntermediateStates: false });
  assert.deepEqual(shown.nodes[0]?.cues, { hot: true, coldPassive: false, passive: true });
  assert.deepEqual(shown.nodes[2]?.cues, { hot: false, coldPassive: true, passive: true });
  assert.deepEqual(hidden.edges, [{ from: "a-b", to: "cold", type: "before", label: "danach" }]);
  assert.equal(hidden.nodes.length, 2);
  assert.deepEqual(preparePresentation(recipe), shown);
  assert.deepEqual(preparePresentation(recipe, { includeIntermediateStates: false }), hidden);
  assert.deepEqual(recipe, original);
  assert.doesNotMatch(JSON.stringify(shown), /classDef|processHot|#[0-9a-f]{6}|flowchart|a_b/);
  shown.nodes[0]!.label = "changed";
  shown.nodes[0]!.cues.hot = false;
  shown.edges[0]!.label = "changed";
  assert.deepEqual(recipe, original);
  assert.notEqual(hidden.nodes[0]!.label, "changed");
});

test("renderer uses prepared cues rather than classifying labels or hiding nodes", () => {
  const text = renderMermaid({
    nodes: [{ id: "a-b", type: "process", label: "Backen | \"heiß\"", cues: { hot: false, coldPassive: false, passive: true } }],
    edges: [],
  });
  assert.match(text, /a_b\{\{"Backen \/ 'heiß'"\}\}/);
  assert.match(text, /class a_b processPassive;/);
  assert.doesNotMatch(text, /class a_b processHot;/);
});

test("projection preserves the existing non-recursive handling of adjacent intermediate states", () => {
  const view = preparePresentation({ nodes: [
    { id: "a", type: "process", label: "a" }, { id: "s1", type: "intermediate", label: "s1" },
    { id: "s2", type: "intermediate", label: "s2" }, { id: "b", type: "process", label: "b" },
  ], edges: [
    { from: "a", to: "s1", type: "produces" }, { from: "s1", to: "s2", type: "before" },
    { from: "s2", to: "b", type: "before" },
  ] }, { includeIntermediateStates: false });
  assert.deepEqual(view.edges, []);
});
