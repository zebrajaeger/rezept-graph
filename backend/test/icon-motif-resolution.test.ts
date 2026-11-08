import assert from "node:assert/strict";
import test from "node:test";
import { resolveMotif } from "../src/icons/motif";
import { appleCakeIcons, appleCakeMotifs } from "./fixtures/apple-cake-icons";

test("real apple-cake phrases resolve expected motifs without mutating facts or using array IDs", () => {
  const before = JSON.stringify(appleCakeIcons);
  assert.equal(appleCakeIcons.nodes.filter(node => node.type !== "intermediate").length, 21);
  for (const node of appleCakeIcons.nodes) assert.equal(resolveMotif(node)?.key, appleCakeMotifs[node.id], node.label);
  assert.equal(JSON.stringify(appleCakeIcons), before);
  assert.equal(resolveMotif({ ...appleCakeIcons.nodes[0]!, id: "egg" } as typeof appleCakeIcons.nodes[number]), undefined);
});

test("ingredient grammar supports bounded amounts, units and explicit qualifiers", () => {
  for (const [label, key] of [
    ["3 Eier, Größe M", "egg"], ["2 Stück Eier", "egg"], ["  3   EIER, GRÖSSE M  ", "egg"],
    ["250 g Mehl", "flour"], ["1,5 kg Äpfel", "apple"], ["1.5 kg Äpfel", "apple"],
    ["1/2 kg Mehl", "flour"], ["½ kg Mehl", "flour"], ["1 1/2 kg Mehl", "flour"],
    ["125 g Zucker für den Teig", "sugar"], ["60 g Butter zum Bestreichen", "butter"],
    ["60 g weiche Butter", "butter"], ["1 TL Salz", "salt"], ["2 tbsp sugar", "sugar"],
    ["Ei", "egg"], ["Eier", "egg"], ["eggs", "egg"], ["Apfel", "apple"], ["Apfelstücke", "apple"],
    ["Butter", "butter"], ["Zucker", "sugar"], ["Mehl", "flour"], ["Salz", "salt"],
  ]) assert.equal(resolveMotif({ type: "ingredient", label: label! })?.key, `ingredients/${key}`, label);
});

test("ingredient grammar abstains on alternatives, compounds, unknown qualifiers and unsafe input", () => {
  for (const label of ["125 g weiche Margarine oder Butter", "50 g Zucker oder Zimtzucker zum Bestreuen", "Butter und Mehl", "Ei-Ersatz", "Apfelsaft", "Etwas Fett für die Form", "kein Ei", "Mehl für Kleister", "Ei für Mehl", "250 xyz Mehl", "0 g Mehl", "1/0 kg Mehl", "../egg", "egg/other", "C:\\egg", "Mehl\0", " ".repeat(4096) + "Ei"]) {
    assert.equal(resolveMotif({ type: "ingredient", label }), undefined, label.slice(0, 80));
  }
});

test("complete action phrases respect precedence, ambiguity and explicit device evidence", () => {
  for (const [label, key] of [["Backofen vorheizen", "oven"], ["Erste 45 Minuten backen", "oven"], ["Kuchen fertig backen", "oven"], ["Wasser 10 Minuten kochen", "pot"], ["Zwiebeln anbraten", "pan"], ["Bake the cake", "oven"], ["Boil water", "pot"], ["Fry onions", "pan"]]) {
    assert.equal(resolveMotif({ type: "process", label: label! })?.key, `processes/${key}`, label);
  }
  assert.equal(resolveMotif({ type: "process", label: "Backofen vorheizen", action: "   " })?.key, "processes/oven");
  assert.equal(resolveMotif({ type: "process", label: "backen", action: "Wasser kochen" })?.key, "processes/pot");
  assert.equal(resolveMotif({ type: "process", label: "backen", action: "Form reinigen" }), undefined);
  for (const label of ["200 °C", "Backofen reinigen", "nicht backen", "ohne zu backen", "do not bake", "no baking", "kochen oder braten", "backen und braten", "Falls nötig backen", "eventuell backen", "Backen vermeiden", "zum Backen bereitstellen", "Backen ist optional", "../backen", "backen/other", "x".repeat(4096) + " backen"]) assert.equal(resolveMotif({ type: "process", label }), undefined, label.slice(0, 80));
  assert.equal(resolveMotif({ type: "intermediate", label: "backen" }), undefined);
});
