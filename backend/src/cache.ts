import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { CliError } from "./errors";
import type { CacheMode } from "./config";

export interface PageEntry {
  url: string; html: string; finalUrl?: string; fetchedAt: string;
  status: number; contentType?: string | null;
}

export function createCacheKey(url: string) {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 24);
}

export function getCachePaths(cacheDir: string, url: string) {
  const key = createCacheKey(url);
  return {
    key,
    htmlPath: path.join(cacheDir, `${key}.html`),
    metadataPath: path.join(cacheDir, `${key}.metadata.json`),
  };
}

export function hasCacheEntry(cacheDir: string, url: string) {
  const paths = getCachePaths(cacheDir, url);
  return fs.existsSync(paths.htmlPath) && fs.existsSync(paths.metadataPath);
}

export function readCacheEntry(cacheDir: string, url: string) {
  const paths = getCachePaths(cacheDir, url);
  if (!hasCacheEntry(cacheDir, url)) {
    throw new CliError(`URL fehlt im Cache: ${url}`);
  }

  return {
    url,
    html: fs.readFileSync(paths.htmlPath, "utf8"),
    metadata: JSON.parse(fs.readFileSync(paths.metadataPath, "utf8")) as unknown,
    cacheKey: paths.key,
    fromCache: true,
  };
}

export function writeCacheEntry(cacheDir: string, entry: PageEntry) {
  const paths = getCachePaths(cacheDir, entry.url);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(paths.htmlPath, entry.html);
  fs.writeFileSync(
    paths.metadataPath,
    `${JSON.stringify(
      {
        originalUrl: entry.url,
        finalUrl: entry.finalUrl || entry.url,
        fetchedAt: entry.fetchedAt,
        status: entry.status,
        contentType: entry.contentType || null,
      },
      null,
      2
    )}\n`
  );

  return {
    ...entry,
    cacheKey: paths.key,
    fromCache: false,
  };
}

export async function getRecipePage({ url, cacheDir, cacheMode, fetcher }: {
  url: string; cacheDir: string; cacheMode: CacheMode;
  fetcher: (url: string) => Promise<PageEntry>;
}) {
  if (cacheMode === "cache-first" && hasCacheEntry(cacheDir, url)) {
    return readCacheEntry(cacheDir, url);
  }

  if (cacheMode === "offline") {
    return readCacheEntry(cacheDir, url);
  }

  const fetched = await fetcher(url);
  return writeCacheEntry(cacheDir, fetched);
}
