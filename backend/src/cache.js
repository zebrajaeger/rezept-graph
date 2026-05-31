const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { CliError } = require("./errors");

function createCacheKey(url) {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 24);
}

function getCachePaths(cacheDir, url) {
  const key = createCacheKey(url);
  return {
    key,
    htmlPath: path.join(cacheDir, `${key}.html`),
    metadataPath: path.join(cacheDir, `${key}.metadata.json`),
  };
}

function hasCacheEntry(cacheDir, url) {
  const paths = getCachePaths(cacheDir, url);
  return fs.existsSync(paths.htmlPath) && fs.existsSync(paths.metadataPath);
}

function readCacheEntry(cacheDir, url) {
  const paths = getCachePaths(cacheDir, url);
  if (!hasCacheEntry(cacheDir, url)) {
    throw new CliError(`URL fehlt im Cache: ${url}`);
  }

  return {
    url,
    html: fs.readFileSync(paths.htmlPath, "utf8"),
    metadata: JSON.parse(fs.readFileSync(paths.metadataPath, "utf8")),
    cacheKey: paths.key,
    fromCache: true,
  };
}

function writeCacheEntry(cacheDir, entry) {
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

async function getRecipePage({ url, cacheDir, cacheMode, fetcher }) {
  if (cacheMode === "cache-first" && hasCacheEntry(cacheDir, url)) {
    return readCacheEntry(cacheDir, url);
  }

  if (cacheMode === "offline") {
    return readCacheEntry(cacheDir, url);
  }

  const fetched = await fetcher(url);
  return writeCacheEntry(cacheDir, fetched);
}

module.exports = {
  createCacheKey,
  getCachePaths,
  getRecipePage,
  hasCacheEntry,
  readCacheEntry,
  writeCacheEntry,
};
