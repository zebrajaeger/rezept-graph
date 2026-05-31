const fs = require("node:fs");
const path = require("node:path");

function readUrlFile(urlsPath) {
  const content = fs.readFileSync(urlsPath, "utf8");
  return parseUrlFile(content);
}

function parseUrlFile(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function appendUniqueUrls(urlsPath, urls) {
  const existingContent = fs.existsSync(urlsPath)
    ? fs.readFileSync(urlsPath, "utf8")
    : "";
  const existingUrls = new Set(parseUrlFile(existingContent));
  const uniqueNewUrls = urls.filter((url) => {
    if (existingUrls.has(url)) return false;
    existingUrls.add(url);
    return true;
  });

  if (uniqueNewUrls.length === 0) {
    return { added: [], skipped: urls.length };
  }

  fs.mkdirSync(path.dirname(urlsPath), { recursive: true });
  const prefix = existingContent.length > 0 && !existingContent.endsWith("\n") ? "\n" : "";
  fs.appendFileSync(urlsPath, `${prefix}${uniqueNewUrls.join("\n")}\n`);
  return { added: uniqueNewUrls, skipped: urls.length - uniqueNewUrls.length };
}

module.exports = {
  appendUniqueUrls,
  parseUrlFile,
  readUrlFile,
};
