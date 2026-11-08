export interface IconGenerationRequest {
  canonicalKey: string;
  prompt: string;
  stagingPngPath: string;
  signal?: AbortSignal;
}

export interface IconGeneratorIdentity {
  backend: string;
  cliVersion: string;
  requestedAgentModel?: string;
  reportedAgentModel?: string;
  reportedImageModel: string | null;
}

export type IconGenerationResult =
  | { available: true; stagingPngPath: string; identity: IconGeneratorIdentity }
  | { available: false; reason: "prerequisite" | "process" | "timeout" | "cancelled" | "artifact" | "storage" | "budget" };

/** Implementations return only technically validated application-owned staging files. */
export interface IconGenerator {
  generate(request: IconGenerationRequest): Promise<IconGenerationResult>;
}
