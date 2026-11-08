const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { parseArgs, printHelp } = require("../src/args");
const { loadConfig } = require("../src/config");

const root = path.resolve(__dirname, "../..");

test("default config is the same from root and backend working directories", () => {
  for (const cwd of [root, path.join(root, "backend")]) {
    const result = spawnSync(process.execPath, ["-e",
      `console.log(require(${JSON.stringify(path.join(root, "backend/src/args.js"))}).parseArgs(['analyze']).configPath)`],
    { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), path.join(root, "config.json"));
  }
});

test("explicit config paths retain caller-relative and absolute semantics", (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "config-location-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.copyFileSync(path.join(root, "config.example.json"), path.join(tmp, "custom.json"));
  for (const supplied of ["custom.json", path.join(tmp, "custom.json")]) {
    const args = parseArgs(["analyze", "--config", supplied]);
    assert.equal(args.configPath, supplied);
    const config = loadConfig(args.configPath, tmp, {});
    assert.equal(config.cache.directory, path.join(tmp, "backend/.cache/recipe-pages"));
    assert.equal(config.output.directory, path.join(tmp, "backend/outputs"));
  }
});

test("missing default config does not select a legacy config or example", (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "config-missing-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(tmp, "backend/src"), { recursive: true });
  for (const name of ["args.js", "errors.js", "config.js"]) {
    fs.copyFileSync(path.join(root, "backend/src", name), path.join(tmp, "backend/src", name));
  }
  for (const target of ["backend/config.json", "config.example.json"]) {
    fs.copyFileSync(path.join(root, "config.example.json"), path.join(tmp, target));
  }
  const isolatedArgs = require(path.join(tmp, "backend/src/args.js"));
  const selected = isolatedArgs.parseArgs(["analyze"]).configPath;
  assert.equal(selected, path.join(tmp, "config.json"));
  assert.throws(() => loadConfig(selected, tmp, {}), (error) => error.message.includes(selected));
});

test("root example retains backend destinations and help documents new layout", () => {
  const config = loadConfig(path.join(root, "config.example.json"), root, {});
  assert.equal(config.cache.directory, path.join(root, "backend/.cache/recipe-pages"));
  assert.equal(config.output.directory, path.join(root, "backend/outputs"));
  assert.equal(fs.existsSync(path.join(root, "backend/config.example.json")), false);
  let help = "";
  printHelp({ write: (text) => { help += text; } });
  assert.match(help, /project-root config.json/);
  assert.match(help, /--config ..\/config.example.json/);
});

test("Windows launcher establishes backend working directory without network calls", { skip: process.platform !== "win32" }, (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-check-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(tmp, "backend"));
  fs.copyFileSync(path.join(root, "backend/go.cmd"), path.join(tmp, "backend/go.cmd"));
  fs.writeFileSync(path.join(tmp, "backend/npm.cmd"), '@echo off\necho CWD=%CD%\necho ARGS=%*\nexit /b 7\n');
  const result = spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/c", "backend\\go.cmd"], { cwd: tmp, encoding: "utf8" });
  assert.equal(result.status, 7, result.stderr);
  assert.ok(result.stdout.includes(`CWD=${path.join(tmp, "backend")}`));
  assert.ok(result.stdout.includes('--config "..\\config.json"'));
  assert.ok(result.stdout.includes("--urls examples/recipe-urls.txt"));
});
