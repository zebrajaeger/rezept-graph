import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { iconFixture } from "./transparent-icon";

/** Explicit offline documentation helper; never contacts an image provider. */
async function main(): Promise<void> {
  const directory = path.resolve(process.argv[2] || "../docs/images/icon-transparency");
  fs.mkdirSync(directory, { recursive: true });
  const transparent = iconFixture({ size: 200 }), opaque = iconFixture({ size: 200, alpha: () => 255 });
  const uri = (bytes: Buffer) => `data:image/png;base64,${bytes.toString("base64")}`;
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage(); await page.setOfflineMode(true); await page.setViewport({ width: 820, height: 430 });
    await page.setContent(`<style>body{font:18px sans-serif;background:#f4f4f4;color:#18212b;margin:24px}main{display:flex;gap:18px}.card{padding:12px;width:218px;border:1px solid #999}.green{background:#e6f4ea}.dark{background:#25354b;color:white}img{width:180px;height:180px;image-rendering:auto}small{display:block;margin-top:14px}</style><h2>Offline alpha proof / Offline-Transparenznachweis</h2><main><div class="card green">Transparent / transparent<img src="${uri(transparent)}"></div><div class="card dark">Transparent / transparent<img src="${uri(transparent)}"></div><div class="card green">Opaque: rejected / abgelehnt<img src="${uri(opaque)}"></div></main><small>Deterministic white fixture, not generated artwork. / Weiße Testgrafik, kein KI-Bild.</small>`);
    await page.evaluate(async () => { await Promise.all(Array.from(document.images).map(image => image.decode())); });
    await page.screenshot({ path: path.join(directory, "contact-sheet.png") });
  } finally { await browser.close(); }
}

void main();
