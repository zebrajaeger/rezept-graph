const { CliError } = require("./errors");
const { createOpenAiCompatibleClient } = require("./llm-client");
const { validateRecipeAnalysis } = require("./recipe-schema");

async function analyzeRecipeContent({ content, llmConfig, client }) {
  const activeClient = client || createOpenAiCompatibleClient(llmConfig);
  const rawResponse = await activeClient.complete(createAnalysisMessages(content));
  const parsed = parseJsonResponse(rawResponse);
  return validateRecipeAnalysis(parsed);
}

function createAnalysisMessages(content) {
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
          content,
        },
        null,
        2
      ),
    },
  ];
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
  createAnalysisMessages,
  parseJsonResponse,
};
