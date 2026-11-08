import { appendUniqueUrls } from "./url-file";
import { CliError } from "./errors";
import type { PageFetcher } from "./http-types";

const CHEFKOCH_RANDOM_URL = "https://www.chefkoch.de/rs/s0/zufall/Rezepte.html";
const MIN_RATING = 4;
const MIN_RATING_COUNT = 10;

export async function seedChefkochUrls({ urlsPath, limit, fetcher = fetch }: {
  urlsPath: string; limit: number; fetcher?: PageFetcher;
}) {
  const response = await fetcher(CHEFKOCH_RANDOM_URL, {
    headers: {
      "user-agent": "rezept-graph-cli/1.0 (+development recipe URL seeding)",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response || !response.ok) {
    const status = response ? `HTTP ${response.status}` : "keine Antwort";
    throw new CliError(`Chefkoch-Zufallsrezepte konnten nicht geladen werden: ${status}`);
  }

  const html = await response.text();
  const accepted = parseChefkochRecipes(html)
    .filter((recipe) => recipe.rating > MIN_RATING && recipe.ratingCount > MIN_RATING_COUNT)
    .slice(0, limit)
    .map((recipe) => recipe.url);

  const result = appendUniqueUrls(urlsPath, accepted);
  return {
    ...result,
    discovered: accepted.length,
    sourceUrl: CHEFKOCH_RANDOM_URL,
  };
}

export function parseChefkochRecipes(html: string) {
  const links = findRecipeLinks(html);
  return links
    .map((entry) => {
      const nearbyHtml = extractCandidateHtml(html, entry.index);
      return {
        url: entry.url,
        rating: parseRating(nearbyHtml),
        ratingCount: parseRatingCount(nearbyHtml),
      };
    })
    .filter((recipe) => Number.isFinite(recipe.rating) && Number.isFinite(recipe.ratingCount));
}

function extractCandidateHtml(html: string, linkIndex: number) {
  const articleStart = html.lastIndexOf("<article", linkIndex);
  const articleEnd = html.indexOf("</article>", linkIndex);
  if (articleStart !== -1 && articleEnd !== -1) {
    return html.slice(articleStart, articleEnd + "</article>".length);
  }

  const nextLink = html.slice(linkIndex + 1).search(/href=["'][^"']*\/rezepte\//i);
  const windowEnd =
    nextLink === -1 ? Math.min(html.length, linkIndex + 1200) : linkIndex + 1 + nextLink;
  return html.slice(linkIndex, windowEnd);
}

export function findRecipeLinks(html: string) {
  const links = [];
  const seen = new Set();
  const pattern = /href=["']([^"']*\/rezepte\/[^"']+\.html(?:\?[^"']*)?)["']/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const url = normalizeChefkochUrl(match[1] ?? "");
    if (!url || seen.has(url)) continue;
    seen.add(url);
    links.push({ url, index: match.index });
  }
  return links;
}

function normalizeChefkochUrl(rawUrl: string) {
  let withoutQuery = rawUrl.split("?")[0] ?? "";
  if (withoutQuery.startsWith("//")) {
    withoutQuery = `https:${withoutQuery}`;
  }
  if (withoutQuery.startsWith("/")) {
    withoutQuery = `https://www.chefkoch.de${withoutQuery}`;
  }
  if (!withoutQuery.startsWith("https://www.chefkoch.de/rezepte/")) {
    return null;
  }
  return decodeHtmlEntities(withoutQuery);
}

function parseRating(html: string) {
  const patterns = [
    /"ratingValue"\s*:\s*"?([0-5](?:[,.]\d+)?)"?/i,
    /data-rating-value=["']([0-5](?:[,.]\d+)?)["']/i,
    /([0-5](?:[,.]\d+)?)\s*(?:\/\s*5|von\s+5|Sterne?)/i,
  ];
  return parseFirstNumber(html, patterns);
}

function parseRatingCount(html: string) {
  const patterns = [
    /"ratingCount"\s*:\s*"?([0-9][0-9.]*)"?/i,
    /"reviewCount"\s*:\s*"?([0-9][0-9.]*)"?/i,
    /data-rating-count=["']([0-9][0-9.]*)["']/i,
    /([0-9][0-9.]*)\s+Bewertungen?/i,
  ];
  return parseFirstNumber(html, patterns);
}

function parseFirstNumber(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1] !== undefined) {
      return parseGermanNumber(match[1]);
    }
  }
  return Number.NaN;
}

function parseGermanNumber(rawValue: string) {
  const normalized = rawValue.replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(normalized);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export { CHEFKOCH_RANDOM_URL, MIN_RATING, MIN_RATING_COUNT };
