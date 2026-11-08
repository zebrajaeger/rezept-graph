import { discoverChefkochUrls } from "../discovery/chefkoch-seeder";
import { appendUniqueUrls } from "../ingestion/url-file";
import type { PageFetcher } from "../http-types";

export async function seedChefkochUrls({ urlsPath, limit, fetcher = fetch }: {
  urlsPath: string; limit: number; fetcher?: PageFetcher;
}, deps = { discoverChefkochUrls, appendUniqueUrls }) {
  const candidates = await deps.discoverChefkochUrls({ limit, fetcher });
  const result = deps.appendUniqueUrls(urlsPath, candidates.urls);
  return { ...result, discovered: candidates.urls.length, sourceUrl: candidates.sourceUrl };
}
