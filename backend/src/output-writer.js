const fs = require("node:fs");
const path = require("node:path");
const { createCacheKey } = require("./cache");
const { renderMermaid } = require("./mermaid");

function writeRecipeOutputs(analysis, outputDir, options = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const normalizedAnalysis = {
    ...analysis,
    ingredientList: formatIngredientList(analysis),
  };
  const slug = createOutputSlug(analysis);
  const jsonPath = path.join(outputDir, `${slug}.recipe.json`);
  const ingredientsPath = path.join(outputDir, `${slug}.ingredients.txt`);
  const mermaidPath = path.join(outputDir, `${slug}.mmd`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(normalizedAnalysis, null, 2)}\n`);
  fs.writeFileSync(ingredientsPath, `${normalizedAnalysis.ingredientList.join("\n")}\n`);
  fs.writeFileSync(
    mermaidPath,
    renderMermaid(normalizedAnalysis, {
      includeIntermediateStates: options.includeIntermediateStates,
    })
  );

  return {
    jsonPath,
    ingredientsPath,
    mermaidPath,
  };
}

function formatIngredientList(analysis) {
  if (!Array.isArray(analysis.ingredients) || analysis.ingredients.length === 0) {
    return Array.isArray(analysis.ingredientList) ? analysis.ingredientList : [];
  }
  return analysis.ingredients.map(formatIngredientLine);
}

function formatIngredientLine(ingredient) {
  const amount = formatIngredientAmount(ingredient);
  const name = ingredient.name || ingredient.originalText || "";
  const preparation = ingredient.preparation ? ` (${ingredient.preparation})` : "";
  const line = [amount, name].filter(Boolean).join(" ");
  return `${line}${preparation}`.trim() || ingredient.originalText || "";
}

function formatIngredientAmount(ingredient) {
  if (ingredient.quantity === null || ingredient.quantity === undefined) {
    return ingredient.unit || "";
  }
  const quantity = formatNumber(ingredient.quantity);
  return ingredient.unit ? `${quantity} ${ingredient.unit}` : quantity;
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(".", ",");
}

function createOutputSlug(analysis) {
  const title = analysis.metadata?.title || "recipe";
  const cleaned = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const sourceHash = createCacheKey(analysis.metadata?.sourceUrl || title).slice(0, 8);
  return `${cleaned || "recipe"}-${sourceHash}`;
}

module.exports = {
  createOutputSlug,
  formatIngredientLine,
  formatIngredientList,
  writeRecipeOutputs,
};
