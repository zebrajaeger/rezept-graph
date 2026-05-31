const fs = require("node:fs");
const path = require("node:path");
const { CliError } = require("./errors");

const CACHE_MODES = new Set(["cache-first", "refresh", "offline"]);
const LLM_PROVIDERS = new Set(["openai", "ollama"]);

function loadConfig(configPath, cwd = process.cwd(), env = process.env) {
  const absolutePath = path.resolve(cwd, configPath);
  if (!fs.existsSync(absolutePath)) {
    throw new CliError(`Config-Datei nicht gefunden: ${absolutePath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new CliError(`Config-Datei ist kein gueltiges JSON: ${absolutePath}`);
  }

  validateConfig(parsed, absolutePath);
  return normalizeConfig(parsed, path.dirname(absolutePath), env);
}

function mergeConfigWithArgs(config, args, cwd = process.cwd()) {
  return {
    ...config,
    cache: {
      ...config.cache,
      mode: args.cacheMode || config.cache.mode,
    },
    output: {
      ...config.output,
      directory: path.resolve(cwd, args.outputDir || config.output.directory),
      includeIntermediateStates:
        args.intermediateStates === "show"
          ? true
          : args.intermediateStates === "hide"
            ? false
            : config.output.includeIntermediateStates,
    },
  };
}

function validateConfig(config, sourcePath) {
  const missing = [];
  if (!config || typeof config !== "object") {
    throw new CliError(`Config-Datei muss ein JSON-Objekt enthalten: ${sourcePath}`);
  }

  if (!isNonEmptyString(config.llm?.baseUrl) && !isNonEmptyString(config.llm?.baseUrlEnv)) {
    missing.push("llm.baseUrl");
  }
  if (config.llm?.baseUrlEnv !== undefined && !isNonEmptyString(config.llm.baseUrlEnv)) {
    missing.push("llm.baseUrlEnv");
  }
  if (!isNonEmptyString(config.llm?.model)) missing.push("llm.model");
  if (!isNonEmptyString(config.llm?.apiKeyEnv)) missing.push("llm.apiKeyEnv");
  if (
    config.llm?.provider !== undefined &&
    (!isNonEmptyString(config.llm.provider) || !LLM_PROVIDERS.has(config.llm.provider))
  ) {
    missing.push("llm.provider");
  }
  if (!Number.isInteger(config.llm?.timeoutMs) || config.llm.timeoutMs < 1) {
    missing.push("llm.timeoutMs");
  }
  if (!isNonEmptyString(config.cache?.directory)) missing.push("cache.directory");
  if (!isNonEmptyString(config.cache?.mode)) missing.push("cache.mode");
  if (isNonEmptyString(config.cache?.mode) && !CACHE_MODES.has(config.cache.mode)) {
    missing.push("cache.mode");
  }
  if (!isNonEmptyString(config.output?.directory)) missing.push("output.directory");
  if (typeof config.output?.includeIntermediateStates !== "boolean") {
    missing.push("output.includeIntermediateStates");
  }

  if (missing.length > 0) {
    throw new CliError(`Config-Datei ist unvollstaendig: ${missing.join(", ")}`);
  }
}

function normalizeConfig(config, baseDir, env = process.env) {
  const baseUrl = config.llm.baseUrlEnv
    ? env[config.llm.baseUrlEnv] || config.llm.baseUrl
    : config.llm.baseUrl;

  if (!isNonEmptyString(baseUrl)) {
    throw new CliError(`LLM Base-URL fehlt. Erwartete Umgebungsvariable: ${config.llm.baseUrlEnv}`);
  }

  return {
    llm: {
      provider: config.llm.provider || "openai",
      baseUrl: baseUrl.replace(/\/+$/, ""),
      baseUrlEnv: config.llm.baseUrlEnv,
      model: config.llm.model,
      apiKeyEnv: config.llm.apiKeyEnv,
      timeoutMs: config.llm.timeoutMs,
    },
    cache: {
      directory: path.resolve(baseDir, config.cache.directory),
      mode: config.cache.mode,
    },
    output: {
      directory: path.resolve(baseDir, config.output.directory),
      includeIntermediateStates: config.output.includeIntermediateStates,
    },
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

module.exports = {
  loadConfig,
  mergeConfigWithArgs,
  validateConfig,
};
