import assert from "node:assert/strict";
import test from "node:test";
import type { RecipeAnalysis } from "../src/recipe/recipe-types";
import { validatePlanningInput, type PlanningInput, type Phase } from "../src/planning/planning-input";
import { enrichPlanning } from "../src/planning/enrich-planning";
import { scheduleCooking } from "../src/planning/schedule-cooking";
import { renderTimeline } from "../src/planning/render-timeline";
import { renderMermaid } from "../src/output/mermaid";

export function phase(id: string, minutes: number | null, attention: Phase["attention"] = "hands-on", dependencies: string[] = []): Phase {
  return { id, processId: id, instruction: id, attention, dependencies,
    duration: { min: minutes, max: minutes, provenance: minutes === null ? "unknown" : "estimated", evidence: "Fixture estimate" },
    temperature: null, readiness: null, returnCue: null, role: "normal" };
}
export function recipeFor(phases: Phase[]): RecipeAnalysis {
  return { metadata: { title: "Test" }, ingredients: [], ingredientList: [], edges: [],
    nodes: [...new Set(phases.map(p => p.processId))].map(id => ({ id, type: "process", label: id })) };
}
export function inputFor(phases: Phase[]): PlanningInput {
  return { language: "de", endpoint: "servierbereit", assumptions: ["One cook"], phases };
}

test("planning validates provenance, numeric ranges, coverage, references and cycles without changing analysis", () => {
  const p = phase("knead", 10);
  const recipe = recipeFor([p]);
  const before = JSON.stringify(recipe);
  assert.deepEqual(validatePlanningInput(inputFor([p]), recipe), inputFor([p]));
  assert.equal(JSON.stringify(recipe), before);
  for (const broken of [
    inputFor([]), inputFor([{ ...p, processId: "missing" }]),
    inputFor([{ ...p, dependencies: ["missing"] }]), inputFor([{ ...p, dependencies: [p.id] }]),
    inputFor([{ ...p, duration: { ...p.duration, max: -1 } }]),
    inputFor([{ ...p, duration: { ...p.duration, evidence: "" } }]),
    inputFor([{ ...p, duration: { ...p.duration, provenance: "unknown" } }]),
  ]) assert.throws(() => validatePlanningInput(broken, recipe), /planning/i);
  const rise = phase("rise", 30, "unattended");
  rise.duration = { min: 30, max: 45, provenance: "recipe", evidence: "30–45 minutes, until doubled" };
  rise.readiness = "Until doubled";
  assert.equal(validatePlanningInput(inputFor([rise]), recipeFor([rise])).phases[0]?.readiness, "Until doubled");
  assert.doesNotThrow(() => validatePlanningInput(inputFor([phase("cool", null)]), recipeFor([phase("cool", null)])));
});

test("enrichment sends recipe evidence and accepted analysis in a distinct request and rejects invalid responses", async () => {
  const p = phase("knead", 10), analysis = recipeFor([p]);
  let request = "";
  const content = { sourceUrl: "fixture", extractionMethod: "text" as const, text: "Knead until smooth", structuredRecipe: null };
  const result = await enrichPlanning({ content, analysis, client: { complete: async messages => {
    request = JSON.stringify(messages); return JSON.stringify(inputFor([p]));
  } } });
  assert.match(request, /single-person-cooking-timeline/);
  assert.match(request, /Knead until smooth/);
  assert.match(request, /estimated/);
  assert.deepEqual(result, inputFor([p]));
  await assert.rejects(enrichPlanning({ content, analysis, client: { complete: async () => "{}" } }), /planning/i);
});

test("single cook overlaps independent work with rising but never attention work", () => {
  const phases = [phase("knead", 10), phase("rise", 30, "unattended", ["knead"]), phase("topping", 10), phase("shape", 5, "hands-on", ["rise", "topping"])];
  const input = inputFor(phases), analysis = recipeFor(phases);
  const plan = scheduleCooking(input, analysis);
  assert.equal(plan.phases.find(p => p.id === "topping")?.start.max, 10);
  assert.equal(plan.phases.find(p => p.id === "rise")?.start.max, 10);
  assert.equal(plan.total.max, 45);
  assert.equal(plan.handsOn.max, 25);
  assert.deepEqual(scheduleCooking(input, analysis), plan);
});

test("source dependencies through intermediate states survive omitted enrichment dependencies", () => {
  const phases = [phase("first", 5), phase("second", 5)];
  const analysis = recipeFor(phases);
  analysis.nodes.push({ id: "state", type: "intermediate", label: "state" });
  analysis.edges = [{ from: "second", to: "state", type: "produces" }, { from: "state", to: "first", type: "used_in" }];
  const plan = scheduleCooking(inputFor(phases), analysis);
  assert.equal(plan.phases.find(p => p.id === "first")?.start.max, 5);
  assert.ok(plan.phases.find(p => p.id === "first")?.dependencies.includes("second"));
});

test("timed returns reserve attention before independent noninterruptible work", () => {
  const bake = phase("bake", 45, "unattended");
  bake.duration.provenance = "recipe";
  const brush = phase("brush", 2, "hands-on", ["bake"]);
  brush.returnCue = "After 45 minutes of baking: brush with 60 g butter";
  const phases = [bake, phase("other", 50), brush, phase("stir", 5, "attended", ["brush"])];
  const plan = scheduleCooking(inputFor(phases), recipeFor(phases));
  assert.equal(plan.phases.find(p => p.id === "brush")?.start.max, 45);
  assert.ok((plan.phases.find(p => p.id === "other")?.start.max ?? 0) >= 47);
  const other = plan.phases.find(p => p.id === "other")!, stir = plan.phases.find(p => p.id === "stir")!;
  assert.ok(other.end.max! <= stir.start.max! || stir.end.max! <= other.start.max!);
  assert.equal(plan.attended.max, 5);
});

test("recurring checks are explicit return phases rather than free time", () => {
  const simmer = phase("simmer", 10, "unattended");
  const check = phase("check", 1, "hands-on", ["simmer"]); check.returnCue = "Stir after 10 minutes";
  const more = phase("more", 10, "unattended", ["check"]);
  const again = phase("again", 1, "hands-on", ["more"]); again.returnCue = "Stir again";
  const phases = [simmer, phase("other", 25), check, more, again];
  const plan = scheduleCooking(inputFor(phases), recipeFor(phases));
  assert.equal(plan.phases.find(p => p.id === "check")?.start.max, 10);
  assert.equal(plan.phases.find(p => p.id === "again")?.start.max, 21);
});

test("preheating activation overlaps preparation and remains prerequisite of oven use", () => {
  const on = phase("on", 1); on.role = "oven-on";
  const heat = phase("heat", 15, "unattended", ["on"]); heat.role = "preheat"; heat.readiness = "Wait until oven is actually hot";
  const bake = phase("bake", 45, "unattended", ["heat", "prep2"]); bake.role = "oven-use";
  const phases = [phase("prep1", 10), phase("prep2", 10, "hands-on", ["prep1"]), on, heat, bake];
  const plan = scheduleCooking(inputFor(phases), recipeFor(phases));
  assert.ok((plan.phases.find(p => p.id === "on")?.start.max ?? 100) < 20);
  assert.ok(plan.phases.find(p => p.id === "heat")?.readiness);
  const short = [on, heat, { ...bake, dependencies: ["heat"] }];
  const shortPlan = scheduleCooking(inputFor(short), recipeFor(short));
  assert.equal(shortPlan.phases.find(p => p.id === "bake")?.start.max, 16);
});

test("range totals use consistent attention order and unknowns propagate without false totals", () => {
  const p = phase("prep", 5); p.duration.max = 10;
  const phases = [p, phase("cool", null, "unattended", ["prep"]), phase("serve", 1, "hands-on", ["cool"])];
  const plan = scheduleCooking(inputFor(phases), recipeFor(phases));
  assert.deepEqual(plan.phases.find(p => p.id === "prep")?.end, { min: 5, max: 10 });
  assert.equal(plan.total.max, null);
  assert.equal(plan.phases.find(p => p.id === "serve")?.start.max, null);
  assert.equal(plan.endpoint, "servierbereit");
});

test("view has two groups, relative times, estimates, action details and no dates", () => {
  const p = phase("brush", 2); p.instruction = "Mit 60 g Butter bestreichen"; p.returnCue = "Nach 45 Minuten Backzeit";
  p.temperature = "200 °C"; p.readiness = "Goldbraun";
  const phases = [p, phase("cool", null, "unattended", ["brush"])];
  const view = renderTimeline(scheduleCooking(inputFor(phases), recipeFor(phases)));
  for (const text of ["Du machst", "Läuft nebenher", "geschätzt", "60 g Butter", "200 °C", "Goldbraun", "45 Minuten", "unbekannt", "Planungsvorschlag", "servierbereit"]) assert.ok(view.includes(text), text);
  assert.doesNotMatch(view, /\d{4}-\d{2}-\d{2}/);
});

test("timeline reuses graph styles with chronological rows and no dashboard or dependency web", () => {
  const phases = [phase("knead", 10), phase("rise", 30, "unattended", ["knead"]), phase("topping", 10, "hands-on", ["knead"])];
  phases[1]!.instruction = "Teig gehen lassen";
  const view = renderTimeline(scheduleCooking(inputFor(phases), recipeFor(phases)));
  const graph = renderMermaid({ nodes: [], edges: [] });
  for (const line of graph.split("\n").filter(line => line.includes("classDef"))) assert.ok(view.includes(line), line);
  assert.doesNotMatch(view, /summary\[|subgraph active|subgraph passive|activeStyle|passiveStyle|-\.->/);
  assert.match(view, /title:/);
  assert.match(view, /class step1 processColdPassive/);
  assert.match(view, /step1\{\{/);
  assert.match(view, /subgraph row1[\s\S]*step1[\s\S]*step2/);
});
