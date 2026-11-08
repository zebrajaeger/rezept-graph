import { execFile } from "node:child_process";
import path from "node:path";
import { CliError } from "../errors";

export interface GraphImagePaths { mermaidPath: string; svgPath: string; pngPath: string }

export function runRenderer(executable: string, args: string[], timeoutMs = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { shell: false, timeout: timeoutMs, killSignal: "SIGKILL", maxBuffer: 4096, windowsHide: true }, (error, _stdout, stderr) => {
      if (!error) { resolve(); return; }
      const reason = error.killed ? `Rendering timeout after ${timeoutMs}ms.` : "Rendering process failed.";
      reject(new CliError(`${reason} Install the local Mermaid renderer and its Puppeteer Chrome browser; see docs/setup_en.md or docs/setup_de.md. ${String(stderr || error.message).slice(0, 4096)}`));
    });
  });
}

export async function renderGraphImages(paths: GraphImagePaths, deps: { run?: typeof runRenderer } = {}) {
  let executable: string;
  try {
    executable = path.join(path.dirname(require.resolve("@mermaid-js/mermaid-cli")), "cli.js");
  } catch {
    throw new CliError("Mermaid renderer is missing. Install runtime dependencies; see docs/setup_en.md or docs/setup_de.md.");
  }
  const run = deps.run || runRenderer;
  for (const outputPath of [paths.svgPath, paths.pngPath]) {
    await run(process.execPath, [executable, "--input", paths.mermaidPath, "--theme", "default", "--backgroundColor", "white", "--width", "1600", "--height", "900", "--scale", "1", "--output", outputPath]);
  }
}
