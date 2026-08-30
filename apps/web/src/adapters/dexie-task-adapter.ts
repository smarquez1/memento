import type { Task } from "@memento/core";
import Dexie, { type EntityTable } from "dexie";
import type { TaskRepository } from "../ports/task-repository.js";

export class DexieTaskAdapter extends Dexie implements TaskRepository {
  tasks!: EntityTable<Task, "id">;

  constructor(dbName = "memento") {
    super(dbName);
    this.version(1).stores({
      tasks: "id, dueDate, status, createdAt, completedAt",
    });
  }

  async list(): Promise<Task[]> {
    return this.tasks.toArray();
  }

  async get(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async put(task: Task): Promise<void> {
    await this.tasks.put(task);
  }

  async remove(id: string): Promise<void> {
    await this.tasks.delete(id);
  }

  async clear(): Promise<void> {
    await this.tasks.clear();
  }

  async reset(): Promise<void> {
    await this.clear();
  }
}
