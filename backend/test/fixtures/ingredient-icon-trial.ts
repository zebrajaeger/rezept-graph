import puppeteer from "puppeteer";
import type { RecipeAnalysis } from "../../src/recipe/recipe-types";

export const trialRecipe: RecipeAnalysis = {
  metadata: { title: "Ingredient icon layout trial" },
  // Deliberately unrelated IDs/quantity: node labels, not guessed associations, supply evidence.
  ingredients: [{ id: "eggs3", name: "Eier", quantity: 99, unit: "Stück", originalText: "99 Eier" }],
  nodes: [
    { id: "butter", type: "ingredient", label: "250 g Butter" },
    { id: "margarine", type: "ingredient", label: "weiche Margarine" },
    { id: "choice", type: "ingredient", label: "Butter oder Margarine" },
    { id: "eggs3", type: "ingredient", label: "3 Eier, Größe M" },
    { id: "eggs6", type: "ingredient", label: "6 Eier" },
  ], edges: [], ingredientList: [],
};

/** Clearly labeled local drawing fixtures, not claims about provider output quality. */
export async function createTrialFixtures(): Promise<Map<string, Buffer>> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage(); await page.setOfflineMode(true);
    const entries = await page.evaluate(() => {
      const make = (kind: string, count = 1) => {
        const canvas = document.createElement("canvas"); canvas.width = 192; canvas.height = 192;
        const ctx = canvas.getContext("2d")!; ctx.lineWidth = 5; ctx.strokeStyle = "#59452c";
        if (kind === "egg") {
          const centers = count === 1 ? [[96, 96]] : [[57, 105], [98, 66], [139, 105]];
          for (const [x, y] of centers) { ctx.fillStyle = "#f3d6a4"; ctx.beginPath(); ctx.ellipse(x!, y!, count === 1 ? 48 : 28, count === 1 ? 65 : 40, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        } else if (kind === "butter") {
          ctx.fillStyle = "#f8d34f"; ctx.fillRect(24, 67, 144, 74); ctx.strokeRect(24, 67, 144, 74);
          ctx.beginPath(); ctx.moveTo(24, 67); ctx.lineTo(55, 43); ctx.lineTo(168, 43); ctx.lineTo(168, 141); ctx.stroke();
          ctx.fillStyle = "#ffe889"; ctx.fillRect(55, 45, 110, 20);
        } else {
          ctx.fillStyle = "#eaf0df"; ctx.beginPath(); ctx.moveTo(27, 65); ctx.lineTo(43, 151); ctx.lineTo(148, 151); ctx.lineTo(165, 65); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#edd154"; ctx.beginPath(); ctx.ellipse(96, 65, 69, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#6a9d5b"; ctx.fillRect(48, 104, 96, 21);
        }
        return canvas.toDataURL("image/png").split(",")[1]!;
      };
      return [["ingredients/butter", make("butter")], ["ingredients/margarine", make("margarine")], ["ingredients/egg-raw", make("egg")], ["ingredients/egg-raw-count-3", make("egg", 3)]];
    });
    return new Map(entries.map(([key, base64]) => [key!, Buffer.from(base64!, "base64")]));
  } finally { await browser.close(); }
}
