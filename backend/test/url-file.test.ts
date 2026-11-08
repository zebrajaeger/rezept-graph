import assert from "node:assert/strict";
import test from "node:test";
import { parseUrlFile } from "../src/ingestion/url-file";

test("parseUrlFile ignores comments and blank lines", () => {
  const urls = parseUrlFile(`
    # Kommentar
    https://example.test/one

    https://example.test/two
  `);

  assert.deepEqual(urls, ["https://example.test/one", "https://example.test/two"]);
});
