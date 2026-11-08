import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { CodexArtifactLease } from "../src/icons/codex-artifact";

const id = "01a1bc11-4803-7a72-ae5d-f57ddc43b188";
const png = Buffer.from("89504e470d0a1a0a", "hex");

function fixture(t: { after: (fn: () => void) => void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex artifact & fixture "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cache = path.join(root, "generated_images");
  const staging = path.join(root, "staging");
  fs.mkdirSync(cache);
  fs.mkdirSync(staging);
  const session = path.join(cache, id);
  const lease = new CodexArtifactLease(cache);
  t.after(() => lease.release());
  return { root, cache, staging, session, lease };
}

test("fresh session artifact copies only validated bytes and preserves the Codex original", (t) => {
  const { session, staging, lease } = fixture(t);
  lease.claim(id);
  const original = path.join(session, "exec-123.png");
  fs.writeFileSync(original, png);
  const destination = path.join(staging, "candidate.png");
  let validated = false;
  lease.copyValidated(destination, bytes => { assert.deepEqual(bytes, png); validated = true; });
  assert.ok(validated);
  assert.deepEqual(fs.readFileSync(destination), png);
  lease.release();
  assert.deepEqual(fs.readFileSync(original), png);
});

test("cache lease rejects simultaneous writers, stale locks, and preexisting sessions", (t) => {
  const { cache, session, lease } = fixture(t);
  assert.throws(() => new CodexArtifactLease(cache), /Codex artifact/);
  fs.mkdirSync(session);
  assert.throws(() => lease.claim(id), /Codex artifact/);
  lease.release();
  fs.writeFileSync(path.join(cache, ".rezept-graph-writer.lock"), "user-owned lock");
  assert.throws(() => new CodexArtifactLease(cache), /Codex artifact/);
  lease.release();
  assert.equal(fs.readFileSync(path.join(cache, ".rezept-graph-writer.lock"), "utf8"), "user-owned lock");
});

test("artifact selection rejects missing, multiple, nested and oversized candidates", (t) => {
  for (const kind of ["missing", "multiple", "nested", "oversized", "entries"]) {
    const { session, staging, lease } = fixture(t);
    lease.claim(id);
    if (kind === "multiple") for (const name of ["a.png", "b.png"]) fs.writeFileSync(path.join(session, name), png);
    if (kind === "nested") fs.mkdirSync(path.join(session, "image.png"));
    if (kind === "oversized") fs.writeFileSync(path.join(session, "a.png"), Buffer.alloc(4 * 1024 * 1024 + 1));
    if (kind === "entries") for (let i = 0; i < 33; i++) fs.writeFileSync(path.join(session, `${i}.txt`), "x");
    const destination = path.join(staging, "candidate.png");
    assert.throws(() => lease.copyValidated(destination, () => {}), /Codex artifact/);
    assert.equal(fs.existsSync(destination), false);
  }
});

test("unsafe identities, repeated claims and released leases cannot acquire", (t) => {
  for (const identity of ["../outside", "", id.toUpperCase(), "a/b", "C:\\outside"]) {
    const { lease } = fixture(t);
    assert.throws(() => lease.claim(identity), /Codex artifact/);
  }
  const { lease, staging } = fixture(t);
  lease.claim(id);
  assert.throws(() => lease.claim(id), /Codex artifact/);
  lease.release();
  assert.throws(() => lease.copyValidated(path.join(staging, "candidate.png"), () => {}), /Codex artifact/);
});

test("hardlinked files, linked session directories and linked cache roots are rejected", (t) => {
  const { root, cache, session, staging, lease } = fixture(t);
  lease.claim(id);
  const outside = path.join(root, "outside.png");
  fs.writeFileSync(outside, png);
  fs.linkSync(outside, path.join(session, "image.png"));
  assert.throws(() => lease.copyValidated(path.join(staging, "candidate.png"), () => {}), /Codex artifact/);
  fs.rmSync(session, { recursive: true });
  const external = path.join(root, "external");
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(external, "image.png"), png);
  fs.symlinkSync(external, session, "junction");
  assert.throws(() => lease.copyValidated(path.join(staging, "candidate.png"), () => {}), /Codex artifact/);
  const linkedCache = path.join(root, "cache-link");
  fs.symlinkSync(cache, linkedCache, "junction");
  assert.throws(() => new CodexArtifactLease(linkedCache), /Codex artifact/);
  assert.deepEqual(fs.readFileSync(outside), png);
});

test("validator failure and existing destinations preserve user files without diagnostic leakage", (t) => {
  const { session, staging, lease } = fixture(t);
  lease.claim(id);
  fs.writeFileSync(path.join(session, "image.png"), png);
  const destination = path.join(staging, "candidate.png");
  assert.throws(() => lease.copyValidated(destination, () => { throw new Error("secret-token"); }), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /Codex artifact/);
    assert.doesNotMatch(error.message, /secret-token/);
    return true;
  });
  assert.equal(fs.existsSync(destination), false);
  fs.writeFileSync(destination, "user file");
  assert.throws(() => lease.copyValidated(destination, () => {}), /Codex artifact/);
  assert.equal(fs.readFileSync(destination, "utf8"), "user file");
});

test("file replacement during validation is rejected before writing staging", (t) => {
  const { session, staging, lease } = fixture(t);
  lease.claim(id);
  const original = path.join(session, "image.png");
  fs.writeFileSync(original, png);
  const destination = path.join(staging, "candidate.png");
  assert.throws(() => lease.copyValidated(destination, () => {
    fs.renameSync(original, path.join(session, "old.png"));
    fs.writeFileSync(original, png);
  }), /Codex artifact/);
  assert.equal(fs.existsSync(destination), false);
});
