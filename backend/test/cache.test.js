const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  createCacheKey,
  getRecipePage,
  hasCacheEntry,
  writeCacheEntry,
} = require("../src/cache");

function tmpCacheDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-cache-"));
}

test("createCacheKey is deterministic for the same URL", () => {
  assert.equal(createCacheKey("https://example.test/a"), createCacheKey("https://example.test/a"));
  assert.notEqual(
    createCacheKey("https://example.test/a"),
    createCacheKey("https://example.test/b")
  );
});

test("cache-first uses cached HTML without fetching", async () => {
  const cacheDir = tmpCacheDir();
  const url = "https://example.test/recipe";
  writeCacheEntry(cacheDir, {
    url,
    html: "<html>cached</html>",
    fetchedAt: "2026-05-31T00:00:00.000Z",
    status: 200,
    contentType: "text/html",
  });

  const page = await getRecipePage({
    url,
    cacheDir,
    cacheMode: "cache-first",
    fetcher: async () => {
      throw new Error("fetcher must not be called");
    },
  });

  assert.equal(page.html, "<html>cached</html>");
  assert.equal(page.fromCache, true);
});

test("cache-first fetches and writes missing HTML", async () => {
  const cacheDir = tmpCacheDir();
  const url = "https://example.test/recipe";

  const page = await getRecipePage({
    url,
    cacheDir,
    cacheMode: "cache-first",
    fetcher: async () => ({
      url,
      html: "<html>fresh</html>",
      fetchedAt: "2026-05-31T00:00:00.000Z",
      status: 200,
      contentType: "text/html",
    }),
  });

  assert.equal(page.html, "<html>fresh</html>");
  assert.equal(page.fromCache, false);
  assert.equal(hasCacheEntry(cacheDir, url), true);
});

test("refresh fetches even when cached HTML exists", async () => {
  const cacheDir = tmpCacheDir();
  const url = "https://example.test/recipe";
  writeCacheEntry(cacheDir, {
    url,
    html: "<html>old</html>",
    fetchedAt: "2026-05-31T00:00:00.000Z",
    status: 200,
    contentType: "text/html",
  });

  const page = await getRecipePage({
    url,
    cacheDir,
    cacheMode: "refresh",
    fetcher: async () => ({
      url,
      html: "<html>new</html>",
      fetchedAt: "2026-05-31T00:00:01.000Z",
      status: 200,
      contentType: "text/html",
    }),
  });

  assert.equal(page.html, "<html>new</html>");
});

test("offline mode does not fetch missing HTML", async () => {
  const cacheDir = tmpCacheDir();
  await assert.rejects(
    getRecipePage({
      url: "https://example.test/missing",
      cacheDir,
      cacheMode: "offline",
      fetcher: async () => {
        throw new Error("fetcher must not be called");
      },
    }),
    /URL fehlt im Cache/
  );
});
