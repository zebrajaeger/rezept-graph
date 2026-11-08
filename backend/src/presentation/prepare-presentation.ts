import type { RecipeAnalysis, RecipeNode, RecipeEdge } from "../recipe/recipe-types";

export interface RenderOptions { includeIntermediateStates?: boolean }
export interface PresentationNode extends RecipeNode {
  cues: { hot: boolean; coldPassive: boolean; passive: boolean };
}
export interface Presentation { nodes: PresentationNode[]; edges: RecipeEdge[] }
type DisplayNode = Partial<RecipeNode>;

export function preparePresentation(analysis: Pick<RecipeAnalysis, "nodes" | "edges">, options: RenderOptions = {}): Presentation {
  const includeIntermediateStates = options.includeIntermediateStates !== false;
  const nodes = analysis.nodes.filter((node) => includeIntermediateStates || node.type !== "intermediate")
    .map((node) => ({ ...node, cues: { hot: isHotProcess(node), coldPassive: isColdPassiveProcess(node), passive: isPassiveProcess(node) } }));
  const visibleIds = new Set(nodes.map((node) => node.id));
  const edges = includeIntermediateStates ? analysis.edges : bridgeHiddenIntermediateEdges(analysis.edges, analysis.nodes);
  return { nodes, edges: edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)).map((edge) => ({ ...edge })) };
}

export function isHotProcess(node: DisplayNode) {
  if (node.type !== "process") return false;
  if (node.temperature) return true;
  return containsKeyword(nodeText(node), [
    "backen", "kochen", "braten", "anbraten", "erhitzen", "vorheizen", "grillen", "schmoren", "sieden", "rosten", "toasten",
  ]);
}

export function isColdPassiveProcess(node: DisplayNode) {
  if (node.type !== "process") return false;
  return containsKeyword(nodeText(node), [
    "ruhen", "abkuhlen", "abkuehlen", "kuhlen", "kuehlen", "kaltstellen", "gehen lassen", "ziehen lassen", "quellen", "marinieren",
  ]);
}

export function isPassiveProcess(node: DisplayNode) {
  if (node.type !== "process") return false;
  return isColdPassiveProcess(node) || containsKeyword(nodeText(node), ["warten", "stehen lassen", "ziehen", "rasten"]);
}

function nodeText(node: DisplayNode) {
  return normalizeText([node.label, node.action, node.notes].filter(Boolean).join(" "));
}

function normalizeText(value: string) {
  return String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");
}

function containsKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function bridgeHiddenIntermediateEdges(edges: RecipeEdge[], nodes: RecipeNode[]) {
  const intermediateIds = new Set(nodes.filter((node) => node.type === "intermediate").map((node) => node.id));
  const visibleEdges = edges.filter((edge) => !intermediateIds.has(edge.from) && !intermediateIds.has(edge.to));
  // Preserve the existing single-intermediate projection, including its ordering.
  for (const intermediateId of intermediateIds) {
    const incoming = edges.filter((edge) => edge.to === intermediateId);
    const outgoing = edges.filter((edge) => edge.from === intermediateId);
    for (const fromEdge of incoming) {
      for (const toEdge of outgoing) {
        visibleEdges.push({ from: fromEdge.from, to: toEdge.to, type: "before", label: "danach" });
      }
    }
  }
  return visibleEdges;
}
