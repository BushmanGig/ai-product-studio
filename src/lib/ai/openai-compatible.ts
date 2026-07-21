import type {
  AiProvider,
  BlueprintGeneration,
  BuildPackGeneration,
  DesignDnaGeneration,
  GenerationRequest,
} from "@/lib/ai/types";
import { MockAiProvider } from "@/lib/ai/mock-provider";

interface OpenAiCompatibleOptions {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  temperature: number;
}

async function chatJson<T>(
  options: OpenAiCompatibleOptions,
  system: string,
  user: string
): Promise<T> {
  const endpoint = `${options.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.modelName,
      temperature: options.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI-compatible provider failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI-compatible provider returned an empty response.");
  }

  return JSON.parse(content) as T;
}

function requestContext(request: GenerationRequest) {
  return JSON.stringify(
    {
      projectName: request.projectName,
      projectSummary: request.projectSummary,
      intake: request.intake ?? {},
      promptBody: request.promptBody ?? "",
      extraContext: request.extraContext ?? "",
    },
    null,
    2
  );
}

/**
 * OpenAI-compatible chat provider. Falls back to the mock provider if the
 * remote call fails so the studio remains usable during demos.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly id = "openai-compatible" as const;
  private readonly fallback = new MockAiProvider();

  constructor(private readonly options: OpenAiCompatibleOptions) {}

  async generateBlueprint(request: GenerationRequest): Promise<BlueprintGeneration> {
    try {
      return await chatJson<BlueprintGeneration>(
        this.options,
        "You are a product strategist. Return JSON with keys: vision, problemStatement, targetUsers, successMetrics, userStories, mvpScope, futureScope, risksAssumptions. Values must be concise markdown-friendly strings.",
        `Create a product blueprint from this studio intake:\n${requestContext(request)}`
      );
    } catch {
      return this.fallback.generateBlueprint(request);
    }
  }

  async generateDesignDna(request: GenerationRequest): Promise<DesignDnaGeneration> {
    try {
      return await chatJson<DesignDnaGeneration>(
        this.options,
        "You are a product designer. Return JSON with keys: designPrinciples, typography, colourDirection, spacing, componentStyle, motionStyle, accessibilityRequirements.",
        `Create Design DNA from this studio intake:\n${requestContext(request)}`
      );
    } catch {
      return this.fallback.generateDesignDna(request);
    }
  }

  async generateBuildPack(request: GenerationRequest): Promise<BuildPackGeneration> {
    try {
      return await chatJson<BuildPackGeneration>(
        this.options,
        "You are a technical product lead. Return JSON with keys: recommendedStack, architectureSummary, databaseEntities, pagesRoutes, milestonePlan, codingAgentPrompt, acceptanceCriteria, qaChecklist.",
        `Create a build pack from this studio intake:\n${requestContext(request)}`
      );
    } catch {
      return this.fallback.generateBuildPack(request);
    }
  }
}
