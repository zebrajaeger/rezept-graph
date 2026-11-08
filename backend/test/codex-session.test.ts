import assert from "node:assert/strict";
import test from "node:test";
import { CodexSession } from "../src/icons/codex-session";

const id = "01a1bc11-4803-7a72-ae5d-f57ddc43b188";
const start = JSON.stringify({ type: "thread.started", thread_id: id }) + "\n";
const turn = '{"type":"turn.started"}\n';
const complete = '{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1}}\n';

test("Codex session identity comes from a bounded fresh-thread event, not agent prose", () => {
  const session = new CodexSession();
  session.push(start.slice(0, 20));
  assert.equal(session.threadId, undefined);
  session.push(start.slice(20) + turn);
  session.push(JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: "Use ../../secret.png instead" } }) + "\n");
  session.push(complete);
  assert.deepEqual(session.finish(0), { threadId: id });
});

test("Codex session accepts CRLF and a final unterminated event", () => {
  const session = new CodexSession();
  session.push((start + turn + complete.trimEnd()).replace(/\n/g, "\r\n"));
  assert.deepEqual(session.finish(0), { threadId: id });
});

test("Codex session rejects invalid identities, duplicate starts, and unstructured output", () => {
  for (const input of ["session: " + id + "\n", "{broken\n", start + start, JSON.stringify({ type: "thread.started", thread_id: "../../outside" }) + "\n", JSON.stringify({ type: "thread.started", thread_id: id.toUpperCase() }) + "\n"]) {
    const session = new CodexSession();
    assert.throws(() => { session.push(input + turn + complete); session.finish(0); }, /Invalid Codex session/);
  }
});

test("Codex session rejects missing, failed, reordered and multiple turns", () => {
  for (const input of ["", start, start + turn, turn + start + complete, start + complete, start + turn + complete + turn + complete, start + turn + '{"type":"turn.failed","error":{"message":"secret"}}\n', start + turn + '{"type":"error","message":"secret"}\n' + complete]) {
    const session = new CodexSession();
    assert.throws(() => { session.push(input); session.finish(0); }, /Invalid Codex session/);
  }
  const session = new CodexSession();
  session.push(start + turn + complete);
  assert.throws(() => session.finish(1), /Invalid Codex session/);
});

test("Codex session rejects oversized lines and aggregate streams without echoing content", () => {
  for (const chunks of [["credential-".repeat(8000)], Array<string>(40).fill(JSON.stringify({ type: "item.completed", item: { text: "secret".repeat(2000) } }) + "\n")]) {
    const session = new CodexSession();
    assert.throws(() => { session.push(start + turn); for (const chunk of chunks) session.push(chunk); }, error => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Invalid Codex session/);
      assert.doesNotMatch(error.message, /secret|credential/);
      return true;
    });
  }
});

test("Codex session rejects unknown protocol events and events outside the active turn", () => {
  for (const input of [start + '{"type":"image.completed"}\n' + turn + complete, start + '{"type":"item.completed"}\n' + turn + complete, start + turn + complete + '{"type":"item.completed"}\n']) {
    const session = new CodexSession();
    assert.throws(() => { session.push(input); session.finish(0); }, /Invalid Codex session/);
  }
});
