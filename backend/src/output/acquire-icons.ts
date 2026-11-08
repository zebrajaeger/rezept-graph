import type { RecipeAnalysis } from "../recipe/recipe-types";
import { preparePresentation } from "../presentation/prepare-presentation";
import { renderMermaid } from "./mermaid";
import { enrichIconPresentation } from "./icon-presentation";
import { IconLibrary } from "../icons/library";
import { resolveMotif } from "../icons/motif";
import { selectBudgetedIcons } from "../icons/icon-display";
import { DisplayIconCache } from "../icons/icon-display-cache";
import path from "node:path";

export async function acquirePresentationIcons(analysis: RecipeAnalysis, library: IconLibrary, includeIntermediateStates: boolean, warn: (message: string) => void, displayCacheDirectory = path.resolve("backend/.cache/recipe-icons")) {
  const cache = new DisplayIconCache(displayCacheDirectory);
  const presentation = preparePresentation(analysis, { includeIntermediateStates });
  const candidates: Array<{ id: string; dataUri: string; width: number; height: number }> = [];
  for (const node of presentation.nodes) {
    if (node.type === "intermediate") continue;
    try {
      const bytes = await library.acquire(resolveMotif(node), analysis.metadata.sourceUrl || analysis.metadata.title, node.label);
      if (bytes) candidates.push({ id: node.id, ...await cache.acquire(bytes) });
    } catch { warn("Icon display preparation failed; retaining full text."); }
  }
  const selected = selectBudgetedIcons(candidates, candidate => candidate.id, icons => renderMermaid(enrichIconPresentation(presentation, icons)));
  if (selected.size < candidates.length) warn("Some icons were omitted to respect the Mermaid source budget.");
  return selected;
}
