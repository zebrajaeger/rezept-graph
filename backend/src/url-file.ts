import fs from "node:fs";
import path from "node:path";

export function readUrlFile(urlsPath: string) {
  const content = fs.readFileSync(urlsPath, "utf8");
  return parseUrlFile(content);
}

export function parseUrlFile(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

export function appendUniqueUrls(urlsPath: string, urls: string[]) {
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
