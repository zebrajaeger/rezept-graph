import path from "node:path";

export interface GeneratorConfig { backend: "codex-cli"; executable: string; termsReference: string; profile?: string; agentModel?: string; timeoutMs: number; maxOutputBytes: number }
export interface IconConfig { mode: "off" | "local-only" | "generate-missing"; libraryDirectory: string; displayCacheDirectory: string; reportPath: string; generator?: GeneratorConfig }

export function normalizeIcons(value: unknown, base: string): IconConfig {
  const fail = (): never => { throw new Error("Invalid icons configuration; check mode, paths and bounded codex-cli settings."); };
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && !v.includes("\0");
  if (value === undefined) return { mode: "off", libraryDirectory: path.resolve(base, "assets/recipe-icons"), displayCacheDirectory: path.resolve(base, "backend/.cache/recipe-icons"), reportPath: path.resolve(base, "backend/outputs/icon-demand.json") };
  if (!record(value) || !["off", "local-only", "generate-missing"].includes(String(value.mode))) fail();
  const v = value as Record<string, unknown>;
  for (const key of ["libraryDirectory", "reportPath", "displayCacheDirectory"]) if (v[key] !== undefined && !text(v[key])) fail();
  let generator: GeneratorConfig | undefined;
  if (v.generator !== undefined) {
    if (!record(v.generator)) fail();
    const g = v.generator as Record<string, unknown>;
    if (g.backend !== undefined && g.backend !== "codex-cli") fail();
    for (const key of ["executable", "termsReference", "profile", "agentModel"]) if (g[key] !== undefined && !text(g[key])) fail();
    if (typeof g.termsReference === "string" && /^https?:/i.test(g.termsReference)) {
      let url: URL; try { url = new URL(g.termsReference); } catch { return fail(); }
      if (url.username || url.password || url.search || url.hash) fail();
    }
    if (g.profile !== undefined && !/^[a-zA-Z0-9_-]+$/.test(String(g.profile))) fail();
    for (const [key, maximum] of [["timeoutMs", 600000], ["maxOutputBytes", 1048576]] as const) if (g[key] !== undefined && (!Number.isSafeInteger(g[key]) || Number(g[key]) < 1 || Number(g[key]) > maximum)) fail();
    if (v.mode === "generate-missing" && (g.backend !== "codex-cli" || !text(g.executable) || !text(g.termsReference))) fail();
    const executable = String(g.executable || "codex");
    generator = { backend: "codex-cli", executable: /[\\/]/.test(executable) ? path.resolve(base, executable) : executable, termsReference: String(g.termsReference || "unknown"), profile: g.profile as string | undefined, agentModel: g.agentModel as string | undefined, timeoutMs: Number(g.timeoutMs ?? 120000), maxOutputBytes: Number(g.maxOutputBytes ?? 262144) };
  }
  if (v.mode === "generate-missing" && !generator) fail();
  const libraryDirectory = path.resolve(base, String(v.libraryDirectory || "assets/recipe-icons"));
  const reportPath = path.resolve(base, String(v.reportPath || "backend/outputs/icon-demand.json"));
  const relative = path.relative(libraryDirectory, reportPath);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) fail();
  const displayCacheDirectory = path.resolve(base, String(v.displayCacheDirectory || "backend/.cache/recipe-icons"));
  const within = (parent: string, child: string) => { const relative = path.relative(parent, child); return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)); };
  if (within(libraryDirectory, displayCacheDirectory) || within(displayCacheDirectory, libraryDirectory) || within(displayCacheDirectory, reportPath)) fail();
  return { mode: v.mode as IconConfig["mode"], libraryDirectory, displayCacheDirectory, reportPath, generator };
}
