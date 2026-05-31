#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { getRecipePage } = require("./cache");
const { parseArgs, printHelp } = require("./args");
const { seedChefkochUrls } = require("./chefkoch-seeder");
const { loadConfig, mergeConfigWithArgs } = require("./config");
const { loadDotEnv } = require("./env-loader");
const { CliError } = require("./errors");
const { extractRecipeContent } = require("./extractor");
const { fetchRecipeHtml } = require("./fetcher");
const { createOpenAiCompatibleClient } = require("./llm-client");
const { analyzeRecipeContent } = require("./recipe-analyzer");
const { writeRecipeOutputs } = require("./output-writer");
const { readUrlFile } = require("./url-file");

async function main(argv = process.argv.slice(2), env = process.env, deps = {}) {
  const args = parseArgs(argv);
  if (args.command === "help") {
    printHelp();
    return 0;
  }

  const cwd = process.cwd();
  const urlsPath = path.resolve(cwd, args.urlsPath);

  if (args.command === "analyze") {
    loadDotEnv({ cwd, configPath: args.configPath, env });
    const config = mergeConfigWithArgs(loadConfig(args.configPath, cwd), args, cwd);
    validateUrlFile(urlsPath);
    const urls = readUrlFile(urlsPath);
    if (urls.length === 0) {
      throw new CliError(`URL-Datei enthaelt keine verarbeitbaren URLs: ${urlsPath}`);
    }

    process.stdout.write(
      [
        "Analyse-Konfiguration geladen.",
        `URL-Datei: ${urlsPath}`,
        `Cache-Modus: ${config.cache.mode}`,
        `Ausgabe: ${config.output.directory}`,
        `Zwischenzustaende: ${config.output.includeIntermediateStates ? "show" : "hide"}`,
      ].join("\n") + "\n"
    );

    for (const url of urls) {
      const page = await getRecipePage({
        url,
        cacheDir: config.cache.directory,
        cacheMode: config.cache.mode,
        fetcher: (pageUrl) =>
          fetchRecipeHtml(pageUrl, {
            fetcher: deps.fetcher || fetch,
            timeoutMs: 30000,
          }),
      });
      const content = extractRecipeContent(page.html, url);
      const analysis = await analyzeRecipeContent({
        content,
        llmConfig: config.llm,
        client:
          deps.llmClient ||
          createOpenAiCompatibleClient(config.llm, {
            env,
            fetcher: deps.llmFetcher || fetch,
          }),
      });
      const outputs = writeRecipeOutputs(analysis, config.output.directory, {
        includeIntermediateStates: config.output.includeIntermediateStates,
      });

      process.stdout.write(
        [
          `Analysiert: ${url}`,
          `  JSON: ${outputs.jsonPath}`,
          `  Zutaten: ${outputs.ingredientsPath}`,
          `  Mermaid: ${outputs.mermaidPath}`,
        ].join("\n") + "\n"
      );
    }
    return 0;
  }

  if (args.command === "seed-chefkoch") {
    const result = await seedChefkochUrls({
      urlsPath,
      limit: args.seedLimit,
      fetcher: deps.fetcher || fetch,
    });
    process.stdout.write(
      [
        "Chefkoch-Seeding abgeschlossen.",
        `URL-Datei: ${urlsPath}`,
        `Quelle: ${result.sourceUrl}`,
        `Gefunden nach Filter: ${result.discovered}`,
        `Neu hinzugefuegt: ${result.added.length}`,
        `Uebersprungen: ${result.skipped}`,
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
