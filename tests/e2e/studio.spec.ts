import { expect, test } from "@playwright/test";

function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}`;
}

test("dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Studio dashboard" })).toBeVisible();
  await expect(page.getByText("Active projects")).toBeVisible();
  await expect(page.getByText("Build queue preview")).toBeVisible();
});

test("create project", async ({ page }) => {
  const name = uniqueName("Playwright Project");

  await page.goto("/projects");
  await page.getByRole("main").getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Project name").fill(name);
  await page.getByLabel("One-line summary").fill("Created by the Sprint 2 E2E suite.");
  await page.getByLabel("Next best action").fill("Confirm the generated project appears.");
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
});

test("edit project", async ({ page }) => {
  const name = uniqueName("Editable Project");
  const updatedName = `${name} Updated`;

  await page.goto("/projects");
  await page.getByRole("main").getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Project name").fill(name);
  await page.getByLabel("One-line summary").fill("Ready to be edited.");
  await page.getByRole("button", { name: "Create project" }).click();
  await page.getByRole("link", { name: new RegExp(name) }).click();

  await page.getByLabel("Project name").fill(updatedName);
  await page.getByLabel("Next best action").fill("Validate the edit flow.");
  await page.getByLabel("Priority").selectOption("High");
  await page.getByLabel("Stage").selectOption("PRD");
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  await expect(page.getByText("Validate the edit flow.")).toBeVisible();
});

test("toggle QA item", async ({ page }) => {
  await page.goto("/qa-checklist");
  await page.getByRole("button", { name: /Layout works from 360px to 1440px/ }).click();

  await expect(
    page.locator(".line-through", { hasText: "Layout works from 360px to 1440px" })
  ).toBeVisible();
});

test("create prompt", async ({ page }) => {
  const title = uniqueName("Playwright Prompt");
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Create prompt" }) });

  await page.goto("/prompt-library");
  await form.getByLabel("Title").fill(title);
  await form.getByLabel("Category").selectOption("QA");
  await form.getByLabel("Prompt body").fill("Review {{feature}} for risks, gaps, and edge cases.");
  await form.getByLabel("Tags").fill("qa,playwright");
  await form.getByRole("button", { name: "Create prompt" }).click();

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.locator("pre", { hasText: "Review {{feature}} for risks" })).toBeVisible();
});

test("create build queue task", async ({ page }) => {
  const title = uniqueName("Playwright Build Task");
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Create task" }) });

  await page.goto("/build-queue");
  await form.getByLabel("Task title").fill(title);
  await form.getByLabel("Status").selectOption("Ready");
  await form.getByLabel("Priority").selectOption("High");
  await form.getByLabel("Estimate").fill("S");
  await form.getByRole("button", { name: "Create task" }).click();

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.locator("div", { hasText: /^Ready$/ }).first()).toBeVisible();
});
