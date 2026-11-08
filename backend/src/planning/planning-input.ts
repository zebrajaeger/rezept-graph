import { CliError } from "../errors";
import { isRecord } from "../unknown-data";
import type { RecipeAnalysis } from "../recipe/recipe-types";

export interface Duration { min: number | null; max: number | null; provenance: "recipe" | "estimated" | "unknown"; evidence: string }
export interface Phase {
  id: string; processId: string; instruction: string;
  attention: "hands-on" | "unattended" | "attended";
  dependencies: string[]; duration: Duration;
  temperature: string | null; readiness: string | null; returnCue: string | null;
  role: "normal" | "oven-on" | "preheat" | "oven-use";
}
export interface PlanningInput { language: "de" | "en"; endpoint: string; assumptions: string[]; phases: Phase[] }

export function validatePlanningInput(raw: unknown, analysis: RecipeAnalysis): PlanningInput {
  const fail = (reason: string): never => { throw new CliError(`Invalid planning input: ${reason}`); };
  const text = (value: unknown) => typeof value === "string" && value.trim().length > 0;
  if (!isRecord(raw) || !["de", "en"].includes(String(raw.language)) || !text(raw.endpoint) ||
    !Array.isArray(raw.assumptions) || !raw.assumptions.every(text) || !Array.isArray(raw.phases)) return fail("expected language, endpoint, assumptions and phases");
  const processIds = new Set(analysis.nodes.filter(n => n.type === "process").map(n => n.id));
  const ids = new Set<string>();
  for (const p of raw.phases) {
    if (!isRecord(p) || !text(p.id) || !text(p.processId) || !text(p.instruction) ||
      !processIds.has(String(p.processId)) || ids.has(String(p.id)) ||
      !["hands-on", "unattended", "attended"].includes(String(p.attention)) ||
      !["normal", "oven-on", "preheat", "oven-use"].includes(String(p.role)) ||
      !Array.isArray(p.dependencies) || !p.dependencies.every(text) ||
      ![p.temperature, p.readiness, p.returnCue].every(v => v === null || text(v))) return fail("invalid phase or process reference");
    ids.add(String(p.id));
    const d = p.duration;
    if (!isRecord(d) || !text(d.evidence)) return fail("duration requires evidence or estimation rationale");
    if (d.provenance === "unknown") {
      if (d.min !== null || d.max !== null) return fail("unknown duration requires null bounds");
    } else if (!["recipe", "estimated"].includes(String(d.provenance)) ||
      typeof d.min !== "number" || typeof d.max !== "number" || !Number.isFinite(d.min) || !Number.isFinite(d.max) || d.min <= 0 || d.max < d.min) return fail("invalid duration range or provenance");
  }
  const input = raw as unknown as PlanningInput;
  if ([...processIds].some(id => !input.phases.some(p => p.processId === id))) return fail("missing processing step coverage");
  for (const p of input.phases) if (p.dependencies.some(id => !ids.has(id))) return fail("unknown dependency");
  const graph = planningDependencies(input, analysis);
  const visited = new Set<string>(), visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) return fail("cyclic temporal dependencies");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of graph.get(id) || []) visit(dep);
    visiting.delete(id); visited.add(id);
  };
  input.phases.forEach(p => visit(p.id));
  for (const p of input.phases) {
    if (p.role === "preheat" && (p.attention !== "unattended" || !p.readiness || !input.phases.some(on => on.role === "oven-on" && graph.get(p.id)?.has(on.id)))) return fail("preheating requires oven activation and actual-readiness condition");
    if (p.role === "oven-on" && p.attention !== "hands-on") return fail("oven activation requires hands-on attention");
    if (p.role === "oven-use" && !input.phases.some(heat => heat.role === "preheat" && reaches(p.id, heat.id, graph))) return fail("oven use requires preheating");
  }
  return input;
}

export function reaches(id: string, target: string, graph: Map<string, Set<string>>, seen = new Set<string>()): boolean {
  if (seen.has(id)) return false;
  seen.add(id);
  return [...(graph.get(id) || [])].some(dep => dep === target || reaches(dep, target, graph, seen));
}

export function planningDependencies(input: PlanningInput, analysis: RecipeAnalysis): Map<string, Set<string>> {
  const graph = new Map(input.phases.map(p => [p.id, new Set(p.dependencies)]));
  const processes = new Set(analysis.nodes.filter(n => n.type === "process").map(n => n.id));
  const ingredients = new Set(analysis.nodes.filter(n => n.type === "ingredient").map(n => n.id));
  // Trace source prerequisites through intermediate states, stopping at each producer.
  const upstream = (id: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(id)) return new Set();
    seen.add(id);
    const found = new Set<string>();
    for (const edge of analysis.edges.filter(e => e.to === id)) {
      if (ingredients.has(edge.from)) continue;
      if (processes.has(edge.from)) found.add(edge.from);
      else for (const producer of upstream(edge.from, seen)) found.add(producer);
    }
    return found;
  };
  for (const process of processes) {
    const phases = input.phases.filter(p => p.processId === process);
    const localIds = new Set(phases.map(p => p.id));
    const roots = phases.filter(p => !p.dependencies.some(id => localIds.has(id)));
    for (const prior of upstream(process)) {
      const priorPhases = input.phases.filter(p => p.processId === prior);
      const leaves = priorPhases.filter(p => !priorPhases.some(q => q.dependencies.includes(p.id)));
      for (const root of roots) for (const leaf of leaves) graph.get(root.id)?.add(leaf.id);
    }
  }
  return graph;
}
