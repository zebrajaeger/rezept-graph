const { CliError } = require("./errors");

const NODE_TYPES = new Set(["ingredient", "process", "intermediate"]);
const EDGE_TYPES = new Set(["used_in", "produces", "before", "requires"]);

function validateRecipeAnalysis(value) {
  const errors = [];
  if (!isObject(value)) {
    throw new CliError("Recipe analysis muss ein JSON-Objekt sein.");
  }

  validateMetadata(value.metadata, errors);
  validateIngredients(value.ingredients, errors);
  validateNodes(value.nodes, errors);
  validateEdges(value.edges, value.nodes, errors);
  validateIngredientList(value.ingredientList, errors);

  if (errors.length > 0) {
    throw new CliError(`Recipe analysis ist ungueltig: ${errors.join("; ")}`);
  }

  return value;
}

function validateMetadata(metadata, errors) {
  if (!isObject(metadata)) {
    errors.push("metadata fehlt");
    return;
  }
  requireString(metadata.title, "metadata.title", errors);
  optionalString(metadata.sourceUrl, "metadata.sourceUrl", errors);
  optionalString(metadata.servings, "metadata.servings", errors);
}

function validateIngredients(ingredients, errors) {
  if (!Array.isArray(ingredients)) {
    errors.push("ingredients muss eine Liste sein");
    return;
  }

  for (const [index, ingredient] of ingredients.entries()) {
    const prefix = `ingredients[${index}]`;
    if (!isObject(ingredient)) {
      errors.push(`${prefix} muss ein Objekt sein`);
      continue;
    }
    requireString(ingredient.id, `${prefix}.id`, errors);
    requireString(ingredient.name, `${prefix}.name`, errors);
    optionalNumber(ingredient.quantity, `${prefix}.quantity`, errors);
    optionalString(ingredient.unit, `${prefix}.unit`, errors);
    optionalString(ingredient.preparation, `${prefix}.preparation`, errors);
    requireString(ingredient.originalText, `${prefix}.originalText`, errors);
    optionalNumber(ingredient.confidence, `${prefix}.confidence`, errors);
  }
}

function validateNodes(nodes, errors) {
  if (!Array.isArray(nodes)) {
    errors.push("nodes muss eine Liste sein");
    return;
  }

  const ids = new Set();
  for (const [index, node] of nodes.entries()) {
    const prefix = `nodes[${index}]`;
    if (!isObject(node)) {
      errors.push(`${prefix} muss ein Objekt sein`);
      continue;
    }
    requireString(node.id, `${prefix}.id`, errors);
    if (node.id) {
      if (ids.has(node.id)) errors.push(`${prefix}.id ist doppelt: ${node.id}`);
      ids.add(node.id);
    }
    if (!NODE_TYPES.has(node.type)) {
      errors.push(`${prefix}.type muss einer von ${[...NODE_TYPES].join(", ")} sein`);
    }
    requireString(node.label, `${prefix}.label`, errors);
    optionalString(node.action, `${prefix}.action`, errors);
    optionalString(node.duration, `${prefix}.duration`, errors);
    optionalString(node.temperature, `${prefix}.temperature`, errors);
    optionalString(node.notes, `${prefix}.notes`, errors);
  }
}

function validateEdges(edges, nodes, errors) {
  if (!Array.isArray(edges)) {
    errors.push("edges muss eine Liste sein");
    return;
  }

  const nodeIds = new Set(Array.isArray(nodes) ? nodes.map((node) => node?.id) : []);
  for (const [index, edge] of edges.entries()) {
    const prefix = `edges[${index}]`;
    if (!isObject(edge)) {
      errors.push(`${prefix} muss ein Objekt sein`);
      continue;
    }
    requireString(edge.from, `${prefix}.from`, errors);
    requireString(edge.to, `${prefix}.to`, errors);
    if (edge.from && !nodeIds.has(edge.from)) errors.push(`${prefix}.from verweist auf unbekannten Node`);
    if (edge.to && !nodeIds.has(edge.to)) errors.push(`${prefix}.to verweist auf unbekannten Node`);
    if (!EDGE_TYPES.has(edge.type)) {
      errors.push(`${prefix}.type muss einer von ${[...EDGE_TYPES].join(", ")} sein`);
    }
    optionalString(edge.label, `${prefix}.label`, errors);
  }
}

function validateIngredientList(ingredientList, errors) {
  if (!Array.isArray(ingredientList)) {
    errors.push("ingredientList muss eine Liste sein");
    return;
  }
  ingredientList.forEach((line, index) => requireString(line, `ingredientList[${index}]`, errors));
}

function requireString(value, field, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${field} muss ein nicht-leerer String sein`);
  }
}

function optionalString(value, field, errors) {
  if (value !== undefined && value !== null && typeof value !== "string") {
    errors.push(`${field} muss ein String sein`);
  }
}

function optionalNumber(value, field, errors) {
  if (value !== undefined && value !== null && typeof value !== "number") {
    errors.push(`${field} muss eine Zahl sein`);
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
  EDGE_TYPES,
  NODE_TYPES,
  validateRecipeAnalysis,
};
