import fs from "node:fs";
import puppeteer from "puppeteer";
import type { GraphImagePaths } from "./image-renderer";

/** Preserve Mermaid's native shapes and edge layout; embed only validated data images. */
export async function embedInlineIcons(paths: GraphImagePaths): Promise<void> {
  const source = fs.readFileSync(paths.mermaidPath, "utf8");
  const icons = [...source.matchAll(/^\s*%% inline-icon ([A-Za-z0-9_]+) (\d+) (\d+) (data:image\/png;base64,[A-Za-z0-9+/]+=*)\r?\n\s*[^\n]*?"ICONSPACE ([^"\r\n]*)"/gm)].map(m => ({ id: m[1]!, width: Number(m[2]), height: Number(m[3]), uri: m[4]!, label: m[5]!.replace(/\\nICONHEIGHT/g, "") }));
  const browser = await puppeteer.launch({ headless: true, timeout: 30000 });
  try {
    const page = await browser.newPage(); await page.setOfflineMode(true);
    await page.setContent(fs.readFileSync(paths.svgPath, "utf8"));
    const svg = await page.evaluate(items => {
      for (const item of items) {
        const node = Array.from(document.querySelectorAll<SVGGElement>("g.node")).find(n => n.id.includes(`-flowchart-${item.id}-`));
        const label = node?.querySelector<SVGGElement>("g.label");
        if (!node || !label || !item.width || !item.height) throw Error("Inline icon node missing.");
        const shape = node.querySelector<SVGGraphicsElement>(".label-container")!;
        const bounds = shape.getBBox();
        label.replaceChildren();
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.style.textAnchor = "start"; label.appendChild(text);
        const lines: string[] = [];
        const available = Math.max(40, bounds.width - 105);
        for (const paragraph of item.label.split("\\n")) {
          let line = "";
          for (const word of paragraph.split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            text.textContent = candidate;
            if (line && text.getComputedTextLength() > available) { lines.push(line); line = word; } else line = candidate;
          }
          lines.push(line);
        }
        text.textContent = "";
        lines.forEach((line, index) => {
          const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          span.setAttribute("x", "0"); span.setAttribute("y", String(index * 18)); span.textContent = line; text.appendChild(span);
        });
        label.setAttribute("transform", `translate(${bounds.x + 80},${5 - (lines.length - 1) * 9})`);
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("href", item.uri); image.setAttribute("x", String(bounds.x + 20));
        image.setAttribute("y", "-20"); image.setAttribute("width", "48"); image.setAttribute("height", "40");
        image.setAttribute("preserveAspectRatio", "xMidYMid meet"); node.insertBefore(image, label);
      }
      return document.querySelector("svg")!.outerHTML;
    }, icons);
    fs.writeFileSync(paths.svgPath, svg);
    const png = await page.evaluate(async markup => {
      const match = /viewBox="([^"]+)"/.exec(markup)!; const box = match[1]!.split(/\s+/).map(Number);
      const sized = markup.replace('width="100%"', `width="${box[2]}" height="${box[3]}"`);
      const image = new Image(); image.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(sized))); await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = Math.ceil(box[2]!); canvas.height = Math.ceil(box[3]!);
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png").split(",")[1]!;
    }, svg);
    fs.writeFileSync(paths.pngPath, Buffer.from(png, "base64"));
  } finally { await browser.close(); }
}
