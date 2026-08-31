import type { Task } from "@memento/core";
import type { Page } from "@playwright/test";

export async function seedTasks(page: Page, tasks: Task[]): Promise<void> {
  await page.evaluate((seededTasks) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("memento");

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("tasks")) {
          database.createObjectStore("tasks", { keyPath: "id" });
        }
      };

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction("tasks", "readwrite");
        const store = transaction.objectStore("tasks");
        for (const task of seededTasks) store.put(task);
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, tasks);
}
