import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { GeneratorConfig } from "./icon-config";
import type { IconGenerator, IconGenerationRequest, IconGenerationResult } from "./generator";
import { acquireCodexArtifact } from "./codex-acquisition";
import { runIconProcess } from "./icon-process";
import { validatePng } from "./png";

export class CodexGenerator implements IconGenerator {
  private readonly attempted = new Set<string>();
  constructor(private readonly config: GeneratorConfig, private readonly deps: { run?: typeof runIconProcess; codexHome?: string } = {}) {}

  async generate(request: IconGenerationRequest): Promise<IconGenerationResult> {
    if (this.attempted.has(request.canonicalKey)) return { available: false, reason: "budget" };
    this.attempted.add(request.canonicalKey);
    const run = this.deps.run || runIconProcess;
    try {
      const cwd = path.dirname(request.stagingPngPath);
      const version = await run({ executable: this.config.executable, args: ["--version"], cwd, input: "", timeoutMs: 5000, maxOutputBytes: 4096, signal: request.signal });
      if (version.status !== "completed" || version.stdout.trim() !== "codex-cli 0.167.0") return { available: false, reason: "prerequisite" };
      const home = this.deps.codexHome || process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
      const cacheRoot = path.join(home, "generated_images");
      // Do not create or redirect credential stores; only Codex's documented image cache.
      if (!fs.existsSync(cacheRoot)) fs.mkdirSync(cacheRoot);
      const args = ["-a", "never", "-c", 'default_permissions="recipe-icons"', "-c", 'permissions.recipe-icons.filesystem={":root"="read",":workspace_roots"={"."="write"}}', "-c", "permissions.recipe-icons.network.enabled=false", "-c", "agents.enabled=false", "-c", "features.hooks=false", "-c", "features.apps=false", "-c", 'web_search="disabled"'];
      if (process.platform === "win32") args.push("-c", 'windows.sandbox="mxc"');
      if (this.config.agentModel) args.push("--model", this.config.agentModel);
      // Explicit security overrides take precedence over the selected profile.
      if (this.config.profile) args.push("--profile", this.config.profile);
      args.push("exec", "--sandbox", "read-only", "--ignore-user-config", "--ignore-rules", "--skip-git-repo-check", "--ephemeral", "--json", "-C", cwd, "-");
      const success = await acquireCodexArtifact({ cacheRoot, destination: request.stagingPngPath, process: { executable: this.config.executable, args, cwd, input: `Use built-in image_gen.imagegen exactly once. Its internal generated_images cache is permitted; leave originals intact. Do not use shell, MCP, web, connectors, direct APIs, subagents or inspect credentials/projects. No retries or edits. If unavailable stop. After generation finish immediately.\n${request.prompt}`, timeoutMs: this.config.timeoutMs, maxOutputBytes: this.config.maxOutputBytes, signal: request.signal }, validate: validatePng }, { run });
      return success ? { available: true, stagingPngPath: request.stagingPngPath, identity: { backend: "codex-cli", cliVersion: "0.167.0", requestedAgentModel: this.config.agentModel, reportedImageModel: null } } : { available: false, reason: "artifact" };
    } catch { return { available: false, reason: "prerequisite" }; }
  }
}
