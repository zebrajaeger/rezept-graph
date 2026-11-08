import type { RecipeAnalysis } from "../recipe/recipe-types";
import { planningDependencies, validatePlanningInput, type Phase, type PlanningInput } from "./planning-input";
import { CliError } from "../errors";

export interface Bounds { min: number | null; max: number | null }
export interface ScheduledPhase extends Phase { start: Bounds; end: Bounds }
export interface CookingSchedule extends Omit<PlanningInput, "phases"> { phases: ScheduledPhase[]; total: Bounds; handsOn: Bounds; attended: Bounds; suggested: true }
type Slot = { start: number; end: number };

export function scheduleCooking(raw: PlanningInput, analysis: RecipeAnalysis): CookingSchedule {
  const input = validatePlanningInput(raw, analysis);
  const deps = planningDependencies(input, analysis);
  const processOrder = new Map(analysis.nodes.map((n, i) => [n.id, i]));
  const compare = (a: Phase, b: Phase) => (processOrder.get(a.processId) ?? 0) - (processOrder.get(b.processId) ?? 0) || a.id.localeCompare(b.id, "en");
  const ordered: Phase[] = [], seen = new Set<string>();
  const add = (phase: Phase) => {
    if (seen.has(phase.id)) return;
    seen.add(phase.id);
    for (const id of [...(deps.get(phase.id) || [])].sort()) add(input.phases.find(p => p.id === id)!);
    ordered.push(phase);
  };
  // Reserve chains with return deadlines first, so independent long tasks cannot block them.
  for (const phase of input.phases.filter(p => p.returnCue).sort(compare)) add(phase);
  for (const phase of input.phases.filter(p => p.role === "oven-on").sort(compare)) add(phase);
  for (const phase of [...input.phases].sort(compare)) add(phase);

  const run = (bound: "min" | "max", attentionOrder?: string[], release = new Map<string, number>()) => {
    const result = new Map<string, Slot>();
    const unknown = new Set<string>();
    const attention: Slot[] = [];
    const pending = [...ordered];
    while (pending.length) {
      const index = pending.findIndex(p => [...(deps.get(p.id) || [])].every(id => result.has(id)) &&
        (!attentionOrder || p.attention === "unattended" || attentionOrder.slice(0, attentionOrder.indexOf(p.id)).every(id => result.has(id))));
      if (index < 0) throw new CliError("Planning could not resolve attention order and prerequisites.");
      const p = pending.splice(index, 1)[0]!;
      let start = Math.max(0, release.get(p.id) || 0, ...[...(deps.get(p.id) || [])].map(id => result.get(id)!.end));
      const duration = p.duration[bound] ?? 0;
      if (p.duration[bound] === null || [...(deps.get(p.id) || [])].some(id => unknown.has(id))) unknown.add(p.id);
      if (p.attention !== "unattended") {
        for (const slot of [...attention].sort((a, b) => a.start - b.start)) {
          if (start < slot.end && start + duration > slot.start) start = slot.end;
        }
        // Unknown attention work makes subsequent attention offsets uncertain, not zero-length facts.
        if ([...unknown].some(id => id !== p.id && input.phases.find(q => q.id === id)?.attention !== "unattended" && result.has(id))) unknown.add(p.id);
      }
      const slot = { start, end: start + duration };
      result.set(p.id, slot);
      if (p.attention !== "unattended") attention.push(slot);
    }
    return { result, unknown };
  };

  let upper = run("max");
  const release = new Map<string, number>();
  // Delay oven activation only to a free attention boundary that does not delay oven use.
  for (const heat of input.phases.filter(p => p.role === "preheat")) {
    const on = input.phases.find(p => p.role === "oven-on" && deps.get(heat.id)?.has(p.id));
    const use = input.phases.find(p => p.role === "oven-use" && deps.get(p.id)?.has(heat.id));
    if (!on || !use || heat.duration.max === null || on.duration.max === null) continue;
    const target = upper.result.get(use.id)!.start - heat.duration.max - on.duration.max;
    const boundaries = [0, ...input.phases.filter(p => p.attention !== "unattended" && p.id !== on.id).map(p => upper.result.get(p.id)!.end)].filter(t => t <= target).sort((a, b) => b - a);
    const originalStart = upper.result.get(use.id)!.start;
    for (const boundary of boundaries) {
      const candidate = new Map(release).set(on.id, boundary);
      const trial = run("max", undefined, candidate);
      if (trial.result.get(use.id)!.start <= originalStart) { release.set(on.id, boundary); upper = trial; break; }
    }
  }
  const attentionOrder = input.phases.filter(p => p.attention !== "unattended").sort((a, b) => upper.result.get(a.id)!.start - upper.result.get(b.id)!.start || compare(a, b)).map(p => p.id);
  const lower = run("min", attentionOrder);
  const sum = (kind: Phase["attention"], bound: "min" | "max") => {
    const phases = input.phases.filter(p => p.attention === kind);
    return phases.some(p => p.duration[bound] === null) ? null : phases.reduce((n, p) => n + p.duration[bound]!, 0);
  };
  return {
    ...input, suggested: true,
    phases: input.phases.map(p => ({ ...p, dependencies: [...(deps.get(p.id) || [])].sort(),
      start: { min: [...(deps.get(p.id) || [])].some(id => lower.unknown.has(id)) || (lower.unknown.has(p.id) && p.duration.min !== null) ? null : lower.result.get(p.id)!.start,
        max: [...(deps.get(p.id) || [])].some(id => upper.unknown.has(id)) || (upper.unknown.has(p.id) && p.duration.max !== null) ? null : upper.result.get(p.id)!.start },
      end: { min: lower.unknown.has(p.id) ? null : lower.result.get(p.id)!.end, max: upper.unknown.has(p.id) ? null : upper.result.get(p.id)!.end }
    })),
    total: { min: lower.unknown.size ? null : Math.max(0, ...[...lower.result.values()].map(s => s.end)), max: upper.unknown.size ? null : Math.max(0, ...[...upper.result.values()].map(s => s.end)) },
    handsOn: { min: sum("hands-on", "min"), max: sum("hands-on", "max") }, attended: { min: sum("attended", "min"), max: sum("attended", "max") }
  };
}
