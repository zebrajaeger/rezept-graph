function renderMermaid(analysis, options = {}) {
  const includeIntermediateStates = options.includeIntermediateStates !== false;
  const visibleNodes = analysis.nodes.filter(
    (node) => includeIntermediateStates || node.type !== "intermediate"
  );
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const edges = includeIntermediateStates
    ? analysis.edges
    : bridgeHiddenIntermediateEdges(analysis.edges, analysis.nodes);

  const lines = ["flowchart TD", ...styleLines()];
  for (const node of visibleNodes) {
    lines.push(`  ${renderNode(node)}`);
    lines.push(`  class ${safeId(node.id)} ${classForNode(node)};`);
  }
  for (const edge of edges) {
    if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) continue;
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

function renderNode(node) {
  const id = safeId(node.id);
  const label = escapeLabel(formatNodeLabel(node));
  if (node.type === "ingredient") {
    return `${id}(["${label}"])`;
  }
  if (node.type === "intermediate") {
    return `${id}(["${label}"])`;
  }
  if (isPassiveProcess(node)) {
    return `${id}{{"${label}"}}`;
  }
  return `${id}["${label}"]`;
}

function classForNode(node) {
  if (node.type === "ingredient") return "ingredient";
  if (node.type === "intermediate") return "intermediate";
  if (isHotProcess(node)) return "processHot";
  if (isColdPassiveProcess(node)) return "processColdPassive";
  if (isPassiveProcess(node)) return "processPassive";
  return "process";
}

function classForNodeType(type) {
  if (type === "ingredient") return "ingredient";
  if (type === "intermediate") return "intermediate";
  return "process";
}

function isHotProcess(node) {
  if (node.type !== "process") return false;
  if (node.temperature) return true;
  return containsKeyword(nodeText(node), [
    "backen",
    "kochen",
    "braten",
    "anbraten",
    "erhitzen",
    "vorheizen",
    "grillen",
    "schmoren",
    "sieden",
    "rosten",
    "toasten",
  ]);
}

function isColdPassiveProcess(node) {
  if (node.type !== "process") return false;
  return containsKeyword(nodeText(node), [
    "ruhen",
    "abkuhlen",
    "abkuehlen",
    "kuhlen",
    "kuehlen",
    "kaltstellen",
    "gehen lassen",
    "ziehen lassen",
    "quellen",
    "marinieren",
  ]);
}

function isPassiveProcess(node) {
  if (node.type !== "process") return false;
  return (
    isColdPassiveProcess(node) ||
    containsKeyword(nodeText(node), ["warten", "stehen lassen", "ziehen", "rasten"])
  );
}

function nodeText(node) {
  return normalizeText([node.label, node.action, node.notes].filter(Boolean).join(" "));
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss");
}

function containsKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function bridgeHiddenIntermediateEdges(edges, nodes) {
  const intermediateIds = new Set(
    nodes.filter((node) => node.type === "intermediate").map((node) => node.id)
  );
  const visibleEdges = edges.filter(
    (edge) => !intermediateIds.has(edge.from) && !intermediateIds.has(edge.to)
  );

  for (const intermediateId of intermediateIds) {
    const incoming = edges.filter((edge) => edge.to === intermediateId);
    const outgoing = edges.filter((edge) => edge.from === intermediateId);
    for (const fromEdge of incoming) {
      for (const toEdge of outgoing) {
        visibleEdges.push({
          from: fromEdge.from,
          to: toEdge.to,
          type: "before",
          label: "danach",
        });
      }
    }
  }

  return visibleEdges;
}

function formatNodeLabel(node) {
  const details = [node.label];
  if (node.duration) details.push(node.duration);
  if (node.temperature) details.push(node.temperature);
  return details.join("\\n");
}

function safeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeLabel(value) {
  return String(value).replace(/"/g, "'").replace(/\|/g, "/");
}

module.exports = {
  classForNode,
  classForNodeType,
  isColdPassiveProcess,
  isHotProcess,
  isPassiveProcess,
  renderMermaid,
};
