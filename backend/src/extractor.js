function extractRecipeContent(html, sourceUrl) {
  const structuredRecipe = extractJsonLdRecipe(html);
  const text = cleanHtmlText(html);

  return {
    sourceUrl,
    extractionMethod: structuredRecipe ? "json-ld" : "text",
    structuredRecipe,
    text,
  };
}

function extractJsonLdRecipe(html) {
  const scripts = extractJsonLdScripts(html);
  for (const script of scripts) {
    const parsed = parseJson(script);
    const recipe = findRecipeObject(parsed);
    if (recipe) {
      return normalizeRecipeObject(recipe);
    }
  }
  return null;
}

function extractJsonLdScripts(html) {
  const scripts = [];
  const pattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    scripts.push(decodeHtmlEntities(match[1].trim()));
  }
  return scripts;
}

function findRecipeObject(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  if (isRecipeType(value["@type"])) return value;

  if (value["@graph"]) {
    return findRecipeObject(value["@graph"]);
  }
  if (value.itemListElement) {
    return findRecipeObject(value.itemListElement);
  }
  return null;
}

function normalizeRecipeObject(recipe) {
  return {
    title: firstString(recipe.name),
    description: firstString(recipe.description),
    recipeYield: recipe.recipeYield || null,
    ingredients: normalizeStringList(recipe.recipeIngredient),
    instructions: normalizeInstructions(recipe.recipeInstructions),
    totalTime: firstString(recipe.totalTime),
    prepTime: firstString(recipe.prepTime),
    cookTime: firstString(recipe.cookTime),
  };
}

function normalizeInstructions(instructions) {
  if (!instructions) return [];
  if (typeof instructions === "string") return [instructions.trim()].filter(Boolean);
  if (Array.isArray(instructions)) {
    return instructions
      .flatMap((item) => {
        if (typeof item === "string") return item;
        if (item?.text) return item.text;
        if (item?.itemListElement) return normalizeInstructions(item.itemListElement);
        return [];
      })
      .map((text) => String(text).trim())
      .filter(Boolean);
  }
  if (instructions.text) return [String(instructions.text).trim()].filter(Boolean);
  return [];
}

function cleanHtmlText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function parseJson(rawJson) {
  try {
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

function isRecipeType(type) {
  if (Array.isArray(type)) return type.some(isRecipeType);
  return typeof type === "string" && type.toLowerCase() === "recipe";
}

function normalizeStringList(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function firstString(value) {
  if (Array.isArray(value)) return firstString(value[0]);
  return typeof value === "string" ? value.trim() : null;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

module.exports = {
  cleanHtmlText,
  extractJsonLdRecipe,
  extractRecipeContent,
};
