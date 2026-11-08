import { CliError } from "../errors";
import type { CompletionClient, CompletionMessage } from "../llm/llm-client";
import { validateRecipeAnalysis } from "../recipe/recipe-schema";
import { errorMessage } from "../unknown-data";
import type { ExtractedContent } from "../ingestion/extractor";

type AnalysisContent = Partial<Omit<ExtractedContent, "structuredRecipe">> & {
  structuredRecipe?: Partial<NonNullable<ExtractedContent["structuredRecipe"]>> | null;
};

export async function analyzeRecipeContent({ content, client }: {
  content: AnalysisContent; client: CompletionClient;
}) {
  const messages = createAnalysisMessages(content);
  const rawResponse = await client.complete(messages);
  const parsed = parseJsonResponse(rawResponse);
  return validateRecipeAnalysis(parsed);
}

export function createAnalysisMessages(content: AnalysisContent): CompletionMessage[] {
  const compactContent = compactRecipeContent(content);
  return [
    {
      role: "system",
      content:
        "Du extrahierst Rezepte als strikt gueltiges JSON. Antworte ohne Markdown und ohne erklaerenden Text.",
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task:
            "Analysiere das Rezept fuer Menschen mit ADHS: klare Zutaten, Verarbeitungsschritte, Zwischenzustaende und gerichtete Kanten.",
          requiredSchema: {
            metadata: {
              title: "string",
              sourceUrl: "string|null",
              servings: "string|null",
            },
            ingredients: [
              {
                id: "string",
                name: "string",
                quantity: "number|null",
                unit: "string|null",
                preparation: "string|null",
                originalText: "string",
                confidence: "number|null",
              },
            ],
            nodes: [
              {
                id: "string",
                type: "ingredient|process|intermediate",
                label: "string",
                action: "string|null",
                duration: "string|null",
                temperature: "string|null",
                notes: "string|null",
              },
            ],
            edges: [
              {
                from: "string",
                to: "string",
                type: "used_in|produces|before|requires",
                label: "string|null",
              },
            ],
            ingredientList: ["string"],
          },
          content: compactContent,
        },
        null,
        2
      ),
    },
  ];
}

export function compactRecipeContent(content?: AnalysisContent) {
  if (content?.structuredRecipe) {
    return {
      sourceUrl: content.sourceUrl,
      extractionMethod: content.extractionMethod,
      structuredRecipe: content.structuredRecipe,
    };
  }

  return {
    sourceUrl: content?.sourceUrl,
    extractionMethod: content?.extractionMethod || "text",
    text: String(content?.text || "").slice(0, 12000),
  };
}

export function parseJsonResponse(rawResponse: string): unknown {
  const trimmed = rawResponse.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new CliError(`LLM-Antwort ist kein gueltiges JSON: ${errorMessage(error)}`);
  }
}
