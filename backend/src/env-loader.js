const fs = require("node:fs");
const path = require("node:path");

function loadDotEnv({ cwd = process.cwd(), configPath, env = process.env } = {}) {
  const candidates = getEnvCandidates(cwd, configPath);
  const loaded = [];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const values = parseDotEnv(fs.readFileSync(filePath, "utf8"));
    for (const [key, value] of Object.entries(values)) {
      if (env[key] === undefined) {
        env[key] = value;
      }
    }
    loaded.push(filePath);
  }

  return loaded;
}

function getEnvCandidates(cwd, configPath) {
  const candidates = [path.resolve(cwd, ".env")];
  const parentEnv = path.resolve(cwd, "..", ".env");
  if (!candidates.includes(parentEnv)) candidates.push(parentEnv);

  if (configPath) {
    const configEnv = path.resolve(cwd, path.dirname(configPath), ".env");
    if (!candidates.includes(configEnv)) candidates.push(configEnv);
  }

  return candidates;
}

function parseDotEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    values[key] = unquote(rawValue);
  }
  return values;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

module.exports = {
  loadDotEnv,
  parseDotEnv,
};
