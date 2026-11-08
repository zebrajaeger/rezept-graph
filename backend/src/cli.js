#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const entry = path.join(__dirname, "../dist/cli.js");
if (!fs.existsSync(entry)) {
  process.stderr.write("Build output missing. Run npm --prefix backend run build from the project root.\n");
  process.exitCode = 1;
} else {
  module.exports = require(entry);
  if (require.main === module) {
    const { spawnSync } = require("node:child_process");
    const result = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], { stdio: "inherit" });
    process.exitCode = result.status ?? 1;
  }
}
