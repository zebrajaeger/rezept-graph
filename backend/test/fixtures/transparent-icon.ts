import { deflateSync } from "node:zlib";

export function pngChunk(type: string, data: Buffer): Buffer {
  const bytes = Buffer.alloc(data.length + 12);
  bytes.writeUInt32BE(data.length); bytes.write(type, 4); data.copy(bytes, 8);
  let crc = 0xffffffff;
  for (const byte of bytes.subarray(4, -4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0);
  }
  bytes.writeUInt32BE((crc ^ 0xffffffff) >>> 0, bytes.length - 4);
  return bytes;
}

/** Deterministic white foreground with transparent margins; no provider calls. */
export function iconFixture(options: { depth?: number; color?: number; filter?: number; size?: number; red?: boolean; alpha?: (x: number, y: number) => number } = {}): Buffer {
  const { depth = 8, color = 6, filter = 0, size = 10 } = options;
  const channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[color]!;
  const bpp = channels * depth / 8, stride = size * bpp;
  const rows: Buffer[] = []; let previous = Buffer.alloc(stride);
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(stride);
    for (let x = 0; x < size; x++) for (let c = 0; c < channels; c++) {
      const alpha = options.alpha?.(x, y) ?? (x >= size / 4 && x < size * 3 / 4 && y >= size / 4 && y < size * 3 / 4 ? 255 : 0);
      const value = (color === 4 || color === 6) && c === channels - 1 ? alpha : options.red && color === 6 && c > 0 ? 0 : 255;
      if (depth === 16) row.writeUInt16BE(value * 257, x * bpp + c * 2); else row[x * bpp + c] = value;
    }
    const encoded = Buffer.alloc(stride + 1); encoded[0] = filter;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp]! : 0, b = previous[i]!, c = i >= bpp ? previous[i - bpp]! : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predictor = [0, a, b, Math.floor((a + b) / 2), pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter]!;
      encoded[i + 1] = (row[i]! - predictor) & 255;
    }
    rows.push(encoded); previous = row;
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = depth; header[9] = color;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), pngChunk("IHDR", header), pngChunk("IDAT", deflateSync(Buffer.concat(rows))), pngChunk("IEND", Buffer.alloc(0))]);
}

export const transparentPng = iconFixture({ red: true });
