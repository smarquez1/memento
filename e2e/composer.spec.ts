import { expect, test } from "@playwright/test"
import { resetIndexedDB } from "./helpers/reset-db.js"

test("opens the composer, validates input, saves a task, and restores focus", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-30T12:00:00.000Z"))
  await page.goto("/")
  await resetIndexedDB(page)
  await page.reload()

  const addButton = page.getByRole("button", { name: "Add task" })
  await addButton.click()

  const dialog = page.getByRole("dialog", { name: "New task" })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel("Title")).toBeFocused()

  // Empty title shows a visible error and keeps the dialog open.
  await dialog.getByRole("button", { name: "Save" }).click()
  await expect(dialog.getByText("Title is required")).toBeVisible()
  await expect(dialog).toBeVisible()

  // Fill a valid task and save.
  await dialog.getByLabel("Title").fill("Send the project update")
  await dialog.getByLabel("Description").fill("Keep it short")
  await dialog.getByLabel("When").fill("2026-08-30")
  await dialog.getByLabel("Priority").selectOption("high")
  await dialog.getByLabel("Effort").selectOption("medium")
  await dialog.getByRole("button", { name: "Save" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByText("Send the project update")).toBeVisible()
  await expect(addButton).toBeFocused()

  // Cancel closes the sheet and restores focus without saving.
  await addButton.click()
  await dialog.getByLabel("Title").fill("Draft note")
  await dialog.getByRole("button", { name: "Cancel" }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText("Draft note")).toBeHidden()
  await expect(addButton).toBeFocused()
})