import type { RecipeNode } from "../src/recipe/recipe-types";
import type { LlmConfig } from "../src/config/config";
import type { CompletionClient } from "../src/llm/llm-client";
import type { PageFetcher } from "../src/http-types";

// @ts-expect-error Unknown node categories must not enter validated graphs.
const node: RecipeNode = { id: "tool", type: "tool", label: "Whisk" };
const config: LlmConfig = {
  baseUrl: "https://example.test", model: "test", apiKeyEnv: "KEY",
  // @ts-expect-error No provider selector exists, even for the supported protocol.
  provider: "openai",
};
const client: CompletionClient = {
  // @ts-expect-error Completion clients return text, not arbitrary JSON objects.
  complete: async () => ({ content: "wrong return type" }),
};
// @ts-expect-error Page fetchers must return the consumed response capabilities.
const fetcher: PageFetcher = async () => ({ ok: true });
void [node, config, client, fetcher];
const nativeConfig: LlmConfig = {
  ...config,
  // @ts-expect-error Native provider protocols are no longer supported.
  provider: "ollama",
};
void nativeConfig;
