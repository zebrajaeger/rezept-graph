import puppeteer from "puppeteer";
import { validatePng } from "./png";

export interface DisplayIcon { bytes: Buffer; dataUri: string; width: number; height: number }
export const MERMAID_SOURCE_BUDGET = 48000;

/** Derivatives never mutate the source buffer or its persisted original. */
export async function createDisplayIcon(input: Buffer): Promise<DisplayIcon> {
  validatePng(input);
  if (input.length < 33 || input.length > 4 * 1024 * 1024 || input.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || input.readUInt32BE(8) !== 13 || input.toString("ascii", 12, 16) !== "IHDR") throw new Error("Invalid bounded PNG input.");
  const width = input.readUInt32BE(16), height = input.readUInt32BE(20);
  if (!width || !height || width > 4096 || height > 4096 || width * height > 16777216) throw new Error("PNG dimensions exceed display limits.");
  const browser = await puppeteer.launch({ headless: true, timeout: 30000 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const page = await browser.newPage();
        await page.setOfflineMode(true);
        await page.setRequestInterception(true);
        page.on("request", request => { if (request.url().startsWith("data:image/png;base64,")) void request.continue(); else void request.abort(); });
        const result = await page.evaluate(async ({ uri, expectedWidth, expectedHeight }) => {
          const image = new Image(); image.src = uri; await image.decode();
          if (image.naturalWidth !== expectedWidth || image.naturalHeight !== expectedHeight) throw new Error("PNG dimension mismatch.");
          for (const edge of [96, 64, 48]) {
            const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Missing display context.");
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL("image/png");
            const base64 = dataUri.slice("data:image/png;base64,".length);
            const byteLength = base64.length * 3 / 4 - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
            if (byteLength <= 8192) return { dataUri, width: canvas.width, height: canvas.height };
          }
          throw new Error("PNG display derivative exceeds byte limit.");
        }, { uri: `data:image/png;base64,${input.toString("base64")}`, expectedWidth: width, expectedHeight: height });
        return { ...result, bytes: Buffer.from(result.dataUri.split(",")[1]!, "base64") };
      })(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("PNG display timeout.")), 30000); }),
    ]);
  } catch { throw new Error("PNG display decoding or resizing failed."); }
  finally { if (timer) clearTimeout(timer); await browser.close(); }
}

export function selectBudgetedIcons<T>(candidates: readonly T[], key: (candidate: T) => string, serialize: (selected: ReadonlyMap<string, T>) => string): ReadonlyMap<string, T> {
  const selected = new Map<string, T>();
  if (serialize(selected).length > MERMAID_SOURCE_BUDGET) throw new Error("Mermaid source exceeds the source budget before icons.");
  for (const candidate of candidates) {
    const id = key(candidate);
    if (selected.has(id)) continue;
    selected.set(id, candidate);
    if (serialize(selected).length > MERMAID_SOURCE_BUDGET) selected.delete(id);
  }
  return selected;
}
