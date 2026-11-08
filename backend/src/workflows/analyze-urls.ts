import { getRecipePage } from "../ingestion/cache";
import { fetchRecipeHtml } from "../ingestion/fetcher";
import { extractRecipeContent } from "../ingestion/extractor";
import { analyzeRecipeContent } from "../analysis/recipe-analyzer";
import { writeRecipeOutputs } from "../output/output-writer";
import type { Config } from "../config/config";
import { createLlmClient, type CompletionClient } from "../llm/llm-client";
import { IngredientInterpreter } from "../icons/ingredient-semantics";
import type { PageFetcher } from "../http-types";
import { enrichPlanning } from "../planning/enrich-planning";
import { scheduleCooking } from "../planning/schedule-cooking";
import { clearTimelineImages, writeTimelineOutputs } from "../planning/timeline-output";
import { IconLibrary } from "../icons/library";
import { CodexGenerator } from "../icons/codex-generator";
import { acquirePresentationIcons } from "../output/acquire-icons";

interface AnalysisResult { url: string; outputs: Awaited<ReturnType<typeof writeRecipeOutputs>> & Awaited<ReturnType<typeof writeTimelineOutputs>> }
interface AnalysisDependencies {
  getRecipePage: (input: Parameters<typeof getRecipePage>[0]) => Promise<{ html: string }>;
  extractRecipeContent: typeof extractRecipeContent;
  analyzeRecipeContent: typeof analyzeRecipeContent;
  writeRecipeOutputs: typeof writeRecipeOutputs;
  enrichPlanning: typeof enrichPlanning;
  writeTimelineOutputs: typeof writeTimelineOutputs;
  clearTimelineImages: typeof clearTimelineImages;
  createIconLibrary: (config: NonNullable<Config["icons"]>, warn: (message: string) => void) => IconLibrary;
}

export async function analyzeUrls({ urls, config, client, fetcher = fetch, onProgress, onWarning = () => {} }: {
  urls: string[]; config: Config; client: CompletionClient; fetcher?: PageFetcher;
  onProgress?: (result: AnalysisResult) => void;
  onWarning?: (message: string) => void;
}, deps: Partial<AnalysisDependencies> = {}) {
  const active = { getRecipePage, extractRecipeContent, analyzeRecipeContent, writeRecipeOutputs, enrichPlanning, writeTimelineOutputs, clearTimelineImages, createIconLibrary: (icons: NonNullable<Config["icons"]>, warn: (message: string) => void) => new IconLibrary(icons, { generator: icons.mode === "generate-missing" && icons.generator ? new CodexGenerator(icons.generator) : undefined, warn }), ...deps };
  const library = config.icons && config.icons.mode !== "off" ? active.createIconLibrary(config.icons, onWarning) : undefined;
  const interpretation = config.icons?.interpretation;
  const interpreter = library && (interpretation || config.icons?.presentation)
    ? new IngredientInterpreter(config.icons!.mode, interpretation, interpretation && config.icons!.mode === "generate-missing" ? createLlmClient({ ...interpretation, maxResponseBytes: interpretation.maxOutputBytes + 4096 }) : undefined)
    : undefined;
  const results: AnalysisResult[] = [];
  for (const url of urls) {
    const page = await active.getRecipePage({
      url, cacheDir: config.cache.directory, cacheMode: config.cache.mode,
      fetcher: (pageUrl) => fetchRecipeHtml(pageUrl, { fetcher, timeoutMs: 30000 }),
    });
    const content = active.extractRecipeContent(page.html, url);
    const analysis = await active.analyzeRecipeContent({ content, client });
    let icons: Awaited<ReturnType<typeof acquirePresentationIcons>> | undefined;
    if (library) {
      try { icons = await acquirePresentationIcons(analysis, library, config.output.includeIntermediateStates, onWarning, config.icons?.displayCacheDirectory, { interpreter, presentation: config.icons?.presentation }); }
      catch { onWarning("Icon acquisition failed; rendering text-only graph."); }
      await library.report();
    }
    const outputs = await active.writeRecipeOutputs(analysis, config.output.directory, {
      includeIntermediateStates: config.output.includeIntermediateStates,
      ...(icons ? { icons } : {}),
    });
    active.clearTimelineImages(outputs.mermaidPath);
    const planning = await active.enrichPlanning({ content, analysis, client });
    const timeline = await active.writeTimelineOutputs(scheduleCooking(planning, analysis), outputs.mermaidPath);
    const result = { url, outputs: { ...outputs, ...timeline } };
    results.push(result);
    onProgress?.(result);
  }
  return results;
}
