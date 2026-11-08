import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isRecord } from "../unknown-data";
import { CliError } from "../errors";

export function createLlmCacheKey(parts: unknown) {
  return crypto.createHash("sha256").update(stableStringify(parts)).digest("hex").slice(0, 32);
}

export async function getOrCreateLlmResponse({ cacheDir, cacheKeyParts, createResponse }: {
  cacheDir: string; cacheKeyParts: unknown; createResponse: () => Promise<string>;
}) {
  const key = createLlmCacheKey(cacheKeyParts);
  const filePath = path.join(cacheDir, `${key}.json`);

  if (fs.existsSync(filePath)) {
    const cached: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!isRecord(cached) || typeof cached.content !== "string") {
      throw new CliError("LLM-Antwortcache enthaelt keinen Textinhalt.");
    }
    return {
      content: cached.content,
      cacheKey: key,
      fromCache: true,
    };
  }

  const content = await createResponse();
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        content,
      },
      null,
      2
    )}\n`
  );

  return {
    content,
    cacheKey: key,
    fromCache: false,
  };
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}
