import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // Clean slate so the seed is idempotent.
  await prisma.activity.deleteMany();
  await prisma.designInspiration.deleteMany();
  await prisma.designDna.deleteMany();
  await prisma.buildPack.deleteMany();
  await prisma.projectIntake.deleteMany();
  await prisma.blueprint.deleteMany();
  await prisma.buildTask.deleteMany();
  await prisma.qaItem.deleteMany();
  await prisma.launchItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.project.deleteMany();
  await prisma.studioSettings.deleteMany();

  await prisma.studioSettings.create({
    data: {
      id: "default",
      mockMode: true,
      baseUrl: "https://api.openai.com/v1",
      modelName: "gpt-4o-mini",
      temperature: 0.4,
    },
  });

  const projects = [
    {
      name: "AI Product Studio",
      summary:
        "Internal cockpit that moves app ideas from concept to launch with a repeatable workflow.",
      stage: "Engineering",
      priority: "Critical",
      progress: 68,
      nextAction: "Wire the dashboard to live project data",
      color: "#6366f1",
    },
    {
      name: "AlphaCall CRM",
      summary:
        "Lightweight CRM for high-volume outbound sales teams with AI call summaries.",
      stage: "Build Pack",
      priority: "High",
      progress: 44,
      nextAction: "Finalise the call-logging data model",
      color: "#0ea5e9",
    },
    {
      name: "Salty Dreads",
      summary:
        "Ecommerce storefront and booking flow for a coastal hair-braiding studio.",
      stage: "Design DNA",
      priority: "Medium",
      progress: 30,
      nextAction: "Lock the colour palette and type scale",
      color: "#f97316",
    },
    {
      name: "Senior Grocery Scanner",
      summary:
        "Accessible mobile app that scans groceries and reads prices aloud for seniors.",
      stage: "Discovery",
      priority: "High",
      progress: 18,
      nextAction: "Run 5 accessibility interviews",
      color: "#10b981",
    },
    {
      name: "TradingView Indicator Suite",
      summary:
        "Pack of premium Pine Script indicators with a marketing site and licensing.",
      stage: "Idea",
      priority: "Low",
      progress: 8,
      nextAction: "Draft the one-page concept brief",
      color: "#a855f7",
    },
  ];

  const created: Record<string, string> = {};

  for (const p of projects) {
    const project = await prisma.project.create({
      data: { ...p, slug: slugify(p.name) },
    });
    created[p.name] = project.id;

    await prisma.projectIntake.create({
      data: {
        projectId: project.id,
        concept: p.summary,
        targetUser: "Founders, product leads, and builders shipping quickly",
        problem: p.summary,
        platform: "Web app",
        businessModel: "Internal tool",
        mustHaveFeatures: "Intake, blueprint, design DNA, build pack, prompt library",
        visualInspirations: "Calm studio dashboards with strong hierarchy",
        technicalPreferences: "Next.js, TypeScript, Prisma, Tailwind",
        constraints: "Must work offline-friendly in local mock mode without API keys",
      },
    });

    await prisma.blueprint.create({
      data: {
        projectId: project.id,
        vision: `${p.name} should give the studio a crisp path from idea to shipped product.`,
        targetUsers:
          "Founders, product leads, designers, and builders moving quickly from concept to launch.",
        problemStatement: p.summary,
        successMetrics:
          "Clear next action, active build queue, QA readiness, and launch confidence.",
        userStories:
          "As a studio lead, I can see the current stage and next action so I know where to focus.",
        mvpScope:
          "Discovery notes, PRD sections, design direction, build tasks, QA checks, and launch steps.",
        futureScope: "Multi-user collaboration, PDF export, and live provider routing.",
        risksAssumptions:
          "The workflow must stay lightweight enough that teams keep it updated each sprint.",
      },
    });

    await prisma.designDna.create({
      data: {
        projectId: project.id,
        designPrinciples: "Clarity over decoration. One primary action per view.",
        typography: "Geometric sans for titles, readable system sans for body copy.",
        colourDirection: `Accent anchored on ${p.color} with calm neutrals.`,
        spacing: "4 / 8 / 12 / 16 / 24 / 32 rhythm",
        componentStyle: "Soft radii, hairline borders, quiet elevation.",
        motionStyle: "Short fade/slide transitions on page entry and generate feedback.",
        accessibilityRequirements: "AA contrast, keyboard reachability, visible focus states.",
      },
    });

    await prisma.buildPack.create({
      data: {
        projectId: project.id,
        recommendedStack: "Next.js App Router, TypeScript, Tailwind, Prisma",
        architectureSummary:
          "Single Next.js service with Server Actions and a server-only AI provider layer.",
        databaseEntities: "Project, Intake, Blueprint, DesignDna, BuildPack, Prompt",
        pagesRoutes: "/projects/new, /blueprint, /design-dna, /build-pack, /settings",
        milestonePlan: "Intake → Blueprint → Design DNA → Build Pack → Engineering",
        codingAgentPrompt: `Build ${p.name} as a focused MVP using the studio workflow artifacts.`,
        acceptanceCriteria: "Generated artifacts are editable, copyable, and project-specific.",
        qaChecklist: "Intake, generate, edit, copy, and settings key-status checks.",
      },
    });
  }

  await prisma.designInspiration.create({
    data: {
      projectId: created["Salty Dreads"],
      sourceUrl: "https://example.com/coastal-studio",
      imageRef: "moodboard-coastal.png",
      notes: "Soft sand neutrals with ocean accent moments.",
      likes: "Warm photography paired with restrained type",
      category: "branding",
    },
  });

  const activities = [
    ["AI Product Studio", "milestone", "Engineering sprint kicked off"],
    ["AI Product Studio", "update", "Dashboard layout approved in review"],
    ["AlphaCall CRM", "update", "Build pack drafted for call logging"],
    ["Salty Dreads", "design", "Design DNA moodboard shared with client"],
    ["Senior Grocery Scanner", "research", "Discovery interviews scheduled"],
    ["TradingView Indicator Suite", "idea", "New idea captured from backlog"],
    ["AI Product Studio", "qa", "QA checklist created for v1"],
  ];

  for (const [name, type, message] of activities) {
    await prisma.activity.create({
      data: { projectId: created[name], type, message },
    });
  }

  const buildTasks = [
    ["AI Product Studio", "Build responsive sidebar navigation", "Done", "High", "M"],
    ["AI Product Studio", "Implement project cards + progress", "In Progress", "High", "M"],
    ["AI Product Studio", "Wire Today panel to next actions", "Ready", "Critical", "S"],
    ["AlphaCall CRM", "Design call-log schema", "In Progress", "High", "M"],
    ["AlphaCall CRM", "AI summary prompt integration", "Backlog", "Medium", "L"],
    ["Salty Dreads", "Booking flow wireframes", "Backlog", "Medium", "M"],
    ["Senior Grocery Scanner", "Barcode scan spike", "Backlog", "High", "L"],
  ];

  for (const [name, title, status, priority, estimate] of buildTasks) {
    await prisma.buildTask.create({
      data: { projectId: created[name], title, status, priority, estimate },
    });
  }

  const qaItems: [string, string, string, boolean][] = [
    ["AI Product Studio", "Accessibility", "All interactive elements are keyboard reachable", true],
    ["AI Product Studio", "Accessibility", "Colour contrast passes AA", true],
    ["AI Product Studio", "Responsive", "Layout works from 360px to 1440px", false],
    ["AI Product Studio", "Data", "Empty states render for every list", false],
    ["AI Product Studio", "Performance", "Largest Contentful Paint under 2.5s", false],
    ["AlphaCall CRM", "Data", "Call records persist correctly", false],
    ["AlphaCall CRM", "Security", "PII fields are masked in logs", false],
  ];

  for (const [name, category, label, checked] of qaItems) {
    await prisma.qaItem.create({
      data: { projectId: created[name], category, label, checked },
    });
  }

  const launchItems = [
    ["AI Product Studio", "Internal", "Roll out to the studio team", "In Progress", "This week"],
    ["AI Product Studio", "Docs", "Publish workflow handbook", "Planned", "Next week"],
    ["AlphaCall CRM", "Beta", "Invite 3 pilot sales teams", "Planned", "2 weeks"],
    ["Salty Dreads", "Social", "Launch teaser on Instagram", "Planned", "TBD"],
  ];

  for (const [name, channel, title, status, dueLabel] of launchItems) {
    await prisma.launchItem.create({
      data: { projectId: created[name], channel, title, status, dueLabel },
    });
  }

  const reviews = [
    ["AI Product Studio", "Dashboard visual polish", "Design", "Approved", "Studio Lead"],
    ["AI Product Studio", "Project data model", "Engineering", "Awaiting review", "Tech Lead"],
    ["AlphaCall CRM", "Call summary copy", "Content", "Changes requested", "Marketing"],
    ["Salty Dreads", "Brand palette", "Design", "Awaiting review", "Client"],
  ];

  for (const [name, title, kind, status, reviewer] of reviews) {
    await prisma.review.create({
      data: { projectId: created[name], title, kind, status, reviewer },
    });
  }

  const prompts = [
    {
      title: "Concept brief generator",
      category: "Discovery",
      body: "You are a product strategist. Turn this raw idea into a one-page concept brief with problem, target user, value proposition, and 3 risky assumptions.\n\nIdea: {{idea}}",
      tags: "brief,strategy",
    },
    {
      title: "Discovery interview script",
      category: "Discovery",
      body: "Write a 20-minute customer discovery interview script for {{persona}} exploring the problem of {{problem}}. Keep questions open, non-leading, and JTBD-focused.",
      tags: "research,interviews",
    },
    {
      title: "PRD scaffold",
      category: "PRD",
      body: "Draft a PRD for {{feature}} including goals, non-goals, user stories, success metrics, and rollout plan. Be concise and skimmable.",
      tags: "prd,spec",
    },
    {
      title: "Design DNA extractor",
      category: "Design DNA",
      body: "Given the brand adjectives {{adjectives}}, propose a colour palette, type scale, spacing system, and 3 reference products with a similar feel.",
      tags: "design,tokens",
    },
    {
      title: "Build pack decomposer",
      category: "Build Pack",
      body: "Break {{feature}} into a build pack of small, independently shippable tasks with clear acceptance criteria and rough estimates.",
      tags: "planning,tasks",
    },
    {
      title: "QA checklist builder",
      category: "QA",
      body: "Generate a QA checklist for {{feature}} covering functionality, accessibility, responsive behaviour, edge cases, and performance.",
      tags: "qa,checklist",
    },
    {
      title: "Launch announcement planner",
      category: "Launch",
      body: "Create a launch announcement plan for {{product}} with audience, channels, proof points, timeline, and post-launch follow-up.",
      tags: "launch,gtm",
      projectId: created["AI Product Studio"],
    },
  ];

  for (const prompt of prompts) {
    await prisma.prompt.create({ data: prompt });
  }

  console.log("Seed complete:");
  console.log(`  ${projects.length} projects`);
  console.log(`  ${prompts.length} prompts`);
  console.log("  studio settings (mock mode on)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
