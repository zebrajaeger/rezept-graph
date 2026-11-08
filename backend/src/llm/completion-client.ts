import { createLlmClient, type CompletionClient, type CompletionMessage } from "./llm-client";
import { getOrCreateLlmResponse } from "./llm-response-cache";
import type { LlmConfig } from "../config/config";

export function createCompletionClient(llmConfig: LlmConfig, options: Parameters<typeof createLlmClient>[1] = {}, client?: CompletionClient): CompletionClient {
  const activeClient = client || createLlmClient(llmConfig, options);
  return {
    complete: (messages) => completeWithOptionalCache({ messages, llmConfig, client: activeClient }),
  };
}

export async function completeWithOptionalCache({ messages, llmConfig, client }: {
  messages: CompletionMessage[]; llmConfig?: LlmConfig; client: CompletionClient;
}) {
  if (!llmConfig?.responseCacheDir) return client.complete(messages);
  const cached = await getOrCreateLlmResponse({
    cacheDir: llmConfig.responseCacheDir,
    cacheKeyParts: {
      baseUrl: llmConfig.baseUrl,
      model: llmConfig.model,
      messages,
    },
    createResponse: () => client.complete(messages),
  });
  return cached.content;
}
