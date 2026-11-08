import assert from "node:assert/strict";
import test from "node:test";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";
import { preparePresentation, isColdPassiveProcess, isHotProcess, isPassiveProcess } from "../src/presentation/prepare-presentation";
import {
  classForNode,
  classForNodeType,
  renderMermaid,
} from "../src/output/mermaid";

function analysis(): Pick<RecipeAnalysis, "nodes" | "edges"> {
  return {
    nodes: [
      { id: "ing_flour", type: "ingredient", label: "200 g Mehl" },
      {
        id: "step_mix",
        type: "process",
        label: "Teig ruehren",
        duration: "5 Minuten",
      },
      { id: "state_dough", type: "intermediate", label: "Teig" },
      {
        id: "step_bake",
        type: "process",
        label: "Backen",
        temperature: "180 C",
      },
      {
        id: "step_rest",
        type: "process",
        label: "Teig ruhen lassen",
        duration: "30 Minuten",
      },
    ],
    edges: [
      { from: "ing_flour", to: "step_mix", type: "used_in", label: "verwenden" },
      { from: "step_mix", to: "state_dough", type: "produces" },
      { from: "state_dough", to: "step_bake", type: "before" },
    ],
  };
}

test("renderMermaid includes useful timing and temperature details", () => {
  const mermaid = renderMermaid(preparePresentation(analysis(), { includeIntermediateStates: true }));
  assert.match(mermaid, /Teig ruehren\\n5 Minuten/);
  assert.match(mermaid, /Backen\\n180 C/);
  assert.match(mermaid, /state_dough/);
  assert.match(mermaid, /classDef ingredient/);
  assert.match(mermaid, /class ing_flour ingredient;/);
  assert.match(mermaid, /class step_mix process;/);
  assert.match(mermaid, /class step_bake processHot;/);
  assert.match(mermaid, /class step_rest processColdPassive;/);
  assert.match(mermaid, /class state_dough intermediate;/);
});

test("renderMermaid can hide intermediate states and bridge flow", () => {
  const mermaid = renderMermaid(preparePresentation(analysis(), { includeIntermediateStates: false }));
  assert.doesNotMatch(mermaid, /state_dough/);
  assert.match(mermaid, /step_mix -->\|danach\| step_bake/);
});

test("classForNodeType maps unknown node types to process styling", () => {
  assert.equal(classForNodeType("ingredient"), "ingredient");
  assert.equal(classForNodeType("intermediate"), "intermediate");
  assert.equal(classForNodeType("unknown"), "process");
});

test("classForNode identifies hot and passive process styles", () => {
  assert.equal(
    classForNode({ type: "process", cues: { hot: true, coldPassive: false, passive: false } }),
    "processHot"
  );
  assert.equal(
    classForNode({ type: "process", cues: { hot: false, coldPassive: true, passive: true } }),
    "processColdPassive"
  );
  assert.equal(
    classForNode({ type: "process", cues: { hot: false, coldPassive: false, passive: true } }),
    "processPassive"
  );
});

test("process classifiers detect temperature and passive wording", () => {
  assert.equal(isHotProcess({ type: "process", label: "Garen", temperature: "180 C" }), true);
  assert.equal(isColdPassiveProcess({ type: "process", label: "Abkühlen lassen" }), true);
  assert.equal(isPassiveProcess({ type: "process", label: "Teig ruhen lassen" }), true);
});
