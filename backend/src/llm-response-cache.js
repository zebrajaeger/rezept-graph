const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function createLlmCacheKey(parts) {
  return crypto.createHash("sha256").update(stableStringify(parts)).digest("hex").slice(0, 32);
}

async function getOrCreateLlmResponse({ cacheDir, cacheKeyParts, createResponse }) {
  const key = createLlmCacheKey(cacheKeyParts);
  const filePath = path.join(cacheDir, `${key}.json`);

  if (fs.existsSync(filePath)) {
    const cached = JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

module.exports = {
  createLlmCacheKey,
  getOrCreateLlmResponse,
  stableStringify,
};
