import { expect, test } from "@playwright/test";
import { resetIndexedDB } from "./helpers/reset-db.js";

test("starts the mobile app shell with navigation", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-30T12:00:00.000Z"));
  await page.goto("/");
  await resetIndexedDB(page);
  await page.reload();

  await expect(page).toHaveTitle("Memento");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("button", { name: "Inbox" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Today" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Upcoming" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add task" })).toBeVisible();
});
