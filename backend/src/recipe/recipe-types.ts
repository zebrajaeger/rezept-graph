export type NodeType = "ingredient" | "process" | "intermediate";
export type EdgeType = "used_in" | "produces" | "before" | "requires";

export interface RecipeMetadata {
  title: string;
  sourceUrl?: string | null;
  servings?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  originalText: string;
  quantity?: number | null;
  unit?: string | null;
  preparation?: string | null;
  confidence?: number | null;
}

export interface RecipeNode {
  id: string;
  type: NodeType;
  label: string;
  action?: string | null;
  duration?: string | null;
  temperature?: string | null;
  notes?: string | null;
}

export interface RecipeEdge {
  from: string;
  to: string;
  type: EdgeType;
  label?: string | null;
}

export interface RecipeAnalysis {
  metadata: RecipeMetadata;
  ingredients: Ingredient[];
  nodes: RecipeNode[];
  edges: RecipeEdge[];
  ingredientList: string[];
}
