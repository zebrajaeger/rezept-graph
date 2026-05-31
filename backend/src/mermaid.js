function renderMermaid(analysis, options = {}) {
  const includeIntermediateStates = options.includeIntermediateStates !== false;
  const visibleNodes = analysis.nodes.filter(
    (node) => includeIntermediateStates || node.type !== "intermediate"
  );
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const edges = includeIntermediateStates
    ? analysis.edges
    : bridgeHiddenIntermediateEdges(analysis.edges, analysis.nodes);

  const lines = ["flowchart TD"];
  for (const node of visibleNodes) {
    lines.push(`  ${safeId(node.id)}["${escapeLabel(formatNodeLabel(node))}"]`);
  }
  for (const edge of edges) {
    if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) continue;
    const label = edge.label || edge.type;
    lines.push(`  ${safeId(edge.from)} -->|${escapeLabel(label)}| ${safeId(edge.to)}`);
  }
  return `${lines.join("\n")}\n`;
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
  renderMermaid,
};
