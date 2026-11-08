# CLI and examples

[Overview](../README.md) · [Deutsch](cli_de.md)

Prerequisites: completed [setup](setup_en.md) and a suitable
[configuration](configuration_en.md).

## Analyze recipes

From the project root, after building:

```bash
node backend/src/cli.js analyze --urls backend/examples/recipe-urls.txt
```

Alternatively, from the backend with an automatic build:

```bash
cd backend
npm start -- analyze --urls examples/recipe-urls.txt
```

`backend/go.cmd` works independently of the caller's working directory.

Without `--config`, the CLI always loads project-root `config.json`. Explicit
relative configuration paths are relative to the working directory. From the
backend, use `--config ../config.example.json` to select the example. The example
keeps cache and output locations under `backend/`; URL examples remain in
`backend/examples/`.

## Main options

| Option | Meaning |
| --- | --- |
| `--config <path>` | JSON configuration for the LLM, cache, and output. |
| `--urls <path>` | Text file containing recipe URLs; blank lines and `#` comments are ignored. |
| `--cache-mode <cache-first\|refresh\|offline>` | Read HTML from the cache or fetch it again. |
| `--output-dir <path>` | Destination for `.recipe.json`, `.ingredients.txt`, and `.mmd`, relative to the working directory. |
| `--intermediate-states <show\|hide>` | Mermaid output with or without intermediate states. |

Help after building, from the project root:

```bash
node backend/src/cli.js --help
```

## Chefkoch example URLs

Random Chefkoch recipes are not fetched automatically. Use this explicit command
to populate the example URL file:

```bash
cd backend
npm start -- seed-chefkoch --urls examples/recipe-urls.txt --limit 5
```

Only recipes from `https://www.chefkoch.de/rs/s0/zufall/Rezepte.html` with a rating
**greater than 4** and **more than 10 ratings** are included. Existing URLs are not
added again.
