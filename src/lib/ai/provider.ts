import "server-only";

import { prisma } from "@/lib/prisma";
import { MockAiProvider } from "@/lib/ai/mock-provider";
import { OpenAiCompatibleProvider } from "@/lib/ai/openai-compatible";
import type { AiProvider, AiProviderConfig } from "@/lib/ai/types";

const DEFAULT_SETTINGS = {
  id: "default",
  mockMode: true,
  baseUrl: "https://api.openai.com/v1",
  modelName: "gpt-4o-mini",
  temperature: 0.4,
};

export async function getStudioSettings() {
  return prisma.studioSettings.upsert({
    where: { id: "default" },
    update: {},
    create: DEFAULT_SETTINGS,
  });
}

export async function getAiProviderConfig(): Promise<AiProviderConfig> {
  const settings = await getStudioSettings();
  const envMock = process.env.AI_MOCK_MODE;
  const mockMode =
    envMock === "true" ? true : envMock === "false" ? false : settings.mockMode;

  return {
    mockMode,
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || settings.baseUrl,
    modelName: process.env.OPENAI_MODEL?.trim() || settings.modelName,
    temperature: Number(process.env.OPENAI_TEMPERATURE ?? settings.temperature) || 0.4,
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  };
}

/** Public, non-secret view of provider status for Settings UI. */
export async function getAiProviderStatus() {
  const config = await getAiProviderConfig();
  const activeProvider =
    !config.mockMode && config.apiKeyConfigured ? "openai-compatible" : "mock";

  return {
    ...config,
    activeProvider,
    /** Never include the raw key — only whether the server env has one. */
    apiKeyStatus: config.apiKeyConfigured ? "configured" : "missing",
  };
}

export async function getAiProvider(): Promise<AiProvider> {
  const config = await getAiProviderConfig();

  if (!config.mockMode && config.apiKeyConfigured) {
    return new OpenAiCompatibleProvider({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
      baseUrl: config.baseUrl,
      modelName: config.modelName,
      temperature: config.temperature,
    });
  }

  return new MockAiProvider();
}
