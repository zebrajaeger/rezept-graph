import crypto from "node:crypto";

// Existing page-cache and output-name identity; unrelated to completion cache keys.
export function hashSourceIdentity(source: string) {
  return crypto.createHash("sha256").update(source).digest("hex").slice(0, 24);
}
