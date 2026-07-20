"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { STAGES, stageProgress } from "@/lib/constants";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const stage = String(formData.get("stage") ?? "Idea");
  const priority = String(formData.get("priority") ?? "Medium");
  const nextAction = String(formData.get("nextAction") ?? "").trim();

  if (!name) {
    return { ok: false, error: "Project name is required." };
  }

  const safeStage = STAGES.includes(stage as never) ? stage : "Idea";
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
      priority,
      progress: stageProgress(safeStage),
      nextAction: nextAction || "Define the first discovery step",
      color,
    },
  });

  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: "idea",
      message: `Project "${name}" created`,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true, id: project.id };
}

export async function toggleQaItem(id: string, checked: boolean) {
  const item = await prisma.qaItem.update({
    where: { id },
    data: { checked },
  });

  await prisma.activity.create({
    data: {
      projectId: item.projectId,
      type: "qa",
      message: checked
        ? `QA item completed: ${item.label}`
        : `QA item reopened: ${item.label}`,
    },
  });

  revalidatePath("/qa-checklist");
  revalidatePath("/");
  return { ok: true };
}

export async function advanceStage(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: "Project not found." };

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

  await prisma.activity.create({
    data: {
      projectId,
      type: "milestone",
      message: `Advanced to ${nextStage}`,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return { ok: true };
}
