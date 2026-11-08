import path from "node:path";
import { isRecord } from "../unknown-data";

export interface InterpretationConfig { enabled: true; baseUrl: string; model: string; apiKeyEnv: string; timeoutMs: number; maxOutputBytes: number; cacheDirectory: string }

export function normalizeInterpretation(value: unknown, base: string): InterpretationConfig | undefined {
  if (value === undefined) return undefined;
  const fail = (): never => { throw Error("Invalid icons interpretation configuration."); };
  if (!isRecord(value) || typeof value.enabled !== "boolean") return fail();
  if (!value.enabled) return undefined;
  for (const key of ["baseUrl", "model", "apiKeyEnv"]) if (typeof value[key] !== "string" || !(value[key] as string).trim() || (value[key] as string).includes("\0")) return fail();
  let url: URL; try { url = new URL(value.baseUrl as string); } catch { return fail(); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) return fail();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value.apiKeyEnv as string)) return fail();
  for (const [key, maximum] of [["timeoutMs", 60000], ["maxOutputBytes", 65536]] as const) if (value[key] !== undefined && (!Number.isSafeInteger(value[key]) || Number(value[key]) < 1 || Number(value[key]) > maximum)) return fail();
  if (value.cacheDirectory !== undefined && (typeof value.cacheDirectory !== "string" || !value.cacheDirectory.trim() || value.cacheDirectory.includes("\0"))) return fail();
  return { enabled: true, baseUrl: (value.baseUrl as string).replace(/\/+$/, ""), model: value.model as string, apiKeyEnv: value.apiKeyEnv as string, timeoutMs: Number(value.timeoutMs ?? 10000), maxOutputBytes: Number(value.maxOutputBytes ?? 4096), cacheDirectory: path.resolve(base, String(value.cacheDirectory ?? "backend/.cache/ingredient-interpretation")) };
}
