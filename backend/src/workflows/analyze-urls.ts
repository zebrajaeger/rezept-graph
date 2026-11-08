import { getRecipePage } from "../ingestion/cache";
import { fetchRecipeHtml } from "../ingestion/fetcher";
import { extractRecipeContent } from "../ingestion/extractor";
import { analyzeRecipeContent } from "../analysis/recipe-analyzer";
import { writeRecipeOutputs } from "../output/output-writer";
import type { Config } from "../config/config";
import type { CompletionClient } from "../llm/llm-client";
import type { PageFetcher } from "../http-types";
import { enrichPlanning } from "../planning/enrich-planning";
import { scheduleCooking } from "../planning/schedule-cooking";
import { clearTimelineImages, writeTimelineOutputs } from "../planning/timeline-output";

interface AnalysisResult { url: string; outputs: Awaited<ReturnType<typeof writeRecipeOutputs>> & Awaited<ReturnType<typeof writeTimelineOutputs>> }
interface AnalysisDependencies {
  getRecipePage: (input: Parameters<typeof getRecipePage>[0]) => Promise<{ html: string }>;
  extractRecipeContent: typeof extractRecipeContent;
  analyzeRecipeContent: typeof analyzeRecipeContent;
  writeRecipeOutputs: typeof writeRecipeOutputs;
  enrichPlanning: typeof enrichPlanning;
  writeTimelineOutputs: typeof writeTimelineOutputs;
  clearTimelineImages: typeof clearTimelineImages;
}

export async function analyzeUrls({ urls, config, client, fetcher = fetch, onProgress }: {
  urls: string[]; config: Config; client: CompletionClient; fetcher?: PageFetcher;
  onProgress?: (result: AnalysisResult) => void;
}, deps: Partial<AnalysisDependencies> = {}) {
  const active = { getRecipePage, extractRecipeContent, analyzeRecipeContent, writeRecipeOutputs, enrichPlanning, writeTimelineOutputs, clearTimelineImages, ...deps };
  const results: AnalysisResult[] = [];
  for (const url of urls) {
    const page = await active.getRecipePage({
      url, cacheDir: config.cache.directory, cacheMode: config.cache.mode,
      fetcher: (pageUrl) => fetchRecipeHtml(pageUrl, { fetcher, timeoutMs: 30000 }),
    });
    const content = active.extractRecipeContent(page.html, url);
    const analysis = await active.analyzeRecipeContent({ content, client });
    const outputs = await active.writeRecipeOutputs(analysis, config.output.directory, {
      includeIntermediateStates: config.output.includeIntermediateStates,
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
