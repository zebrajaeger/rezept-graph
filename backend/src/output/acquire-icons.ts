import type { RecipeAnalysis } from "../recipe/recipe-types";
import { preparePresentation } from "../presentation/prepare-presentation";
import { renderMermaid } from "./mermaid";
import { enrichIconPresentation } from "./icon-presentation";
import { IconLibrary } from "../icons/library";
import { resolveMotif } from "../icons/motif";
import { selectBudgetedIcons } from "../icons/icon-display";
import { DisplayIconCache } from "../icons/icon-display-cache";
import path from "node:path";
import { acquireIngredientDisplay } from "../icons/ingredient-presentation";
import type { IngredientInterpreter } from "../icons/ingredient-semantics";
import { presentationPlan } from "../icons/ingredient-presentation";

export async function acquirePresentationIcons(analysis: RecipeAnalysis, library: IconLibrary, includeIntermediateStates: boolean, warn: (message: string) => void, displayCacheDirectory = path.resolve("backend/.cache/recipe-icons"), options: { interpreter?: IngredientInterpreter; presentation?: boolean } = {}) {
  const cache = new DisplayIconCache(displayCacheDirectory);
  const presentation = preparePresentation(analysis, { includeIntermediateStates });
  const candidates: Array<{ id: string; dataUri: string; width: number; height: number }> = [];
  for (const node of presentation.nodes) {
    if (node.type === "intermediate") continue;
    try {
      if (node.type === "ingredient" && options.interpreter) {
        const descriptor = await options.interpreter.resolve(node.label);
        if (descriptor) {
          if (options.presentation) {
            const display = await acquireIngredientDisplay(descriptor, library, cache, analysis.metadata.sourceUrl || analysis.metadata.title, displayCacheDirectory);
            if (display) candidates.push({ id: node.id, ...display });
            continue;
          }
          if (descriptor.kind === "single") {
            const base = presentationPlan({ ...descriptor, quantity: undefined, unit: undefined }).motifs[0];
            const bytes = await library.acquire(base, analysis.metadata.sourceUrl || analysis.metadata.title, node.label);
            if (bytes) candidates.push({ id: node.id, ...await cache.acquire(bytes) });
            continue;
          }
        }
      }
      const bytes = await library.acquire(resolveMotif(node), analysis.metadata.sourceUrl || analysis.metadata.title, node.label);
      if (bytes) candidates.push({ id: node.id, ...await cache.acquire(bytes) });
    } catch { warn("Icon display preparation failed; retaining full text."); }
  }
  const selected = selectBudgetedIcons(candidates, candidate => candidate.id, icons => renderMermaid(enrichIconPresentation(presentation, icons)));
  if (selected.size < candidates.length) warn("Some icons were omitted to respect the Mermaid source budget.");
  return selected;
}
