import type {
  AiProvider,
  BlueprintGeneration,
  BuildPackGeneration,
  DesignDnaGeneration,
  GenerationRequest,
} from "@/lib/ai/types";

function line(label: string, value?: string) {
  return value?.trim() ? `${label}: ${value.trim()}` : null;
}

function contextBlock(request: GenerationRequest) {
  const intake = request.intake ?? {};
  return [
    line("Project", request.projectName),
    line("Summary", request.projectSummary),
    line("Concept", intake.concept),
    line("Target user", intake.targetUser),
    line("Problem", intake.problem),
    line("Platform", intake.platform),
    line("Business model", intake.businessModel),
    line("Must-haves", intake.mustHaveFeatures),
    line("Visual inspirations", intake.visualInspirations),
    line("Technical preferences", intake.technicalPreferences),
    line("Constraints", intake.constraints),
    request.promptBody ? `Selected prompt guidance:\n${request.promptBody}` : null,
    request.extraContext ? `Extra context:\n${request.extraContext}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export class MockAiProvider implements AiProvider {
  readonly id = "mock" as const;

  async generateBlueprint(request: GenerationRequest): Promise<BlueprintGeneration> {
    const name = request.projectName;
    const user = request.intake?.targetUser || "early adopters who feel the pain daily";
    const problem =
      request.intake?.problem ||
      request.projectSummary ||
      "an unclear path from idea to a shippable product";
    const features =
      request.intake?.mustHaveFeatures ||
      "guided intake, living blueprint, design DNA, and a build pack";

    return {
      vision: `${name} helps teams turn a sharp product concept into a repeatable path from discovery to launch — without losing craft or momentum.\n\nContext used:\n${contextBlock(request)}`,
      problemStatement: `People who need ${name} struggle with ${problem}. Existing tools are either too vague or too heavy, so ideas stall before they become usable products.`,
      targetUsers: `Primary users: ${user}. Secondary users: product leads, designers, and builders who collaborate on the same project record.`,
      successMetrics:
        "- Time from idea capture to first blueprint draft under 15 minutes\n- Every active project has a clear next action\n- MVP scope stays under a one-sprint build pack\n- QA checklist coverage before launch is 100%",
      userStories: [
        `As a founder, I can capture the concept for ${name} so the team shares one source of truth.`,
        "As a product lead, I can generate and edit a blueprint so discovery becomes an actionable PRD.",
        "As a builder, I can open a build pack with stack, routes, and acceptance criteria so coding starts with clarity.",
      ].join("\n"),
      mvpScope: `MVP includes: ${features}. Core screens: project intake, blueprint, design DNA, build pack, and prompt library integration.`,
      futureScope:
        "Future scope: live OpenAI/Anthropic providers, multi-user collaboration, exportable PRD/PDF packs, and automated launch checklists from generated QA items.",
      risksAssumptions:
        "- Assumption: a mock/demo provider is enough for early workflow validation\n- Risk: generated scope may be too broad without human editing\n- Risk: design inspirations stay vague without concrete references\n- Mitigation: keep every generated section editable and project-specific",
    };
  }

  async generateDesignDna(request: GenerationRequest): Promise<DesignDnaGeneration> {
    const vibe =
      request.intake?.visualInspirations ||
      "calm studio tooling with strong hierarchy and generous whitespace";

    return {
      designPrinciples: `1. Clarity over decoration\n2. One primary action per view\n3. Premium restraint inspired by: ${vibe}\n4. Every generated artifact stays editable`,
      typography:
        "Display: crisp geometric sans for product name and page titles.\nBody: highly readable system sans for dense product specs.\nMono: used sparingly for prompts, stacks, and copyable build artifacts.",
      colourDirection:
        "Base: soft neutral canvas with deep ink text.\nAccent: restrained indigo for primary actions.\nSupport: sky for information, emerald for success, amber for caution.\nAvoid neon glows and purple-on-white clichés.",
      spacing:
        "4 / 8 / 12 / 16 / 24 / 32 rhythm.\nCards and forms use 16–24px internal padding.\nSection gaps stay at 24–32px for calm scanning.",
      componentStyle:
        "Soft 8–12px radii, hairline borders, quiet shadows only on elevated dialogs.\nButtons are solid primary or outline secondary — no pill clusters.\nForms favour labelled native controls with clear focus rings.",
      motionStyle:
        "Subtle fade/slide on page entry (150–220ms).\nCopy and generate actions show immediate feedback states.\nNo looping decorative motion.",
      accessibilityRequirements:
        "- Colour contrast AA for text and controls\n- Keyboard reachability for intake, generate, and copy actions\n- Visible focus states\n- Meaningful labels on every form field\n- No information conveyed by colour alone",
    };
  }

  async generateBuildPack(request: GenerationRequest): Promise<BuildPackGeneration> {
    const stackHint =
      request.intake?.technicalPreferences ||
      "Next.js App Router, TypeScript, Tailwind, Prisma";
    const platform = request.intake?.platform || "web";

    return {
      recommendedStack: `${stackHint}. Deploy target: ${platform}. ORM-ready for SQLite locally and PostgreSQL/Supabase in production.`,
      architectureSummary: `${request.projectName} is a single Next.js app with Server Components for reads, Server Actions for mutations, and a server-only AI provider layer. Domain records (intake, blueprint, design DNA, build pack) hang off Project.`,
      databaseEntities:
        "- Project\n- ProjectIntake\n- Blueprint\n- DesignDna + DesignInspiration\n- BuildPack\n- Prompt\n- BuildTask / QaItem / LaunchItem\n- StudioSettings (non-secret AI prefs)",
      pagesRoutes:
        "- /projects/new — guided intake\n- /projects/[slug] — project cockpit\n- /blueprint — PRD generation + edit\n- /design-dna — project design system + inspirations\n- /build-pack — stack, milestones, coding-agent prompt\n- /prompt-library — reusable prompts\n- /settings — AI provider status",
      milestonePlan:
        "M1: Intake + project creation\nM2: Blueprint generation/editing\nM3: Design DNA + inspirations\nM4: Build pack + prompt selection\nM5: QA/launch packaging and provider hardening",
      codingAgentPrompt: `You are building ${request.projectName}.\n\nGoal: ${request.projectSummary || request.intake?.concept || "ship a focused MVP"}.\nPlatform: ${platform}.\nStack: ${stackHint}.\nMust-haves: ${request.intake?.mustHaveFeatures || "core workflow screens"}.\nConstraints: ${request.intake?.constraints || "keep the surface area small and editable"}.\n\nImplement only the MVP scope, prefer server-side mutations, and keep AI keys off the client.`,
      acceptanceCriteria:
        "- Intake creates a project and persists all answers\n- Blueprint/Design DNA/Build Pack can be generated in mock mode without an API key\n- Generated content is editable and saved per project\n- Prompts can be selected for generation and copied with feedback\n- Settings show API key status without exposing the key",
      qaChecklist:
        "- Intake validation rejects empty project name\n- Generate Blueprint works in mock mode\n- Edit + save blueprint persists\n- Design inspiration can be added with category\n- Build pack generate + copy works\n- No API keys appear in client bundles or SQLite",
    };
  }
}
