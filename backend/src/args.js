const path = require("node:path");
const { CliError } = require("./errors");

const CACHE_MODES = new Set(["cache-first", "refresh", "offline"]);
const INTERMEDIATE_STATE_MODES = new Set(["show", "hide"]);

function parseArgs(argv) {
  const tokens = [...argv];
  const command = tokens.shift() || "analyze";
  const options = {
    command,
    configPath: "config.json",
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

Kommandos:
  analyze          Analysiert URLs aus einer Datei. Standardkommando.
  seed-chefkoch   Fuellt die URL-Datei explizit mit Chefkoch-Zufallsrezepten.

Optionen:
  --config <path>                 Pfad zur Config-Datei (Standard: config.json)
  --urls <path>                   Pfad zur URL-Datei (Standard: examples/recipe-urls.txt)
  --cache-mode <mode>             cache-first, refresh oder offline
  --output-dir <path>             Ausgabeordner
  --intermediate-states <mode>    show oder hide
  --limit <number>                Anzahl zu seedender URLs fuer seed-chefkoch

Beispiele:
  npm start -- analyze --config config.example.json --urls examples/recipe-urls.txt
  npm start -- seed-chefkoch --urls examples/recipe-urls.txt --limit 5
`);
}

module.exports = {
  CACHE_MODES,
  INTERMEDIATE_STATE_MODES,
  parseArgs,
  printHelp,
};
