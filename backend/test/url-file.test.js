const assert = require("node:assert/strict");
const test = require("node:test");
const { parseUrlFile } = require("../src/url-file");

test("parseUrlFile ignores comments and blank lines", () => {
  const urls = parseUrlFile(`
    # Kommentar
    https://example.test/one

    https://example.test/two
  `);

  assert.deepEqual(urls, ["https://example.test/one", "https://example.test/two"]);
});
