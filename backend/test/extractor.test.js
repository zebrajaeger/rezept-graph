const assert = require("node:assert/strict");
const test = require("node:test");
const {
  cleanHtmlText,
  extractJsonLdRecipe,
  extractRecipeContent,
} = require("../src/extractor");

test("extractJsonLdRecipe reads schema.org Recipe data", () => {
  const recipe = extractJsonLdRecipe(`
    <html>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": "Pfannkuchen",
          "recipeYield": "2 Portionen",
          "recipeIngredient": ["2 Eier", "200 ml Milch"],
          "recipeInstructions": [
            { "@type": "HowToStep", "text": "Teig ruehren." },
            { "@type": "HowToStep", "text": "Ausbacken." }
          ]
        }
      </script>
    </html>
  `);

  assert.equal(recipe.title, "Pfannkuchen");
  assert.deepEqual(recipe.ingredients, ["2 Eier", "200 ml Milch"]);
  assert.deepEqual(recipe.instructions, ["Teig ruehren.", "Ausbacken."]);
});

test("extractRecipeContent returns JSON-LD method when recipe data exists", () => {
  const content = extractRecipeContent(
    `
      <script type="application/ld+json">
        {"@type":"Recipe","name":"Suppe","recipeIngredient":["1 l Wasser"]}
      </script>
      <main>Suppe kochen</main>
    `,
    "https://example.test/suppe"
  );

  assert.equal(content.extractionMethod, "json-ld");
  assert.equal(content.sourceUrl, "https://example.test/suppe");
  assert.equal(content.structuredRecipe.title, "Suppe");
  assert.match(content.text, /Suppe kochen/);
});

test("cleanHtmlText removes scripts, styles, tags, and collapses whitespace", () => {
  assert.equal(
    cleanHtmlText(`
      <style>.x { color: red }</style>
      <script>alert("x")</script>
      <main>Apfel&nbsp;kuchen <strong>backen</strong></main>
    `),
    "Apfel kuchen backen"
  );
});

test("extractRecipeContent falls back to cleaned text", () => {
  const content = extractRecipeContent(
    "<html><body><h1>Rezept</h1><p>Alles mischen.</p></body></html>",
    "https://example.test/text"
  );

  assert.equal(content.extractionMethod, "text");
  assert.equal(content.structuredRecipe, null);
  assert.equal(content.text, "Rezept Alles mischen.");
});
