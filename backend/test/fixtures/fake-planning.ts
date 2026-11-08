import type { enrichPlanning } from "../../src/planning/enrich-planning";
import { writeTimelineOutputs } from "../../src/planning/timeline-output";
import { fakeImages } from "./fake-images";

export const fakePlanning: typeof enrichPlanning = async ({ analysis }) => ({
  language: "de", endpoint: "fertig", assumptions: ["Fixture estimates"],
  phases: analysis.nodes.filter(n => n.type === "process").map(n => ({
    id: n.id, processId: n.id, instruction: n.label, attention: "hands-on", dependencies: [],
    duration: { min: 1, max: 2, provenance: "estimated", evidence: "Fixture estimate" },
    temperature: n.temperature || null, readiness: null, returnCue: null, role: "normal"
  }))
});
export const writeFakeTimeline: typeof writeTimelineOutputs = (plan, file) => writeTimelineOutputs(plan, file, { renderImages: fakeImages });
