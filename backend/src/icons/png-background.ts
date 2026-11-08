import { inflateSync } from "node:zlib";
import { validatePng } from "./png";

/** Inspect effective alpha independently of legacy bundle acceptance. */
export function hasTransparentBackground(bytes: Buffer): boolean {
  const { width, height } = validatePng(bytes);
  const depth = bytes[24]!, color = bytes[25]!;
  const channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[color]!;
  const sampleBytes = depth / 8, bpp = channels * sampleBytes, stride = width * bpp;
  const compressed: Buffer[] = [];
  let transparency: Buffer | undefined, seenData = false;
  for (let offset = 8; offset < bytes.length;) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString("ascii", offset + 4, offset + 8);
    const content = bytes.subarray(offset + 8, offset + 8 + size);
    if (type === "tRNS") {
      if (transparency || seenData || ![0, 2].includes(color) || size !== (color === 0 ? 2 : 6)) throw Error("Invalid PNG transparency encoding.");
      transparency = content;
      if (depth === 8) for (let i = 0; i < size; i += 2) if (content.readUInt16BE(i) > 255) throw Error("Invalid PNG transparency sample.");
    }
    if (type === "IDAT") { seenData = true; compressed.push(content); }
    offset += size + 12;
  }
  if (color !== 4 && color !== 6 && !transparency) return false;
  // Maximum supported raw stream: 4096x4096 RGBA16 plus scanline prefixes.
  const raw = inflateSync(Buffer.concat(compressed), { maxOutputLength: (stride + 1) * height });
  let previous = Buffer.alloc(stride), current = Buffer.alloc(stride);
  let transparent = 0, visible = 0, borderTransparent = true;
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1), filter = raw[start]!;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? current[i - bpp]! : 0, b = previous[i]!, c = i >= bpp ? previous[i - bpp]! : 0;
      let predictor = 0;
      if (filter === 1) predictor = a;
      else if (filter === 2) predictor = b;
      else if (filter === 3) predictor = Math.floor((a + b) / 2);
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      current[i] = (raw[start + 1 + i]! + predictor) & 255;
    }
    for (let x = 0; x < width; x++) {
      let alpha = depth === 16 ? 65535 : 255;
      if (color === 4 || color === 6) {
        const index = x * bpp + (channels - 1) * sampleBytes;
        alpha = depth === 16 ? current.readUInt16BE(index) : current[index]!;
      } else if (transparency) {
        let matches = true;
        for (let c = 0; c < channels; c++) {
          const index = x * bpp + c * sampleBytes;
          if ((depth === 16 ? current.readUInt16BE(index) : current[index]!) !== transparency.readUInt16BE(c * 2)) matches = false;
        }
        if (matches) alpha = 0;
      }
      if (alpha === 0) transparent++; else {
        visible++;
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) borderTransparent = false;
      }
    }
    [previous, current] = [current, previous];
  }
  const minimum = Math.ceil(width * height / 100);
  return borderTransparent && transparent >= minimum && visible >= minimum;
}
