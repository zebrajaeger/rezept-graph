import type { RecipeAnalysis } from "../../src/recipe/recipe-types";

/** Sanitized regression structure from the observed zero-icon run; no provider response required. */
export const appleCakeIcons: RecipeAnalysis = {
  metadata: { title: "Apple cake icon regression" },
  ingredients: [{ id: "separate-ingredient-id", name: "Eier", originalText: "3 Eier, Größe M", quantity: 3 }],
  ingredientList: ["3 Eier, Größe M", "250 g Mehl", "1,5 kg Äpfel"],
  nodes: [
    ...["Etwas Fett für die Form", "125 g weiche Margarine oder Butter", "125 g Zucker für den Teig", "3 Eier, Größe M", "0,5 Päckchen Backpulver", "250 g Mehl", "1,5 kg Äpfel", "60 g Butter zum Bestreichen", "50 g Zucker oder Zimtzucker zum Bestreuen"].map((label, index) => ({ id: `i${index + 1}`, type: "ingredient" as const, label })),
    ...[
      ["Springform einfetten", "Boden und Ränder einer Springform sorgfältig einfetten."],
      ["Backofen vorheizen", "Backofen auf 200 °C Ober-/Unterhitze vorheizen."],
      ["Fett, Zucker und Eier verrühren", "Margarine oder Butter mit Zucker und Eiern verrühren."],
      ["Mehl und Backpulver mischen", "Mehl mit Backpulver vermischen."],
      ["Mehlmischung kurz unterrühren", "Die Mehl-Backpulver-Mischung kurz unter die Masse rühren."],
      ["Äpfel vorbereiten", "Äpfel schälen und entkernen."],
      ["Apfelstücke unterheben", "Die Apfelstücke unter den Teig heben."],
      ["Form füllen und Masse glattstreichen", "Die Masse in die Form füllen und glattstreichen."],
      ["Erste 45 Minuten backen", "Den Kuchen im vorgeheizten Backofen auf der unteren Schiene backen."],
      ["Kuchen mit Butter bestreichen", "Den Kuchen nach 45 Minuten Backzeit mit Butter bestreichen."],
      ["Zucker oder Zimtzucker aufstreuen", "Zucker oder Zimtzucker auf den Kuchen streuen."],
      ["Kuchen fertig backen", "Den Kuchen auf der unteren Schiene weiterbacken, bis insgesamt 50 bis 55 Minuten Backzeit erreicht sind."],
    ].map(([label, action], index) => ({ id: `p${index + 1}`, type: "process" as const, label: label!, action: action!, ...([1, 8, 11].includes(index) ? { temperature: "200 °C Ober-/Unterhitze", duration: index === 8 ? "45 Minuten" : null } : {}) })),
    { id: "s1", type: "intermediate", label: "Fertig gebackener Apfelkuchen" },
  ],
  edges: [{ from: "i4", to: "p9", type: "used_in" }, { from: "p2", to: "p9", type: "before" }, { from: "p9", to: "p12", type: "before" }, { from: "p12", to: "s1", type: "produces" }],
};

export const appleCakeMotifs: Record<string, string> = {
  i3: "ingredients/sugar", i4: "ingredients/egg", i6: "ingredients/flour", i7: "ingredients/apple", i8: "ingredients/butter",
  p2: "processes/oven", p9: "processes/oven", p12: "processes/oven",
};
