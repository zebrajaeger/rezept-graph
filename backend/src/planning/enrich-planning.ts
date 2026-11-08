import type { CompletionClient } from "../llm/llm-client";
import type { RecipeAnalysis } from "../recipe/recipe-types";
import type { ExtractedContent } from "../ingestion/extractor";
import { compactRecipeContent, parseJsonResponse } from "../analysis/recipe-analyzer";
import { validatePlanningInput } from "./planning-input";

export async function enrichPlanning({ content, analysis, client }: { content: ExtractedContent; analysis: RecipeAnalysis; client: CompletionClient }) {
  const raw = await client.complete([
    { role: "system", content: "Return strict JSON only. Plan a simple visual cooking guide for ONE cook. Never invent source evidence, safety instructions or shorten source cooking times. Use the recipe language (de or en)." },
    { role: "user", content: JSON.stringify({
      task: "single-person-cooking-timeline-v1",
      instructions: [
        "Cover EVERY process node using one or more phases. Preserve all temporal prerequisites. Do not include ingredient/state nodes as phases.",
        "Estimate missing preparation, preheating and cooling times responsibly, always marking estimated with a rationale. Use null min/max and unknown if not defensibly estimable.",
        "Keep recipe-sourced durations, temperatures and readiness conditions. Include concise instructions with ingredient amounts; do not merely refer back to the recipe.",
        "Split compound steps into hands-on setup, unattended phases and explicit timed interventions. Continuously supervised work is attended, never unattended. Recurring checks need explicit phases or attended classification.",
        "For timed returns split the preceding passive interval and put an event-relative instruction in returnCue. Never omit an intervention.",
        "For ovens include hands-on oven-on, unattended preheat depending on oven-on, and oven-use depending on preheat. preheat readiness must say to wait for actual oven readiness.",
        "dependencies contains PHASE ids (not process ids unless identical). List phases in recipe order, with stable unique ids. Do not supply timestamps.",
        "State the endpoint (baked vs ready to serve) and disclose excluded/unknown cooling, resting, or assumptions in assumptions. Be concise; no multi-person/resource management."
      ],
      requiredSchema: { language: "de|en", endpoint: "string", assumptions: ["string"], phases: [{
        id: "string", processId: "existing process node id", instruction: "string", attention: "hands-on|unattended|attended",
        dependencies: ["phase id"], duration: { min: "positive minutes|null", max: "positive minutes|null", provenance: "recipe|estimated|unknown", evidence: "source quote or estimate rationale" },
        temperature: "string|null", readiness: "string|null", returnCue: "event-relative instruction|null", role: "normal|oven-on|preheat|oven-use"
      }] },
      content: compactRecipeContent(content), analysis
    }) }
  ]);
  return validatePlanningInput(parseJsonResponse(raw), analysis);
}
