import { expect, test } from "@playwright/test"

test("starts the mobile app shell", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-30T12:00:00.000Z"))
  await page.goto("/")

  await expect(page).toHaveTitle("Memento")
  await expect(page.getByRole("main")).toContainText("Memento")
  await expect(page.getByRole("heading", { name: "A calmer way to get things done." })).toBeVisible()
})
