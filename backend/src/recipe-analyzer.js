const { CliError } = require("./errors");
const { createLlmClient } = require("./llm-client");
const { getOrCreateLlmResponse } = require("./llm-response-cache");
const { validateRecipeAnalysis } = require("./recipe-schema");

async function analyzeRecipeContent({ content, llmConfig, client }) {
  const activeClient = client || createLlmClient(llmConfig);
  const messages = createAnalysisMessages(content);
  const rawResponse = await completeWithOptionalCache({
    messages,
    llmConfig,
    client: activeClient,
  });
  const parsed = parseJsonResponse(rawResponse);
  return validateRecipeAnalysis(parsed);
}

async function completeWithOptionalCache({ messages, llmConfig, client }) {
  if (!llmConfig?.responseCacheDir) {
    return client.complete(messages);
  }

  const cached = await getOrCreateLlmResponse({
    cacheDir: llmConfig.responseCacheDir,
    cacheKeyParts: {
      provider: llmConfig.provider || "openai",
      baseUrl: llmConfig.baseUrl,
      model: llmConfig.model,
      messages,
    },
    createResponse: () => client.complete(messages),
  });

  return cached.content;
}

function createAnalysisMessages(content) {
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

function compactRecipeContent(content) {
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

function parseJsonResponse(rawResponse) {
  const trimmed = rawResponse.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new CliError(`LLM-Antwort ist kein gueltiges JSON: ${error.message}`);
  }
}

module.exports = {
  analyzeRecipeContent,
  completeWithOptionalCache,
  compactRecipeContent,
  createAnalysisMessages,
  parseJsonResponse,
};
