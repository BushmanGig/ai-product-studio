"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  BUILD_TASK_STATUSES,
  LAUNCH_STATUSES,
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
  revalidatePath("/blueprint");
  revalidatePath("/prompt-library");
  revalidatePath("/build-queue");
  revalidatePath("/qa-checklist");
  revalidatePath("/launch-plan");
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

export async function createProject(formData: FormData) {
  const name = text(formData, "name");
  const summary = text(formData, "summary");
  const stage = text(formData, "stage", "Idea");
  const priority = text(formData, "priority", "Medium");
  const nextAction = text(formData, "nextAction");

  if (!name) {
    return { ok: false, error: "Project name is required." };
  }

  const safeStage = safeValue(stage, STAGES, "Idea");
  const safePriority = safeValue(priority, PRIORITIES, "Medium");
  let slug = slugify(name) || "project";

  // Ensure slug uniqueness.
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const palette = ["#6366f1", "#0ea5e9", "#f97316", "#10b981", "#a855f7", "#ec4899"];
  const color = palette[Math.floor(Math.random() * palette.length)];

  const project = await prisma.project.create({
    data: {
      name,
      slug,
      summary: summary || "No summary yet — add one from the project page.",
      stage: safeStage,
      priority: safePriority,
      progress: stageProgress(safeStage),
      nextAction: nextAction || "Define the first discovery step",
      color,
      blueprint: {
        create: {
          vision: "",
          targetUsers: "",
          problemStatement: summary,
          successMetrics: "",
          userStories: "",
          featureScope: "",
          risksAssumptions: "",
        },
      },
    },
  });

  await logProjectActivity(project.id, "idea", `Project "${name}" created`);

  revalidateStudio(project.slug);
  return { ok: true, id: project.id };
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

  await prisma.blueprint.upsert({
    where: { projectId },
    update: {
      vision: text(formData, "vision"),
      targetUsers: text(formData, "targetUsers"),
      problemStatement: text(formData, "problemStatement"),
      successMetrics: text(formData, "successMetrics"),
      userStories: text(formData, "userStories"),
      featureScope: text(formData, "featureScope"),
      risksAssumptions: text(formData, "risksAssumptions"),
    },
    create: {
      projectId,
      vision: text(formData, "vision"),
      targetUsers: text(formData, "targetUsers"),
      problemStatement: text(formData, "problemStatement"),
      successMetrics: text(formData, "successMetrics"),
      userStories: text(formData, "userStories"),
      featureScope: text(formData, "featureScope"),
      risksAssumptions: text(formData, "risksAssumptions"),
    },
  });

  await logProjectActivity(projectId, "prd", "Product blueprint updated");
  revalidateStudio(project.slug);
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
