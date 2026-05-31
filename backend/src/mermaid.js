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
    lines.push(`  class ${safeId(node.id)} ${classForNodeType(node.type)};`);
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
  return `${id}["${label}"]`;
}

function classForNodeType(type) {
  if (type === "ingredient") return "ingredient";
  if (type === "intermediate") return "intermediate";
  return "process";
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
  classForNodeType,
  renderMermaid,
};
