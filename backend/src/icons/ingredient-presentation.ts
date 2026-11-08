import puppeteer from "puppeteer";
import { createHash } from "node:crypto";
import type { IngredientDescriptor } from "./ingredient-semantics";
import type { Motif } from "./motif";
import type { IconLibrary } from "./library";
import { DisplayIconCache, DISPLAY_CACHE_VERSION } from "./icon-display-cache";
import type { DisplayIcon } from "./icon-display";
import { validatePng } from "./png";

export function presentationPlan(descriptor: IngredientDescriptor): { motifs: Motif[]; badge?: number; fallback?: Motif; alternative?: boolean } {
  const eggDescriptions = { raw: "whole raw chicken egg with intact shell; not cracked, cut, boiled or fried", boiled: "boiled chicken egg, peeled and halved, firm cooked white and yolk; not raw or fried", fried: "fried chicken egg, sunny-side-up with set white and visible yolk; not raw or boiled" };
  if (descriptor.concepts.includes("egg") && !descriptor.state) return { motifs: [] };
  const motifs = [...descriptor.concepts].sort().map(concept => concept === "egg" && descriptor.state
    ? { key: `ingredients/egg-${descriptor.state}`, concept: eggDescriptions[descriptor.state] }
    : { key: `ingredients/${concept}`, concept });
  if (descriptor.kind === "alternative") return { motifs, alternative: true };
  const count = descriptor.quantity;
  if (descriptor.concepts[0] !== "egg" || descriptor.unit !== "piece" || !Number.isSafeInteger(count) || count! <= 0 || count === 1) return { motifs };
  if (count! > 5) return { motifs, badge: count };
  return { motifs: [{ key: `ingredients/egg-${descriptor.state}-count-${count}`, concept: `exactly ${count} clearly separated and countable eggs; each a ${eggDescriptions[descriptor.state!]}` }], fallback: motifs[0], badge: count };
}

/** Generated originals stay unchanged; typography and layout are produced offline. */
async function composeDisplay(inputs: Buffer[], badge?: number, alternative = false): Promise<DisplayIcon> {
  inputs.forEach(validatePng);
  const browser = await puppeteer.launch({ headless: true, timeout: 30000 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const page = await browser.newPage(); await page.setOfflineMode(true);
        await page.setRequestInterception(true);
        page.on("request", request => { if (request.url().startsWith("data:image/png;base64,")) void request.continue(); else void request.abort(); });
        const result = await page.evaluate(async ({ uris, count, isAlternative }) => {
          const images = await Promise.all(uris.map(async uri => { const image = new Image(); image.src = uri; await image.decode(); return image; }));
          for (const edge of [96, 64, 48]) {
            const canvas = document.createElement("canvas"); canvas.width = edge; canvas.height = edge;
            const ctx = canvas.getContext("2d")!;
            const draw = (image: HTMLImageElement, x: number, y: number, w: number, h: number) => {
              const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
              const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
              ctx.drawImage(image, x + (w - width) / 2, y + (h - height) / 2, width, height);
            };
            if (isAlternative) {
              draw(images[0]!, 0, 0, edge * 0.46, edge * 0.68);
              draw(images[1]!, edge * 0.54, 0, edge * 0.46, edge * 0.68);
              ctx.fillStyle = "#ffffff"; ctx.fillRect(0, edge * 0.70, edge, edge * 0.30);
              ctx.fillStyle = "#18212b"; ctx.font = `bold ${Math.round(edge * 0.25)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillText("oder", edge / 2, edge * 0.85);
            } else {
              draw(images[0]!, 0, 0, edge, edge);
              if (count !== undefined) {
                const text = String(count), font = Math.min(edge * 0.36, edge * 0.88 / (text.length * 0.65));
                ctx.font = `bold ${Math.floor(font)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                const width = Math.min(edge, Math.max(edge * 0.42, ctx.measureText(text).width + edge * 0.12)), height = Math.max(edge * 0.30, font * 1.15);
                ctx.fillStyle = "#18212b"; ctx.fillRect(edge - width, edge - height, width, height);
                ctx.fillStyle = "#ffffff"; ctx.fillText(text, edge - width / 2, edge - height / 2);
              }
            }
            const dataUri = canvas.toDataURL("image/png"), base64 = dataUri.split(",")[1]!;
            if (base64.length * 3 / 4 <= 8192) return { dataUri, width: edge, height: edge };
          }
          throw Error("Composition exceeds display limits.");
        }, { uris: inputs.map(bytes => `data:image/png;base64,${bytes.toString("base64")}`), count: badge, isAlternative: alternative });
        return { ...result, bytes: Buffer.from(result.dataUri.split(",")[1]!, "base64") };
      })(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error("Composition timeout.")), 30000); }),
    ]);
  } finally { if (timer) clearTimeout(timer); await browser.close(); }
}

export async function acquireIngredientDisplay(descriptor: IngredientDescriptor, library: IconLibrary, cache: DisplayIconCache, recipe: string, derivativeDirectory?: string): Promise<DisplayIcon | undefined> {
  const plan = presentationPlan(descriptor);
  if (!plan.motifs.length) return undefined;
  let inputs = await Promise.all(plan.motifs.map(motif => library.acquire(motif, recipe)));
  let badge = plan.fallback ? undefined : plan.badge;
  if (!inputs[0] && plan.fallback) { inputs = [await library.acquire(plan.fallback, recipe)]; badge = plan.badge; }
  if (inputs.some(input => !input)) return undefined;
  const bytes = inputs as Buffer[];
  if (!plan.alternative && badge === undefined) return cache.acquire(bytes[0]!);
  const version = JSON.stringify([DISPLAY_CACHE_VERSION, "ingredient-layout-v2-state", descriptor.state ?? null, plan.motifs.map(motif => motif.key), plan.alternative ?? false, badge ?? null, bytes.map(input => createHash("sha256").update(input).digest("hex"))]);
  const resize = () => composeDisplay(bytes, badge, plan.alternative);
  // A disposable cache is optional for direct callers; production supplies its normalized path.
  return derivativeDirectory ? new DisplayIconCache(derivativeDirectory, { version, resize }).acquire(bytes[0]!) : resize();
}
