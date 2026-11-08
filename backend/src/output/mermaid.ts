import type { RecipeNode } from "../recipe/recipe-types";
import type { Presentation, PresentationNode } from "../presentation/prepare-presentation";

export function renderMermaid(presentation: Presentation) {
  const lines = [...(presentation.nodes.some(node => node.icon) ? ["---", "config:", "  htmlLabels: false", "---"] : []), "flowchart TD", ...styleLines()];
  for (const node of presentation.nodes) {
    lines.push(`  ${renderNode(node)}`);
    lines.push(`  class ${safeId(node.id)} ${classForNode(node)};`);
  }
  for (const edge of presentation.edges) {
    const label = edge.label || edge.type;
    lines.push(`  ${safeId(edge.from)} -->|${escapeLabel(label)}| ${safeId(edge.to)}`);
  }
  return `${lines.join("\n")}\n`;
}

function styleLines() {
  return [
    "  classDef ingredient fill:#e6f4ea,stroke:#2f6f4e,stroke-width:2px,color:#173b28;",
    "  classDef process fill:#e8f1ff,stroke:#2458a6,stroke-width:2px,color:#102c57;",
    "  classDef processHot fill:#ffe1df,stroke:#b42318,stroke-width:3px,color:#5f150f;",
    "  classDef processColdPassive fill:#eee7ff,stroke:#6b46c1,stroke-width:2px,stroke-dasharray:6 4,color:#39205f;",
    "  classDef processPassive fill:#f3f4f6,stroke:#667085,stroke-width:2px,stroke-dasharray:6 4,color:#344054;",
    "  classDef intermediate fill:#fff5cc,stroke:#9a6b00,stroke-width:2px,color:#4a3300;",
  ];
}

function renderNode(node: PresentationNode) {
  const id = safeId(node.id);
  const label = escapeLabel(formatNodeLabel(node));
  if (node.icon && node.type !== "intermediate" && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(node.icon.dataUri)) {
    const safeLabel = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\r\n]/g, " ").replace(/\\n/g, " ");
    return `${id}@{ img: "${node.icon.dataUri}", label: "${safeLabel}", pos: "b", w: 48, h: ${Math.max(1, Math.round(48 * node.icon.height / node.icon.width))}, constraint: "on" }`;
  }
  if (node.type === "ingredient") {
    return `${id}(["${label}"])`;
  }
  if (node.type === "intermediate") {
    return `${id}(["${label}"])`;
  }
  if (node.cues.passive) {
    return `${id}{{"${label}"}}`;
  }
  return `${id}["${label}"]`;
}

export function classForNode(node: Pick<PresentationNode, "type" | "cues">) {
  if (node.type === "ingredient") return "ingredient";
  if (node.type === "intermediate") return "intermediate";
  if (node.cues.hot) return "processHot";
  if (node.cues.coldPassive) return "processColdPassive";
  if (node.cues.passive) return "processPassive";
  return "process";
}

export function classForNodeType(type: string) {
  if (type === "ingredient") return "ingredient";
  if (type === "intermediate") return "intermediate";
  return "process";
}

function formatNodeLabel(node: RecipeNode) {
  const details = [node.label];
  if (node.duration) details.push(node.duration);
  if (node.temperature) details.push(node.temperature);
  return details.join("\\n");
}

function safeId(id: string) {
  return String(id).replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeLabel(value: string) {
  return String(value).replace(/"/g, "'").replace(/\|/g, "/");
}
