const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  CHEFKOCH_RANDOM_URL,
  parseChefkochRecipes,
  seedChefkochUrls,
} = require("../src/chefkoch-seeder");

test("parseChefkochRecipes reads recipe URLs, ratings, and rating counts", () => {
  const html = `
    <article>
      <a href="/rezepte/1/Gutes-Rezept.html">Gutes Rezept</a>
      <script>{"aggregateRating":{"ratingValue":"4,6","ratingCount":"12"}}</script>
    </article>
    <article>
      <a href="https://www.chefkoch.de/rezepte/2/Nicht-Gut-Genug.html">Nicht gut genug</a>
      <script>{"aggregateRating":{"ratingValue":"4,0","ratingCount":"99"}}</script>
    </article>
  `;

  assert.deepEqual(parseChefkochRecipes(html), [
    {
      url: "https://www.chefkoch.de/rezepte/1/Gutes-Rezept.html",
      rating: 4.6,
      ratingCount: 12,
    },
    {
      url: "https://www.chefkoch.de/rezepte/2/Nicht-Gut-Genug.html",
      rating: 4,
      ratingCount: 99,
    },
  ]);
});

test("seedChefkochUrls filters by rating, count, and deduplicates existing URLs", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rezept-graph-"));
  const urlsPath = path.join(tmpDir, "recipe-urls.txt");
  fs.writeFileSync(
    urlsPath,
    [
      "# existing",
      "https://www.chefkoch.de/rezepte/1/Gutes-Rezept.html",
      "",
    ].join("\n")
  );

  let requestedUrl;
  const result = await seedChefkochUrls({
    urlsPath,
    limit: 10,
    fetcher: async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        status: 200,
        text: async () => `
          <a href="/rezepte/1/Gutes-Rezept.html">Schon vorhanden</a>
          <script>{"ratingValue":"4.7","ratingCount":"33"}</script>
          <a href="/rezepte/2/Neu.html">Neu</a>
          <script>{"ratingValue":"4,5","ratingCount":"11"}</script>
          <a href="/rezepte/3/Zu-Wenig-Bewertungen.html">Zu wenig</a>
          <script>{"ratingValue":"4,9","ratingCount":"10"}</script>
          <a href="/rezepte/4/Zu-Niedrig.html">Zu niedrig</a>
          <script>{"ratingValue":"4","ratingCount":"200"}</script>
        `,
      };
    },
  });

  assert.equal(requestedUrl, CHEFKOCH_RANDOM_URL);
  assert.deepEqual(result.added, ["https://www.chefkoch.de/rezepte/2/Neu.html"]);
  assert.equal(result.skipped, 1);
  assert.match(
    fs.readFileSync(urlsPath, "utf8"),
    /https:\/\/www\.chefkoch\.de\/rezepte\/2\/Neu\.html/
  );
});
