const assert = require("node:assert/strict");
const test = require("node:test");
const { classForNodeType, renderMermaid } = require("../src/mermaid");

function analysis() {
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
    ],
    edges: [
      { from: "ing_flour", to: "step_mix", type: "used_in", label: "verwenden" },
      { from: "step_mix", to: "state_dough", type: "produces" },
      { from: "state_dough", to: "step_bake", type: "before" },
    ],
  };
}

test("renderMermaid includes useful timing and temperature details", () => {
  const mermaid = renderMermaid(analysis(), { includeIntermediateStates: true });
  assert.match(mermaid, /Teig ruehren\\n5 Minuten/);
  assert.match(mermaid, /Backen\\n180 C/);
  assert.match(mermaid, /state_dough/);
  assert.match(mermaid, /classDef ingredient/);
  assert.match(mermaid, /class ing_flour ingredient;/);
  assert.match(mermaid, /class step_mix process;/);
  assert.match(mermaid, /class state_dough intermediate;/);
});

test("renderMermaid can hide intermediate states and bridge flow", () => {
  const mermaid = renderMermaid(analysis(), { includeIntermediateStates: false });
  assert.doesNotMatch(mermaid, /state_dough/);
  assert.match(mermaid, /step_mix -->\|danach\| step_bake/);
});

test("classForNodeType maps unknown node types to process styling", () => {
  assert.equal(classForNodeType("ingredient"), "ingredient");
  assert.equal(classForNodeType("intermediate"), "intermediate");
  assert.equal(classForNodeType("unknown"), "process");
});
