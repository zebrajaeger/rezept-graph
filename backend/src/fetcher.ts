import { CliError } from "./errors";
import { errorMessage, isAbortError } from "./unknown-data";
import type { PageFetcher, PageResponse } from "./http-types";

export async function fetchRecipeHtml(url: string, options: { fetcher?: PageFetcher; timeoutMs?: number } = {}) {
  const fetcher = options.fetcher || fetch;
  const timeoutMs = options.timeoutMs || 30000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "rezept-graph-cli/1.0 (+development recipe analysis)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new CliError(`Abruf fehlgeschlagen fuer ${url}: HTTP ${response.status}`);
    }

    const contentType = getHeader(response.headers, "content-type");
    if (contentType && !contentType.toLowerCase().includes("html")) {
      throw new CliError(`Abruf fuer ${url} lieferte kein HTML: ${contentType}`);
    }

    return {
      url,
      finalUrl: response.url || url,
      html: await response.text(),
      fetchedAt: new Date().toISOString(),
      status: response.status,
      contentType,
    };
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new CliError(`Abruf fuer ${url} wurde nach ${timeoutMs}ms abgebrochen.`);
    }
    throw new CliError(`Abruf fehlgeschlagen fuer ${url}: ${errorMessage(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}

function getHeader(headers: PageResponse["headers"], name: string): string | null {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  if ("get" in headers) return null;
  return headers[name] || headers[name.toLowerCase()] || null;
}
