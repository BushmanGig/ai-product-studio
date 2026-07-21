export type GenerationKind =
  | "discovery"
  | "blueprint"
  | "design-dna"
  | "build-pack"
  | "qa-plan"
  | "launch-plan";

export interface AiProviderConfig {
  mockMode: boolean;
  baseUrl: string;
  modelName: string;
  temperature: number;
  /** Present only on the server; never sent to the browser. */
  apiKeyConfigured: boolean;
}

export interface GenerationRequest {
  kind: GenerationKind;
  projectName: string;
  projectSummary: string;
  intake?: {
    concept?: string;
    targetUser?: string;
    problem?: string;
    platform?: string;
    businessModel?: string;
    mustHaveFeatures?: string;
    visualInspirations?: string;
    technicalPreferences?: string;
    constraints?: string;
  };
  promptBody?: string;
  extraContext?: string;
}

export interface BlueprintGeneration {
  vision: string;
  problemStatement: string;
  targetUsers: string;
  successMetrics: string;
  userStories: string;
  mvpScope: string;
  futureScope: string;
  risksAssumptions: string;
}

export interface DesignDnaGeneration {
  designPrinciples: string;
  typography: string;
  colourDirection: string;
  spacing: string;
  componentStyle: string;
  motionStyle: string;
  accessibilityRequirements: string;
}

export interface BuildPackGeneration {
  recommendedStack: string;
  architectureSummary: string;
  databaseEntities: string;
  pagesRoutes: string;
  milestonePlan: string;
  codingAgentPrompt: string;
  acceptanceCriteria: string;
  qaChecklist: string;
}

export interface AiProvider {
  readonly id: "mock" | "openai-compatible";
  generateBlueprint(request: GenerationRequest): Promise<BlueprintGeneration>;
  generateDesignDna(request: GenerationRequest): Promise<DesignDnaGeneration>;
  generateBuildPack(request: GenerationRequest): Promise<BuildPackGeneration>;
}
