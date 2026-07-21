/**
 * Centralised AI provider configuration.
 *
 * Reads settings from environment variables only — API keys are never stored in
 * the database or committed to the repo. The default mode is "mock" so the app
 * runs with no external credentials. Switch to "openai" (with an OpenAI or
 * OpenAI-compatible key) to enable real generations.
 */

export type AiProviderMode = "mock" | "openai";

export interface AiConfig {
  mode: AiProviderMode;
  apiKey?: string;
  baseUrl: string;
  model: string;
  /** True when a real provider is configured and usable. */
  enabled: boolean;
}

export function getAiConfig(): AiConfig {
  const rawMode = (process.env.AI_PROVIDER_MODE ?? "mock").toLowerCase();
  const mode: AiProviderMode = rawMode === "openai" ? "openai" : "mock";

  const apiKey = process.env.OPENAI_API_KEY?.trim() || undefined;
  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  // Only treat the provider as enabled when real credentials are present.
  const enabled = mode === "openai" && Boolean(apiKey);

  return { mode, apiKey, baseUrl, model, enabled };
}

/** Safe, serialisable summary for UI/status without leaking the API key. */
export function getAiStatus() {
  const cfg = getAiConfig();
  return {
    mode: cfg.mode,
    enabled: cfg.enabled,
    model: cfg.model,
    baseUrl: cfg.baseUrl,
    hasApiKey: Boolean(cfg.apiKey),
  };
}
