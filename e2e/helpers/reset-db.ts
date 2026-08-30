import type { Page } from "@playwright/test"

export async function resetIndexedDB(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("memento")
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error("Failed to delete IndexedDB"))
      request.onblocked = () => reject(new Error("IndexedDB delete blocked"))
    })
  })
}