import type { Task } from "@memento/core";
import { expect, type Page, test } from "@playwright/test";
import { resetIndexedDB } from "./helpers/reset-db.js";
import { seedTasks } from "./helpers/seed-db.js";

const NOW = "2026-08-30T12:00:00.000Z";
const TODAY = "2026-08-30";

function task(id: string, title: string, dueDate: string | null): Task {
  return {
    id,
    title,
    description: "",
    dueDate,
    priority: "none",
    effort: "none",
    status: "active",
    completedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

async function openCleanApp(page: Page) {
  await page.clock.setFixedTime(new Date(NOW));
  await page.goto("/");
  await resetIndexedDB(page);
  await page.reload();
}

test.describe("task view scenarios", () => {
  test("shows an empty state in Inbox, Today, and Upcoming", async ({ page }) => {
    await openCleanApp(page);

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("button", { name: "Inbox" })
      .click();
    await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
    await expect(page.getByText("Nothing here yet.")).toBeVisible();

    await page.getByRole("button", { name: "Today" }).click();
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByText("A calm day. Nothing scheduled.")).toBeVisible();

    await page.getByRole("button", { name: "Upcoming" }).click();
    await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
    await expect(page.getByText("Nothing scheduled ahead.")).toBeVisible();
  });

  test("filters today, overdue, inbox, and upcoming tasks by view", async ({ page }) => {
    await page.clock.setFixedTime(new Date(NOW));
    await page.goto("/");
    await resetIndexedDB(page);
    await seedTasks(page, [
      task("today", "Today task", TODAY),
      task("overdue", "Overdue task", "2026-08-29"),
      task("inbox", "Inbox task", null),
      task("future", "Future task", "2026-09-01"),
    ]);
    await page.reload();

    await expect(page.getByText("Today task")).toBeVisible();
    await expect(page.getByText("Overdue task")).toBeHidden();
    await expect(page.getByText("Inbox task")).toBeHidden();
    await expect(page.getByText("Future task")).toBeHidden();

    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("button", { name: "Inbox" }).click();
    await expect(page.getByText("Inbox task")).toBeVisible();
    await expect(page.getByText("Today task")).toBeHidden();

    await nav.getByRole("button", { name: "Upcoming" }).click();
    await expect(page.getByText("Future task")).toBeVisible();
    await expect(page.getByText("Inbox task")).toBeHidden();
    await expect(page.getByText("Today task")).toBeHidden();
  });

  test("preserves seeded tasks while navigating between views", async ({ page }) => {
    await page.clock.setFixedTime(new Date(NOW));
    await page.goto("/");
    await resetIndexedDB(page);
    await seedTasks(page, [task("inbox", "Remember this", null)]);
    await page.reload();

    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("button", { name: "Inbox" }).click();
    await expect(page.getByText("Remember this")).toBeVisible();
    await nav.getByRole("button", { name: "Today" }).click();
    await nav.getByRole("button", { name: "Inbox" }).click();
    await expect(page.getByText("Remember this")).toBeVisible();
  });

  test("completes, undoes, and lists a task in Done today", async ({ page }) => {
    await page.clock.setFixedTime(new Date(NOW));
    await page.goto("/");
    await resetIndexedDB(page);
    await seedTasks(page, [task("complete", "Finish this", TODAY)]);
    await page.reload();

    const completeButton = page.getByRole("button", { name: "Complete Finish this" });
    await completeButton.click();
    await expect(page.getByRole("button", { name: "Undo Finish this" })).toBeVisible();
    await expect(page.getByText("Done today (1)")).toBeVisible();

    await page.getByText("Done today (1)").click();
    await expect(page.getByText("Finish this")).toHaveCount(2);

    await page.getByRole("button", { name: "Undo Finish this" }).first().click();
    await expect(page.getByRole("button", { name: "Complete Finish this" })).toBeVisible();
    await expect(page.getByText("Done today (0)")).toBeVisible();
  });

  test("confirms task deletion and keeps the task when cancelled", async ({ page }) => {
    await page.clock.setFixedTime(new Date(NOW));
    await page.goto("/");
    await resetIndexedDB(page);
    await seedTasks(page, [task("delete", "Remove this", null)]);
    await page.reload();
    await page.getByRole("button", { name: "Inbox" }).click();

    await page.getByRole("button", { name: "Delete Remove this" }).click();
    const dialog = page.getByRole("alertdialog", { name: "Delete task?" });
    await expect(dialog).toContainText("Remove this");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Remove this")).toBeVisible();

    await page.getByRole("button", { name: "Delete Remove this" }).click();
    await page
      .getByRole("alertdialog", { name: "Delete task?" })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByText("Remove this")).toBeHidden();
  });
});
