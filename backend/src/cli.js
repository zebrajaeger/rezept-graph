#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { parseArgs, printHelp } = require("./args");
const { loadConfig, mergeConfigWithArgs } = require("./config");
const { CliError } = require("./errors");

async function main(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgs(argv);
  if (args.command === "help") {
    printHelp();
    return 0;
  }

  const cwd = process.cwd();
  const config = mergeConfigWithArgs(loadConfig(args.configPath, cwd), args, cwd);
  const urlsPath = path.resolve(cwd, args.urlsPath);

  if (args.command === "analyze") {
    validateUrlFile(urlsPath);
    process.stdout.write(
      [
        "Analyse-Konfiguration geladen.",
        `URL-Datei: ${urlsPath}`,
        `Cache-Modus: ${config.cache.mode}`,
        `Ausgabe: ${config.output.directory}`,
        `Zwischenzustaende: ${config.output.includeIntermediateStates ? "show" : "hide"}`,
      ].join("\n") + "\n"
    );
    return 0;
  }

  if (args.command === "seed-chefkoch") {
    process.stdout.write(
      [
        "Chefkoch-Seeding ist konfiguriert.",
        `URL-Datei: ${urlsPath}`,
        `Limit: ${args.seedLimit}`,
        "Die Abruflogik wird im naechsten Implementierungsschritt aktiviert.",
      ].join("\n") + "\n"
    );
    return 0;
  }

  throw new CliError(`Nicht unterstuetztes Kommando: ${args.command}`);
}

function validateUrlFile(urlsPath) {
  if (!fs.existsSync(urlsPath)) {
    throw new CliError(`URL-Datei nicht gefunden: ${urlsPath}`);
  }
  const stats = fs.statSync(urlsPath);
  if (!stats.isFile()) {
    throw new CliError(`URL-Pfad ist keine Datei: ${urlsPath}`);
  }
}

if (require.main === module) {
  main().then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error) => {
      if (error instanceof CliError) {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = error.exitCode;
        return;
      }
      process.stderr.write(`${error.stack || error.message}\n`);
      process.exitCode = 1;
    }
  );
}

module.exports = {
  main,
};
