import { execFile } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { CliError } from "../errors";

export interface GraphImagePaths { mermaidPath: string; svgPath: string; pngPath: string }

export function runRenderer(executable: string, args: string[], timeoutMs = 60000): Promise<void> {
  const inputPath = args[args.indexOf("--input") + 1];
  const outputPath = args[args.indexOf("--output") + 1];
  if (args.includes("--input") && inputPath) {
    try {
      if (fs.statSync(inputPath).size > 192000 || fs.readFileSync(inputPath, "utf8").length > 48000) return Promise.reject(new CliError("Mermaid source exceeds the 48000-character source budget; reduce embedded icons or graph size."));
    } catch { return Promise.reject(new CliError("Mermaid source cannot be read.")); }
  }
  return new Promise((resolve, reject) => {
    execFile(executable, args, { shell: false, timeout: timeoutMs, killSignal: "SIGKILL", maxBuffer: 4096, windowsHide: true }, (error, _stdout, stderr) => {
      if (!error) {
        try {
          if (args.includes("--output") && outputPath?.toLowerCase().endsWith(".svg")) {
            const svg = fs.readFileSync(outputPath, "utf8");
            const markup = svg.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
            const text = markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
            if (/<[^>]+\bclass\s*=\s*["'][^"']*\berror-(?:icon|text)\b/i.test(markup) || /Maximum\s+text\s+size\s+in\s+diagram\s+exceeded/i.test(text)) throw new CliError("Mermaid produced an error diagram despite a successful process exit.");
          }
          resolve();
        } catch (failure) { reject(failure); }
        return;
      }
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
