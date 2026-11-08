import type { Presentation } from "../presentation/prepare-presentation";

/** Pure copy: images supplement visible semantic nodes without changing recipe facts. */
export function enrichIconPresentation(presentation: Presentation, icons?: ReadonlyMap<string, { dataUri: string; width: number; height: number }>): Presentation {
  if (!icons?.size) return presentation;
  return { ...presentation, nodes: presentation.nodes.map(node => ({ ...node, ...(node.type !== "intermediate" && icons.has(node.id) ? { icon: icons.get(node.id) } : {}) })) };
}
