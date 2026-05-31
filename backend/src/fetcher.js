const { CliError } = require("./errors");

async function fetchRecipeHtml(url, options = {}) {
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
    if (error.name === "AbortError") {
      throw new CliError(`Abruf fuer ${url} wurde nach ${timeoutMs}ms abgebrochen.`);
    }
    throw new CliError(`Abruf fehlgeschlagen fuer ${url}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function getHeader(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] || headers[name.toLowerCase()] || null;
}

module.exports = {
  fetchRecipeHtml,
};
