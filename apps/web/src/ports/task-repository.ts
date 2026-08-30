import type { Task } from "@memento/core";

export interface TaskRepository {
  list(): Promise<Task[]>;
  get(id: string): Promise<Task | undefined>;
  put(task: Task): Promise<void>;
  remove(id: string): Promise<void>;
  reset(): Promise<void>;
}
