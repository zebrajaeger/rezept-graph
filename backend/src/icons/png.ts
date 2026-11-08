import { inflateSync } from "node:zlib";

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
/** Accept bounded noninterlaced PNGs; reject unsupported encodings rather than partially validating. */
export function validatePng(bytes: Buffer): { width: number; height: number; mime: "image/png" } {
  const fail = (): never => { throw new Error("Invalid or unsupported bounded PNG."); };
  if (bytes.length < 45 || bytes.length > 4194304 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") fail();
  let offset = 8, width = 0, height = 0, channels = 0, depth = 0, ended = false, seenData = false;
  const data: Buffer[] = [];
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset);
    if (size > bytes.length - offset - 12) fail();
    const type = bytes.toString("ascii", offset + 4, offset + 8), content = bytes.subarray(offset + 8, offset + 8 + size);
    if (crc32(bytes.subarray(offset + 4, offset + 8 + size)) !== bytes.readUInt32BE(offset + 8 + size)) fail();
    if (!width && type !== "IHDR") fail();
    if (type === "IHDR") {
      if (width || size !== 13) fail();
      width = content.readUInt32BE(0); height = content.readUInt32BE(4); depth = content[8]!;
      channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[content[9]!] || 0;
      if (!width || !height || width > 4096 || height > 4096 || !channels || ![8, 16].includes(depth) || content[10] || content[11] || content[12]) fail();
    } else if (type === "IDAT") { seenData = true; data.push(content); }
    else if (type === "IEND") { if (size || !seenData) fail(); ended = true; offset += 12; break; }
    else if (type !== "PLTE" && /^[A-Z]/.test(type)) fail();
    offset += size + 12;
  }
  if (!ended || offset !== bytes.length) fail();
  const stride = width * channels * depth / 8 + 1;
  let decoded: Buffer;
  try { decoded = inflateSync(Buffer.concat(data), { maxOutputLength: stride * height }); } catch { return fail(); }
  if (decoded.length !== stride * height) fail();
  for (let y = 0; y < height; y++) if (decoded[y * stride]! > 4) fail();
  return { width, height, mime: "image/png" };
}
