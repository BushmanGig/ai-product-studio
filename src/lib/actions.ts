"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAiProvider } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  BUILD_TASK_STATUSES,
  BUSINESS_MODELS,
  DESIGN_INSPIRATION_CATEGORIES,
  LAUNCH_STATUSES,
  PLATFORMS,
  PRIORITIES,
  PROJECT_STATUSES,
  PROMPT_CATEGORIES,
  STAGES,
  stageProgress,
} from "@/lib/constants";

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function optionalProjectId(formData: FormData) {
  const value = text(formData, "projectId");
  return value === "global" || !value ? null : value;
}

function safeValue<T extends readonly string[]>(value: string, values: T, fallback: T[number]) {
  return values.includes(value) ? value : fallback;
}

function revalidateStudio(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/new");
  revalidatePath("/blueprint");
  revalidatePath("/design-dna");
  revalidatePath("/build-pack");
  revalidatePath("/prompt-library");
  revalidatePath("/build-queue");
  revalidatePath("/qa-checklist");
  revalidatePath("/launch-plan");
  revalidatePath("/settings");
  if (slug) revalidatePath(`/projects/${slug}`);
}

async function logProjectActivity(projectId: string | null, type: string, message: string) {
  await prisma.activity.create({
    data: {
      projectId,
      type,
      message,
    },
  });
}

async function uniqueSlug(name: string) {
  let slug = slugify(name) || "project";
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  return slug;
}

function projectPalette() {
  const palette = ["#6366f1", "#0ea5e9", "#f97316", "#10b981", "#a855f7", "#ec4899"];
  return palette[Math.floor(Math.random() * palette.length)];
}

async function loadGenerationContext(projectId: string, promptId?: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { intake: true },
  });
  if (!project) return null;

  const prompt = promptId
    ? await prisma.prompt.findFirst({
        where: {
          id: promptId,
          archivedAt: null,
          OR: [{ projectId: null }, { projectId }],
        },
      })
    : null;

  return {
    project,
    promptBody: prompt?.body,
    request: {
      projectName: project.name,
      projectSummary: project.summary,
      intake: project.intake
        ? {
            concept: project.intake.concept,
            targetUser: project.intake.targetUser,
            problem: project.intake.problem,
            platform: project.intake.platform,
            businessModel: project.intake.businessModel,
            mustHaveFeatures: project.intake.mustHaveFeatures,
            visualInspirations: project.intake.visualInspirations,
            technicalPreferences: project.intake.technicalPreferences,
            constraints: project.intake.constraints,
          }
        : undefined,
      promptBody: prompt?.body,
    },
  };
}

export async function createProject(formData: FormData) {
  const name = text(formData, "name");
  const summary = text(formData, "summary");
  const stage = text(formData, "stage", "Idea");
  const priority = text(formData, "priority", "Medium");
  const nextAction = text(formData, "nextAction");

  if (!name) {
    return { ok: false as const, error: "Project name is required." };
  }

  const safeStage = safeValue(stage, STAGES, "Idea");
  const safePriority = safeValue(priority, PRIORITIES, "Medium");
  const slug = await uniqueSlug(name);

  const project = await prisma.project.create({
    data: {
      name,
      slug,
      summary: summary || "No summary yet — add one from the project page.",
      stage: safeStage,
      priority: safePriority,
      progress: stageProgress(safeStage),
      nextAction: nextAction || "Define the first discovery step",
      color: projectPalette(),
      blueprint: {
        create: {
          vision: "",
          targetUsers: "",
          problemStatement: summary,
          successMetrics: "",
          userStories: "",
          mvpScope: "",
          futureScope: "",
          risksAssumptions: "",
        },
      },
      designDna: { create: {} },
      buildPack: { create: {} },
      intake: {
        create: {
          concept: summary,
        },
      },
    },
  });

  await logProjectActivity(project.id, "idea", `Project "${name}" created`);

  revalidateStudio(project.slug);
  return { ok: true as const, id: project.id, slug: project.slug };
}

export async function createProjectFromIntake(formData: FormData) {
  const name = text(formData, "name");
  const concept = text(formData, "concept");
  const targetUser = text(formData, "targetUser");
  const problem = text(formData, "problem");
  const platform = safeValue(text(formData, "platform", "Web app"), PLATFORMS, "Web app");
  const businessModel = safeValue(
    text(formData, "businessModel", "Subscription"),
    BUSINESS_MODELS,
    "Subscription"
  );
  const mustHaveFeatures = text(formData, "mustHaveFeatures");
  const visualInspirations = text(formData, "visualInspirations");
  const technicalPreferences = text(formData, "technicalPreferences");
  const constraints = text(formData, "constraints");
  const priority = safeValue(text(formData, "priority", "Medium"), PRIORITIES, "Medium");

  if (!name) {
    return { ok: false as const, error: "Project name is required." };
  }
  if (!concept) {
    return { ok: false as const, error: "One-sentence concept is required." };
  }

  const slug = await uniqueSlug(name);
  const project = await prisma.project.create({
    data: {
      name,
      slug,
      summary: concept,
      stage: "Discovery",
      priority,
      progress: stageProgress("Discovery"),
      nextAction: "Generate the product blueprint from intake",
      color: projectPalette(),
      intake: {
        create: {
          concept,
          targetUser,
          problem,
          platform,
          businessModel,
          mustHaveFeatures,
          visualInspirations,
          technicalPreferences,
          constraints,
        },
      },
      blueprint: {
        create: {
          vision: "",
          targetUsers: targetUser,
          problemStatement: problem || concept,
          successMetrics: "",
          userStories: "",
          mvpScope: mustHaveFeatures,
          futureScope: "",
          risksAssumptions: constraints,
        },
      },
      designDna: {
        create: {
          colourDirection: visualInspirations,
        },
      },
      buildPack: {
        create: {
          recommendedStack: technicalPreferences,
        },
      },
    },
  });

  await logProjectActivity(project.id, "discovery", `Intake captured for "${name}"`);
  revalidateStudio(project.slug);
  redirect(`/projects/${project.slug}`);
}

export async function updateProject(formData: FormData) {
  const projectId = text(formData, "projectId");
  const name = text(formData, "name");
  const summary = text(formData, "summary");
  const stage = safeValue(text(formData, "stage", "Idea"), STAGES, "Idea");
  const priority = safeValue(text(formData, "priority", "Medium"), PRIORITIES, "Medium");
  const status = safeValue(text(formData, "status", "Active"), PROJECT_STATUSES, "Active");
  const nextAction = text(formData, "nextAction");

  if (!projectId || !name) {
    return;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      summary,
      stage,
      priority,
      status,
      progress: stageProgress(stage),
      nextAction,
      archivedAt: status === "Archived" ? new Date() : null,
    },
  });

  await logProjectActivity(project.id, "update", `Project "${project.name}" edited`);
  revalidateStudio(project.slug);
}

export async function toggleQaItem(id: string, checked: boolean) {
  const item = await prisma.qaItem.update({
    where: { id },
    data: { checked },
    include: { project: true },
  });

  await logProjectActivity(
    item.projectId,
    "qa",
    checked ? `QA item completed: ${item.label}` : `QA item reopened: ${item.label}`
  );

  revalidateStudio(item.project.slug);
  return { ok: true };
}

export async function advanceStage(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const index = STAGES.indexOf(project.stage as never);
  const nextIndex = Math.min(index + 1, STAGES.length - 1);
  const nextStage = STAGES[nextIndex];

  await prisma.project.update({
    where: { id: projectId },
    data: {
      stage: nextStage,
      progress: stageProgress(nextStage),
    },
  });

  await logProjectActivity(projectId, "milestone", `Advanced to ${nextStage}`);

  revalidateStudio(project.slug);
  return { ok: true };
}

export async function archiveProject(formData: FormData) {
  const projectId = text(formData, "projectId");
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "Archived", archivedAt: new Date() },
  });

  await logProjectActivity(project.id, "archive", `Project "${project.name}" archived`);
  revalidateStudio(project.slug);
  redirect("/projects");
}

export async function deleteProject(formData: FormData) {
  const projectId = text(formData, "projectId");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    redirect("/projects");
  }

  await logProjectActivity(null, "delete", `Project "${project.name}" deleted`);
  await prisma.project.delete({ where: { id: projectId } });
  revalidateStudio(project.slug);
  redirect("/projects");
}

export async function saveBlueprint(formData: FormData) {
  const projectId = text(formData, "projectId");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const data = {
    vision: text(formData, "vision"),
    targetUsers: text(formData, "targetUsers"),
    problemStatement: text(formData, "problemStatement"),
    successMetrics: text(formData, "successMetrics"),
    userStories: text(formData, "userStories"),
    mvpScope: text(formData, "mvpScope"),
    futureScope: text(formData, "futureScope"),
    risksAssumptions: text(formData, "risksAssumptions"),
  };

  await prisma.blueprint.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await logProjectActivity(projectId, "prd", "Product blueprint updated");
  revalidateStudio(project.slug);
}

export async function generateBlueprint(formData: FormData) {
  const projectId = text(formData, "projectId");
  const promptId = text(formData, "promptId");
  const context = await loadGenerationContext(projectId, promptId || undefined);
  if (!context) return { ok: false as const, error: "Project not found." };

  const provider = await getAiProvider();
  const generated = await provider.generateBlueprint({
    ...context.request,
    kind: "blueprint",
  });

  await prisma.blueprint.upsert({
    where: { projectId },
    update: generated,
    create: { projectId, ...generated },
  });

  if (["Idea", "Discovery"].includes(context.project.stage)) {
    await prisma.project.update({
      where: { id: projectId },
      data: { stage: "PRD", progress: stageProgress("PRD"), nextAction: "Review and edit the generated blueprint" },
    });
  }

  await logProjectActivity(
    projectId,
    "prd",
    `Blueprint generated via ${provider.id}${context.promptBody ? " with selected prompt" : ""}`
  );
  revalidateStudio(context.project.slug);
  return { ok: true as const, provider: provider.id };
}

export async function saveDesignDna(formData: FormData) {
  const projectId = text(formData, "projectId");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const data = {
    designPrinciples: text(formData, "designPrinciples"),
    typography: text(formData, "typography"),
    colourDirection: text(formData, "colourDirection"),
    spacing: text(formData, "spacing"),
    componentStyle: text(formData, "componentStyle"),
    motionStyle: text(formData, "motionStyle"),
    accessibilityRequirements: text(formData, "accessibilityRequirements"),
  };

  await prisma.designDna.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await logProjectActivity(projectId, "design", "Design DNA updated");
  revalidateStudio(project.slug);
}

export async function generateDesignDna(formData: FormData) {
  const projectId = text(formData, "projectId");
  const promptId = text(formData, "promptId");
  const context = await loadGenerationContext(projectId, promptId || undefined);
  if (!context) return { ok: false as const, error: "Project not found." };

  const provider = await getAiProvider();
  const generated = await provider.generateDesignDna({
    ...context.request,
    kind: "design-dna",
  });

  await prisma.designDna.upsert({
    where: { projectId },
    update: generated,
    create: { projectId, ...generated },
  });

  if (["Idea", "Discovery", "PRD"].includes(context.project.stage)) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: "Design DNA",
        progress: stageProgress("Design DNA"),
        nextAction: "Add inspirations and refine Design DNA",
      },
    });
  }

  await logProjectActivity(
    projectId,
    "design",
    `Design DNA generated via ${provider.id}${context.promptBody ? " with selected prompt" : ""}`
  );
  revalidateStudio(context.project.slug);
  return { ok: true as const, provider: provider.id };
}

export async function createDesignInspiration(formData: FormData) {
  const projectId = text(formData, "projectId");
  const sourceUrl = text(formData, "sourceUrl");
  const likes = text(formData, "likes");
  if (!projectId || (!sourceUrl && !likes)) {
    return;
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  await prisma.designInspiration.create({
    data: {
      projectId,
      sourceUrl,
      imageRef: text(formData, "imageRef"),
      notes: text(formData, "notes"),
      likes,
      category: safeValue(
        text(formData, "category", "layout"),
        DESIGN_INSPIRATION_CATEGORIES,
        "layout"
      ),
    },
  });

  await logProjectActivity(projectId, "design", "Design inspiration added");
  revalidateStudio(project.slug);
}

export async function deleteDesignInspiration(formData: FormData) {
  const inspirationId = text(formData, "inspirationId");
  const inspiration = await prisma.designInspiration.delete({
    where: { id: inspirationId },
    include: { project: true },
  });
  await logProjectActivity(inspiration.projectId, "design", "Design inspiration removed");
  revalidateStudio(inspiration.project.slug);
}

export async function saveBuildPack(formData: FormData) {
  const projectId = text(formData, "projectId");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const data = {
    recommendedStack: text(formData, "recommendedStack"),
    architectureSummary: text(formData, "architectureSummary"),
    databaseEntities: text(formData, "databaseEntities"),
    pagesRoutes: text(formData, "pagesRoutes"),
    milestonePlan: text(formData, "milestonePlan"),
    codingAgentPrompt: text(formData, "codingAgentPrompt"),
    acceptanceCriteria: text(formData, "acceptanceCriteria"),
    qaChecklist: text(formData, "qaChecklist"),
  };

  await prisma.buildPack.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await logProjectActivity(projectId, "build", "Build pack updated");
  revalidateStudio(project.slug);
}

export async function generateBuildPack(formData: FormData) {
  const projectId = text(formData, "projectId");
  const promptId = text(formData, "promptId");
  const context = await loadGenerationContext(projectId, promptId || undefined);
  if (!context) return { ok: false as const, error: "Project not found." };

  const provider = await getAiProvider();
  const generated = await provider.generateBuildPack({
    ...context.request,
    kind: "build-pack",
  });

  await prisma.buildPack.upsert({
    where: { projectId },
    update: generated,
    create: { projectId, ...generated },
  });

  const stageIndex = STAGES.indexOf(context.project.stage as never);
  const buildPackIndex = STAGES.indexOf("Build Pack");
  if (stageIndex >= 0 && stageIndex < buildPackIndex) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: "Build Pack",
        progress: stageProgress("Build Pack"),
        nextAction: "Review the build pack and start engineering tasks",
      },
    });
  }

  await logProjectActivity(
    projectId,
    "build",
    `Build pack generated via ${provider.id}${context.promptBody ? " with selected prompt" : ""}`
  );
  revalidateStudio(context.project.slug);
  return { ok: true as const, provider: provider.id };
}

export async function saveAiSettings(formData: FormData) {
  const mockMode = formData.get("mockMode") === "on";
  const baseUrl = text(formData, "baseUrl", "https://api.openai.com/v1") || "https://api.openai.com/v1";
  const modelName = text(formData, "modelName", "gpt-4o-mini") || "gpt-4o-mini";
  const temperatureRaw = Number(text(formData, "temperature", "0.4"));
  const temperature = Number.isFinite(temperatureRaw)
    ? Math.min(2, Math.max(0, temperatureRaw))
    : 0.4;

  await prisma.studioSettings.upsert({
    where: { id: "default" },
    update: { mockMode, baseUrl, modelName, temperature },
    create: { id: "default", mockMode, baseUrl, modelName, temperature },
  });

  await logProjectActivity(null, "settings", "AI provider settings updated");
  revalidatePath("/settings");
  revalidateStudio();
}

export async function createPrompt(formData: FormData) {
  const title = text(formData, "title");
  const body = text(formData, "body");
  const category = safeValue(text(formData, "category", "Discovery"), PROMPT_CATEGORIES, "Discovery");
  const projectId = optionalProjectId(formData);

  if (!title || !body) return;

  const prompt = await prisma.prompt.create({
    data: {
      title,
      category,
      body,
      tags: text(formData, "tags"),
      projectId,
    },
    include: { project: true },
  });

  if (prompt.projectId) {
    await logProjectActivity(prompt.projectId, "prompt", `Prompt "${prompt.title}" created`);
  }
  revalidateStudio(prompt.project?.slug);
}

export async function updatePrompt(formData: FormData) {
  const id = text(formData, "promptId");
  const title = text(formData, "title");
  const body = text(formData, "body");
  const category = safeValue(text(formData, "category", "Discovery"), PROMPT_CATEGORIES, "Discovery");
  const projectId = optionalProjectId(formData);

  if (!id || !title || !body) return;

  const prompt = await prisma.prompt.update({
    where: { id },
    data: {
      title,
      category,
      body,
      tags: text(formData, "tags"),
      projectId,
    },
    include: { project: true },
  });

  if (prompt.projectId) {
    await logProjectActivity(prompt.projectId, "prompt", `Prompt "${prompt.title}" edited`);
  }
  revalidateStudio(prompt.project?.slug);
}

export async function archivePrompt(formData: FormData) {
  const prompt = await prisma.prompt.update({
    where: { id: text(formData, "promptId") },
    data: { archivedAt: new Date() },
    include: { project: true },
  });
  if (prompt.projectId) {
    await logProjectActivity(prompt.projectId, "prompt", `Prompt "${prompt.title}" archived`);
  }
  revalidateStudio(prompt.project?.slug);
}

export async function deletePrompt(formData: FormData) {
  const prompt = await prisma.prompt.delete({
    where: { id: text(formData, "promptId") },
    include: { project: true },
  });
  if (prompt.projectId) {
    await logProjectActivity(prompt.projectId, "prompt", `Prompt "${prompt.title}" deleted`);
  }
  revalidateStudio(prompt.project?.slug);
}

export async function createBuildTask(formData: FormData) {
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  if (!projectId || !title) return;

  const task = await prisma.buildTask.create({
    data: {
      projectId,
      title,
      status: safeValue(text(formData, "status", "Backlog"), BUILD_TASK_STATUSES, "Backlog"),
      priority: safeValue(text(formData, "priority", "Medium"), PRIORITIES, "Medium"),
      estimate: text(formData, "estimate"),
    },
    include: { project: true },
  });

  await logProjectActivity(projectId, "build", `Build task created: ${task.title}`);
  revalidateStudio(task.project.slug);
}

export async function updateBuildTask(formData: FormData) {
  const taskId = text(formData, "taskId");
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  if (!taskId || !projectId || !title) {
    return;
  }

  const task = await prisma.buildTask.update({
    where: { id: taskId },
    data: {
      projectId,
      title,
      status: safeValue(text(formData, "status", "Backlog"), BUILD_TASK_STATUSES, "Backlog"),
      priority: safeValue(text(formData, "priority", "Medium"), PRIORITIES, "Medium"),
      estimate: text(formData, "estimate"),
    },
    include: { project: true },
  });

  await logProjectActivity(task.projectId, "build", `Build task edited: ${task.title}`);
  revalidateStudio(task.project.slug);
}

export async function archiveBuildTask(formData: FormData) {
  const task = await prisma.buildTask.update({
    where: { id: text(formData, "taskId") },
    data: { archivedAt: new Date() },
    include: { project: true },
  });
  await logProjectActivity(task.projectId, "build", `Build task archived: ${task.title}`);
  revalidateStudio(task.project.slug);
}

export async function createQaItem(formData: FormData) {
  const projectId = text(formData, "projectId");
  const label = text(formData, "label");
  if (!projectId || !label) return;

  const item = await prisma.qaItem.create({
    data: {
      projectId,
      label,
      category: text(formData, "category", "General"),
      checked: formData.get("checked") === "on",
    },
    include: { project: true },
  });

  await logProjectActivity(projectId, "qa", `QA item created: ${item.label}`);
  revalidateStudio(item.project.slug);
}

export async function updateQaItem(formData: FormData) {
  const itemId = text(formData, "itemId");
  const projectId = text(formData, "projectId");
  const label = text(formData, "label");
  if (!itemId || !projectId || !label) return;

  const item = await prisma.qaItem.update({
    where: { id: itemId },
    data: {
      projectId,
      label,
      category: text(formData, "category", "General"),
      checked: formData.get("checked") === "on",
    },
    include: { project: true },
  });

  await logProjectActivity(projectId, "qa", `QA item edited: ${item.label}`);
  revalidateStudio(item.project.slug);
}

export async function archiveQaItem(formData: FormData) {
  const item = await prisma.qaItem.update({
    where: { id: text(formData, "itemId") },
    data: { archivedAt: new Date() },
    include: { project: true },
  });
  await logProjectActivity(item.projectId, "qa", `QA item archived: ${item.label}`);
  revalidateStudio(item.project.slug);
}

export async function createLaunchItem(formData: FormData) {
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  if (!projectId || !title) return;

  const item = await prisma.launchItem.create({
    data: {
      projectId,
      title,
      channel: text(formData, "channel", "Launch"),
      dueLabel: text(formData, "dueLabel"),
      status: safeValue(text(formData, "status", "Planned"), LAUNCH_STATUSES, "Planned"),
    },
    include: { project: true },
  });

  await logProjectActivity(projectId, "launch", `Launch item created: ${item.title}`);
  revalidateStudio(item.project.slug);
}

export async function updateLaunchItem(formData: FormData) {
  const itemId = text(formData, "itemId");
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  if (!itemId || !projectId || !title) {
    return;
  }

  const item = await prisma.launchItem.update({
    where: { id: itemId },
    data: {
      projectId,
      title,
      channel: text(formData, "channel", "Launch"),
      dueLabel: text(formData, "dueLabel"),
      status: safeValue(text(formData, "status", "Planned"), LAUNCH_STATUSES, "Planned"),
    },
    include: { project: true },
  });

  await logProjectActivity(projectId, "launch", `Launch item edited: ${item.title}`);
  revalidateStudio(item.project.slug);
}

export async function archiveLaunchItem(formData: FormData) {
  const item = await prisma.launchItem.update({
    where: { id: text(formData, "itemId") },
    data: { archivedAt: new Date() },
    include: { project: true },
  });
  await logProjectActivity(item.projectId, "launch", `Launch item archived: ${item.title}`);
  revalidateStudio(item.project.slug);
}
