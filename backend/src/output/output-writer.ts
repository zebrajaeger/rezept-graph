import fs from "node:fs";
import path from "node:path";
import { hashSourceIdentity } from "../source-identity";
import { renderMermaid } from "./mermaid";
import { preparePresentation, type RenderOptions } from "../presentation/prepare-presentation";
import type { RecipeAnalysis, Ingredient } from "../recipe/recipe-types";
import { renderGraphImages } from "./image-renderer";
import { CliError } from "../errors";
import { enrichIconPresentation } from "./icon-presentation";

export async function writeRecipeOutputs(analysis: RecipeAnalysis, outputDir: string, options: RenderOptions = {}, deps: { renderImages?: typeof renderGraphImages } = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const normalizedAnalysis = {
    ...analysis,
    ingredientList: formatIngredientList(analysis),
  };
  const slug = createOutputSlug(analysis);
  const jsonPath = path.join(outputDir, `${slug}.recipe.json`);
  const ingredientsPath = path.join(outputDir, `${slug}.ingredients.txt`);
  const mermaidPath = path.join(outputDir, `${slug}.mmd`);
  const svgPath = path.join(outputDir, `${slug}.svg`);
  const pngPath = path.join(outputDir, `${slug}.png`);
  const removeImages = () => {
    fs.rmSync(svgPath, { force: true });
    fs.rmSync(pngPath, { force: true });
  };
  removeImages();

  fs.writeFileSync(jsonPath, `${JSON.stringify(normalizedAnalysis, null, 2)}\n`);
  fs.writeFileSync(ingredientsPath, `${normalizedAnalysis.ingredientList.join("\n")}\n`);
  fs.writeFileSync(
    mermaidPath,
    renderMermaid(enrichIconPresentation(preparePresentation(normalizedAnalysis, {
      includeIntermediateStates: options.includeIntermediateStates,
    }), options.icons))
  );

  const stagingDir = fs.mkdtempSync(path.join(outputDir, ".render-"));
  try {
    const stagedMermaid = path.join(stagingDir, "graph.mmd");
    const stagedSvg = path.join(stagingDir, "graph.svg");
    const stagedPng = path.join(stagingDir, "graph.png");
    fs.copyFileSync(mermaidPath, stagedMermaid);
    await (deps.renderImages || renderGraphImages)({ mermaidPath: stagedMermaid, svgPath: stagedSvg, pngPath: stagedPng });
    for (const image of [stagedSvg, stagedPng]) {
      if (!fs.statSync(image).isFile() || fs.statSync(image).size === 0) throw new Error("Renderer produced an empty or invalid image.");
    }
    fs.renameSync(stagedSvg, svgPath);
    fs.renameSync(stagedPng, pngPath);
  } catch (error) {
    removeImages();
    throw new CliError(`Graph image generation failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }

  return {
    jsonPath,
    ingredientsPath,
    mermaidPath,
    svgPath,
    pngPath,
  };
}

export function formatIngredientList(analysis: Partial<Pick<RecipeAnalysis, "ingredients" | "ingredientList">>) {
  if (!Array.isArray(analysis.ingredients) || analysis.ingredients.length === 0) {
    return Array.isArray(analysis.ingredientList) ? analysis.ingredientList : [];
  }
  return analysis.ingredients.map(formatIngredientLine);
}

export function formatIngredientLine(ingredient: Partial<Ingredient>) {
  const amount = formatIngredientAmount(ingredient);
  const name = ingredient.name || ingredient.originalText || "";
  const preparation = ingredient.preparation ? ` (${ingredient.preparation})` : "";
  const line = [amount, name].filter(Boolean).join(" ");
  return `${line}${preparation}`.trim() || ingredient.originalText || "";
}

function formatIngredientAmount(ingredient: Partial<Ingredient>) {
  if (ingredient.quantity === null || ingredient.quantity === undefined) {
    return ingredient.unit || "";
  }
  const quantity = formatNumber(ingredient.quantity);
  return ingredient.unit ? `${quantity} ${ingredient.unit}` : quantity;
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(".", ",");
}

export function createOutputSlug(analysis: Pick<RecipeAnalysis, "metadata">) {
  const title = analysis.metadata?.title || "recipe";
  const cleaned = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const sourceHash = hashSourceIdentity(analysis.metadata?.sourceUrl || title).slice(0, 8);
  return `${cleaned || "recipe"}-${sourceHash}`;
}
