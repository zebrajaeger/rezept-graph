import type { Bounds, CookingSchedule } from "./schedule-cooking";
import { renderMermaid } from "../output/mermaid";
import { preparePresentation } from "../presentation/prepare-presentation";

export function renderTimeline(plan: CookingSchedule): string {
  const de = plan.language === "de";
  const range = (b: Bounds) => b.min === null || b.max === null ? de ? "unbekannt" : "unknown" : String(b.min === b.max ? b.max : `${b.min}–${b.max}`).replace(/\./g, ",");
  const title = `${de ? "Planungsvorschlag" : "Suggested plan"} · ca. ${range(plan.total)} min`;
  const lines = ["---", `title: ${JSON.stringify(title)}`, "---", ...renderMermaid({ nodes: [], edges: [] }).trimEnd().split("\n")];
  const phases = [...plan.phases].sort((a, b) => (a.start.max ?? Infinity) - (b.start.max ?? Infinity) || a.id.localeCompare(b.id, "en"));
  const rows: typeof phases[] = [];
  for (const phase of phases) {
    const last = rows[rows.length - 1];
    if (last && phase.start.max !== null && last[0]!.start.max === phase.start.max) last.push(phase);
    else rows.push([phase]);
  }
  for (const [index, row] of rows.entries()) {
    lines.push(`subgraph row${index}[" "]`, "direction LR");
    for (const p of row) {
      const provenance = p.duration.provenance === "estimated" ? de ? "geschätzt" : "estimated" : p.duration.provenance === "recipe" ? de ? "laut Rezept" : "recipe" : de ? "unbekannt" : "unknown";
      const cue = p.attention === "unattended" ? de ? "Läuft nebenher" : "Runs alongside" : p.attention === "attended" ? de ? "Du machst · beaufsichtigen" : "You do · attended" : de ? "Du machst" : "You do";
      const label = [`${de ? "Ab ca." : "From approx."} ${range(p.start)} min · ${cue}`, p.instruction,
        `${range(p.duration)} min · ${provenance}`, p.readiness, p.returnCue ? `${de ? "Wieder dran" : "Return"}: ${p.returnCue}` : null,
        p === phases[phases.length - 1] ? `${de ? "Bis" : "Until"}: ${plan.endpoint}\n${de ? "Aktive Arbeit" : "Hands-on"}: ${range(plan.handsOn)} min · ${de ? "Beaufsichtigung" : "Attended"}: ${range(plan.attended)} min` : null].filter(Boolean).join("\n");
      const presentation = preparePresentation({ nodes: [{ id: `step${plan.phases.indexOf(p)}`, type: "process", label, temperature: p.temperature }], edges: [] });
      lines.push(...renderMermaid(presentation).trimEnd().split("\n").filter(line => !line.startsWith("flowchart") && !line.includes("classDef")));
    }
    lines.push("end", `style row${index} fill:transparent,stroke:transparent`);
    if (index > 0) for (const prior of rows[index - 1]!) for (const current of row) {
      lines.push(`step${plan.phases.indexOf(prior)} --> step${plan.phases.indexOf(current)}`);
    }
  }
  return `${lines.join("\n")}\n`;
}
