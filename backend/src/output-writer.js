const fs = require("node:fs");
const path = require("node:path");
const { createCacheKey } = require("./cache");
const { renderMermaid } = require("./mermaid");

function writeRecipeOutputs(analysis, outputDir, options = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const slug = createOutputSlug(analysis);
  const jsonPath = path.join(outputDir, `${slug}.recipe.json`);
  const ingredientsPath = path.join(outputDir, `${slug}.ingredients.txt`);
  const mermaidPath = path.join(outputDir, `${slug}.mmd`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(analysis, null, 2)}\n`);
  fs.writeFileSync(ingredientsPath, `${analysis.ingredientList.join("\n")}\n`);
  fs.writeFileSync(
    mermaidPath,
    renderMermaid(analysis, {
      includeIntermediateStates: options.includeIntermediateStates,
    })
  );

  return {
    jsonPath,
    ingredientsPath,
    mermaidPath,
  };
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
  writeRecipeOutputs,
};
