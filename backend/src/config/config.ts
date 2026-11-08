import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors";
import { isRecord } from "../unknown-data";
import type { CliArgs } from "../cli/args";

export type CacheMode = "cache-first" | "refresh" | "offline";
export type LlmProvider = "openai" | "ollama";
export interface LlmConfig {
  provider?: LlmProvider;
  baseUrl: string;
  baseUrlEnv?: string;
  model: string;
  apiKeyEnv: string;
  timeoutMs?: number;
  responseCacheDir?: string;
}
export interface RawConfig {
  llm: Omit<LlmConfig, "baseUrl"> & { baseUrl?: string; timeoutMs: number };
  cache: { directory: string; mode: CacheMode };
  output: { directory: string; includeIntermediateStates: boolean };
}
export interface Config extends Omit<RawConfig, "llm"> { llm: LlmConfig }

const CACHE_MODES = new Set(["cache-first", "refresh", "offline"]);
const LLM_PROVIDERS = new Set(["openai", "ollama"]);

export function loadConfig(configPath: string, cwd = process.cwd(), env: NodeJS.ProcessEnv = process.env): Config {
  const absolutePath = path.resolve(cwd, configPath);
  if (!fs.existsSync(absolutePath)) {
    throw new CliError(`Config-Datei nicht gefunden: ${absolutePath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new CliError(`Config-Datei ist kein gueltiges JSON: ${absolutePath}`);
  }

  validateConfig(parsed, absolutePath);
  return normalizeConfig(parsed, path.dirname(absolutePath), env);
}

export function mergeConfigWithArgs(config: Config, args: CliArgs, cwd = process.cwd()): Config {
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

export function validateConfig(config: unknown, sourcePath: string): asserts config is RawConfig {
  const missing = [];
  if (!isRecord(config)) {
    throw new CliError(`Config-Datei muss ein JSON-Objekt enthalten: ${sourcePath}`);
  }

  const llm = isRecord(config.llm) ? config.llm : {};
  const cache = isRecord(config.cache) ? config.cache : {};
  const output = isRecord(config.output) ? config.output : {};
  if (!isNonEmptyString(llm.baseUrl) && !isNonEmptyString(llm.baseUrlEnv)) {
    missing.push("llm.baseUrl");
  }
  if (llm.baseUrlEnv !== undefined && !isNonEmptyString(llm.baseUrlEnv)) {
    missing.push("llm.baseUrlEnv");
  }
  if (!isNonEmptyString(llm.model)) missing.push("llm.model");
  if (!isNonEmptyString(llm.apiKeyEnv)) missing.push("llm.apiKeyEnv");
  if (
    llm.provider !== undefined &&
    (!isNonEmptyString(llm.provider) || !LLM_PROVIDERS.has(llm.provider))
  ) {
    missing.push("llm.provider");
  }
  if (typeof llm.timeoutMs !== "number" || !Number.isInteger(llm.timeoutMs) || llm.timeoutMs < 1) {
    missing.push("llm.timeoutMs");
  }
  if (!isNonEmptyString(cache.directory)) missing.push("cache.directory");
  if (!isNonEmptyString(cache.mode)) missing.push("cache.mode");
  if (isNonEmptyString(cache.mode) && !CACHE_MODES.has(cache.mode)) {
    missing.push("cache.mode");
  }
  if (!isNonEmptyString(output.directory)) missing.push("output.directory");
  if (typeof output.includeIntermediateStates !== "boolean") {
    missing.push("output.includeIntermediateStates");
  }

  if (missing.length > 0) {
    throw new CliError(`Config-Datei ist unvollstaendig: ${missing.join(", ")}`);
  }
}

function normalizeConfig(config: RawConfig, baseDir: string, env: NodeJS.ProcessEnv = process.env): Config {
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
