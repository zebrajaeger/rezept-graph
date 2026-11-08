import { CodexArtifactLease } from "./codex-artifact";
import { CodexSession } from "./codex-session";
import { runIconProcess, type IconProcessInput } from "./icon-process";

/** Contract composition for fixture validation; not a configured Codex generator backend. */
export async function acquireCodexArtifact(input: {
  cacheRoot: string;
  destination: string;
  process: IconProcessInput;
  validate: (bytes: Buffer) => void;
}, deps: { run: typeof runIconProcess }): Promise<boolean> {
  let lease: CodexArtifactLease | undefined;
  try {
    lease = new CodexArtifactLease(input.cacheRoot);
    const session = new CodexSession();
    let claimed = false;
    const result = await deps.run({
      ...input.process,
      onStdout: chunk => {
        session.push(chunk);
        if (!claimed && session.threadId) {
          lease!.claim(session.threadId);
          claimed = true;
        }
      },
    });
    if (result.status !== "completed") return false;
    session.finish(result.exitCode);
    lease.copyValidated(input.destination, input.validate);
    return true;
  } catch { return false; }
  finally { lease?.release(); }
}
