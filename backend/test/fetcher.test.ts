import assert from "node:assert/strict";
import test from "node:test";
import { fetchRecipeHtml } from "../src/ingestion/fetcher";

test("fetchRecipeHtml returns HTML response body and metadata", async () => {
  const page = await fetchRecipeHtml("https://example.test/recipe", {
    fetcher: async () => ({
      ok: true,
      status: 200,
      url: "https://example.test/recipe",
      headers: {
        get: () => "text/html; charset=utf-8",
      },
      text: async () => "<html>recipe</html>",
    }),
  });

  assert.equal(page.html, "<html>recipe</html>");
  assert.equal(page.status, 200);
  assert.equal(page.contentType, "text/html; charset=utf-8");
});

test("fetchRecipeHtml reports non-success HTTP status", async () => {
  await assert.rejects(
    fetchRecipeHtml("https://example.test/missing", {
      fetcher: async () => ({
        ok: false,
        status: 404,
        text: async () => "",
        headers: {
          get: () => "text/html",
        },
      }),
    }),
    /HTTP 404/
  );
});
