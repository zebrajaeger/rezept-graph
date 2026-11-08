import type { PlanningInput, Phase } from "../../src/planning/planning-input";
import type { RecipeAnalysis } from "../../src/recipe/recipe-types";

function samplePhase(id: string, instruction: string, minutes: number, dependencies: string[] = [], attention: Phase["attention"] = "hands-on"): Phase {
  return { id, processId: id, instruction, attention, dependencies,
    duration: { min: minutes, max: minutes, provenance: "estimated", evidence: "Illustrative estimate for one cook; not measured" },
    temperature: null, readiness: null, returnCue: null, role: "normal" };
}
export function sampleRecipe(title: string, phases: Phase[]): RecipeAnalysis {
  return { metadata: { title }, ingredients: [], ingredientList: [], edges: [],
    nodes: [...new Set(phases.map(p => p.processId))].map(id => ({ id, type: "process", label: phases.find(p => p.processId === id)!.instruction })) };
}

export function breadSample(): { analysis: RecipeAnalysis; input: PlanningInput } {
  const phases = [samplePhase("knead", "Teig kneten", 10),
    samplePhase("rise", "Teig abgedeckt gehen lassen", 30, ["knead"], "unattended"),
    samplePhase("topping", "Belag schneiden und bereitstellen", 10, ["knead"]),
    samplePhase("form", "Form einfetten", 3, ["topping"]),
    samplePhase("on", "Ofen auf 200 °C einschalten", 1),
    samplePhase("heat", "Ofen vorheizen", 15, ["on"], "unattended"),
    samplePhase("shape", "Teig formen und belegen", 5, ["rise", "form"]),
    samplePhase("bake", "In den heißen Ofen geben und backen", 25, ["shape", "heat"], "unattended")];
  phases.find(p => p.id === "on")!.role = "oven-on";
  const heat = phases.find(p => p.id === "heat")!; heat.role = "preheat"; heat.readiness = "Erst bei tatsächlicher Ofenbereitschaft einschieben";
  const rise = phases.find(p => p.id === "rise")!; rise.readiness = "Bis sich das Volumen etwa verdoppelt hat";
  const shape = phases.find(p => p.id === "shape")!; shape.returnCue = "Nach der Gehzeit Teig prüfen";
  const bake = phases.find(p => p.id === "bake")!; bake.role = "oven-use"; bake.temperature = "200 °C";
  return { analysis: sampleRecipe("Hefeteig · illustratives Beispiel", phases), input: { language: "de", endpoint: "fertig gebacken", assumptions: ["Illustratives Beispiel, kein geprüftes Rezept", "Alle Zeiten geschätzt", "Abkühlzeit nicht enthalten"], phases } };
}

export function cakeSample(analysis?: RecipeAnalysis): { analysis: RecipeAnalysis; input: PlanningInput } {
  const phases = [
    samplePhase("p1", "26-cm-Springform einfetten", 2),
    samplePhase("oven-on", "Backofen auf 200 °C Ober-/Unterhitze einschalten", 1),
    samplePhase("p2", "Backofen vorheizen", 15, ["oven-on"], "unattended"),
    samplePhase("p3", "125 g weiches Fett, 125 g Zucker und 3 Eier verrühren", 4),
    samplePhase("p4", "250 g Mehl und ½ Päckchen Backpulver mischen", 1),
    samplePhase("p5", "Mehlmischung kurz unter die Ei-Masse rühren", 1, ["p3", "p4"]),
    samplePhase("p6", "1,5 kg Äpfel schälen, entkernen und achteln", 12),
    samplePhase("p7", "Apfelstücke unter den Teig heben", 2, ["p5", "p6"]),
    samplePhase("p8", "Teig in die Form füllen und glattstreichen", 2, ["p1", "p7"]),
    samplePhase("p9", "Auf unterer Schiene backen", 45, ["p2", "p8"], "unattended"),
    samplePhase("p10", "Kuchen mit 60 g Butter bestreichen", 2, ["p9"]),
    samplePhase("p11", "50 g Zucker oder Zimtzucker aufstreuen", 1, ["p10"]),
    samplePhase("p12", "Kuchen fertig backen", 5, ["p11"], "unattended")
  ];
  phases.find(p => p.id === "oven-on")!.processId = "p2";
  phases.find(p => p.id === "oven-on")!.role = "oven-on";
  const heat = phases.find(p => p.id === "p2")!; heat.role = "preheat"; heat.temperature = "200 °C Ober-/Unterhitze"; heat.readiness = "Nur in den tatsächlich vorgeheizten Ofen einschieben";
  const bake = phases.find(p => p.id === "p9")!; bake.role = "oven-use"; bake.temperature = "200 °C Ober-/Unterhitze"; bake.duration.provenance = "recipe"; bake.duration.evidence = "Erste 45 Minuten backen";
  phases.find(p => p.id === "p10")!.returnCue = "Nach 45 Minuten Backzeit wieder dran";
  const finish = phases.find(p => p.id === "p12")!; finish.role = "oven-use"; finish.dependencies.push("p2"); finish.duration.max = 10; finish.duration.provenance = "recipe"; finish.duration.evidence = "Weitere 5–10 Minuten; insgesamt 50–55 Minuten"; finish.temperature = "200 °C Ober-/Unterhitze";
  return { analysis: analysis || sampleRecipe("Apfelkuchen · Beispielplanung", phases), input: { language: "de", endpoint: "fertig gebacken", assumptions: ["Vorbereitung und Vorheizen geschätzt; Tempo kann abweichen", "Abkühlzeit nicht enthalten", "Startzeiten sind ungefähre Vorschläge"], phases } };
}
