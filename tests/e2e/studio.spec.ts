import { expect, test } from "@playwright/test";

function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}`;
}

async function completeIntake(page: import("@playwright/test").Page, name: string) {
  await page.goto("/projects/new");
  await page.getByLabel("Project name").fill(name);
  await page.getByLabel("One-sentence concept").fill("An AI-assisted workspace for shipping MVPs.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Audience & problem" })).toBeVisible();

  await page.getByLabel("Target user").fill("Indie founders and studio leads");
  await page.getByLabel("Problem being solved").fill("Ideas stall before they become shippable products.");
  await page.getByLabel("Desired platform").selectOption("Web app");
  await page.getByLabel("Business model").selectOption("Subscription");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Product shape" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create project from intake" })).toBeVisible();

  await page.getByLabel("Must-have features").fill("Intake, blueprint generation, design DNA, build pack");
  await page.getByLabel("Visual inspirations").fill("Linear and Notion calm tooling");
  await page.getByLabel("Technical preferences").fill("Next.js, Prisma, TypeScript");
  await page.getByLabel("Constraints").fill("Must work in mock AI mode without an API key");
  await page.getByRole("button", { name: "Create project from intake" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

test("dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Studio dashboard" })).toBeVisible();
  await expect(page.getByText("Active projects", { exact: true })).toBeVisible();
  await expect(page.getByText("Build queue preview", { exact: true })).toBeVisible();
});

test("project intake", async ({ page }) => {
  const name = uniqueName("Intake Project");
  await completeIntake(page, name);
  await expect(page.getByText("AI intake answers")).toBeVisible();
  await expect(page.getByText("Indie founders and studio leads")).toBeVisible();
});

test("create project", async ({ page }) => {
  const name = uniqueName("Playwright Project");
  await page.goto("/projects");
  await page.getByRole("main").getByRole("link", { name: "New project" }).click();
  await expect(page).toHaveURL(/\/projects\/new$/);

  await page.getByLabel("Project name").fill(name);
  await page.getByLabel("One-sentence concept").fill("Created by the Sprint 3 E2E suite.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Target user").fill("Studio operators");
  await page.getByLabel("Problem being solved").fill("Need a guided intake path.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Must-have features").fill("Guided intake and project creation");
  await page.getByRole("button", { name: "Create project from intake" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.goto("/projects");
  await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
});

test("edit project", async ({ page }) => {
  const name = uniqueName("Editable Project");
  const updatedName = `${name} Updated`;

  await completeIntake(page, name);

  await page.getByLabel("Project name").fill(updatedName);
  await page.getByLabel("Next best action").fill("Validate the edit flow.");
  await page.getByLabel("Priority").selectOption("High");
  await page.getByLabel("Stage").selectOption("PRD");
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  await expect(page.getByText("Validate the edit flow.")).toBeVisible();
});

test("generate and edit blueprint in mock mode", async ({ page }) => {
  const name = uniqueName("Blueprint Project");
  await completeIntake(page, name);

  await page.goto("/blueprint");
  await page.getByRole("tab", { name }).click();
  const panel = page.getByRole("tabpanel");
  await panel.getByRole("button", { name: "Generate Blueprint" }).click();
  await expect(panel.getByText(/Generated with mock provider/i)).toBeVisible();

  const vision = panel.locator('textarea[name="vision"]');
  await expect(vision).not.toHaveValue("");
  await vision.fill("Edited vision for Playwright verification.");
  await expect(vision).toHaveValue("Edited vision for Playwright verification.");
  await panel.getByRole("button", { name: "Save blueprint" }).click();
  await expect(panel.locator('textarea[name="vision"]')).toHaveValue(
    "Edited vision for Playwright verification."
  );
});

test("add Design DNA inspiration", async ({ page }) => {
  const name = uniqueName("DNA Project");
  await completeIntake(page, name);

  await page.goto("/design-dna");
  await page.getByRole("tab", { name }).click();
  const panel = page.getByRole("tabpanel");

  const form = panel.locator("form").filter({ has: page.getByRole("button", { name: "Add inspiration" }) });
  await form.getByLabel("Source URL").fill("https://example.com/inspiration");
  await form.getByLabel("Image / screenshot reference").fill("hero-reference.png");
  await form.getByLabel("Category").selectOption("typography");
  await form.getByLabel("What you like about it").fill("Confident display type with calm body copy");
  await form.getByLabel("Notes").fill("Use for marketing and empty states.");
  await form.getByRole("button", { name: "Add inspiration" }).click();

  await expect(panel.getByText("Confident display type with calm body copy")).toBeVisible();
  await expect(panel.locator("div").filter({ hasText: /^Typography$/ }).first()).toBeVisible();
});

test("generate build pack", async ({ page }) => {
  const name = uniqueName("Build Pack Project");
  await completeIntake(page, name);

  await page.goto("/build-pack");
  await page.getByRole("tab", { name }).click();
  const panel = page.getByRole("tabpanel");
  await panel.getByRole("button", { name: "Generate Build Pack" }).click();
  await expect(panel.getByText(/Generated with mock provider/i)).toBeVisible();
  await expect(panel.locator('textarea[name="codingAgentPrompt"]')).not.toHaveValue("");
});

test("copy prompt feedback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/prompt-library");

  const firstCard = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Discovery" }) })
    .locator(".flex.h-full.flex-col")
    .first();
  await firstCard.getByRole("button", { name: "Copy Prompt" }).click();
  await expect(firstCard.getByRole("button", { name: "Copied to clipboard" })).toBeVisible();
});

test("toggle QA item", async ({ page }) => {
  await page.goto("/qa-checklist");
  const button = page.getByRole("button", { name: /Layout works from 360px to 1440px/ });
  const struck = page.locator(".line-through", { hasText: "Layout works from 360px to 1440px" });

  if ((await struck.count()) === 0) {
    await button.click();
  }

  await expect(struck).toBeVisible({ timeout: 10_000 });
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

  const card = page.locator(".flex.h-full.flex-col").filter({ hasText: title });
  await expect(card.getByText(title)).toBeVisible();
  await expect(card.locator("pre")).toContainText("Review {{feature}} for risks");
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
