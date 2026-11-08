const path = require("node:path");
const { CliError } = require("./errors");

const CACHE_MODES = new Set(["cache-first", "refresh", "offline"]);
const INTERMEDIATE_STATE_MODES = new Set(["show", "hide"]);

function parseArgs(argv) {
  const tokens = [...argv];
  const command = tokens.shift() || "analyze";
  const options = {
    command,
    configPath: path.resolve(__dirname, "..", "..", "config.json"),
    urlsPath: path.join("examples", "recipe-urls.txt"),
    cacheMode: undefined,
    outputDir: undefined,
    intermediateStates: undefined,
    seedLimit: 10,
  };

  if (command === "help" || command === "--help" || command === "-h") {
    return { ...options, command: "help" };
  }

  if (!["analyze", "seed-chefkoch"].includes(command)) {
    throw new CliError(`Unbekanntes Kommando: ${command}`);
  }

  while (tokens.length > 0) {
    const token = tokens.shift();
    const value = () => {
      if (tokens.length === 0 || tokens[0].startsWith("--")) {
        throw new CliError(`Option ${token} erwartet einen Wert.`);
      }
      return tokens.shift();
    };

    switch (token) {
      case "--config":
        options.configPath = value();
        break;
      case "--urls":
        options.urlsPath = value();
        break;
      case "--cache-mode":
        options.cacheMode = value();
        break;
      case "--output-dir":
        options.outputDir = value();
        break;
      case "--intermediate-states":
        options.intermediateStates = value();
        break;
      case "--limit":
        options.seedLimit = parseIntegerOption(token, value());
        break;
      default:
        throw new CliError(`Unbekannte Option: ${token}`);
    }
  }

  validateArgs(options);
  return options;
}

function validateArgs(options) {
  if (options.cacheMode && !CACHE_MODES.has(options.cacheMode)) {
    throw new CliError(
      `Ungueltiger Cache-Modus: ${options.cacheMode}. Erlaubt: ${[...CACHE_MODES].join(", ")}.`
    );
  }

  if (
    options.intermediateStates &&
    !INTERMEDIATE_STATE_MODES.has(options.intermediateStates)
  ) {
    throw new CliError(
      `Ungueltiger Wert fuer --intermediate-states: ${options.intermediateStates}. Erlaubt: show, hide.`
    );
  }

  if (options.seedLimit < 1) {
    throw new CliError("--limit muss groesser als 0 sein.");
  }
}

function parseIntegerOption(name, rawValue) {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed)) {
    throw new CliError(`${name} erwartet eine ganze Zahl.`);
  }
  return parsed;
}

function printHelp(stream = process.stdout) {
  stream.write(`Rezept Graph CLI

Commands:
  analyze          Analyze URLs from a file. Default command.
  seed-chefkoch   Explicitly seed the URL file with random Chefkoch recipes.

Options:
  --config <path>                 Config path (default: project-root config.json)
  --urls <path>                   URL file (default: examples/recipe-urls.txt, relative to working directory)
  --cache-mode <mode>             cache-first, refresh or offline
  --output-dir <path>             Output directory
  --intermediate-states <mode>    show or hide
  --limit <number>                Number of URLs to seed for seed-chefkoch

Examples (from backend):
  npm start -- analyze --config ../config.example.json --urls examples/recipe-urls.txt
  npm start -- seed-chefkoch --urls examples/recipe-urls.txt --limit 5

Example (from project root):
  node backend/src/cli.js analyze --urls backend/examples/recipe-urls.txt
`);
}

module.exports = {
  CACHE_MODES,
  INTERMEDIATE_STATE_MODES,
  parseArgs,
  printHelp,
};
