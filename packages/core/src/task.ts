export type TaskPriority = "none" | "low" | "medium" | "high";

export type TaskEffort = "none" | "low" | "medium" | "high";

export type TaskStatus = "active" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  effort: TaskEffort;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  effort?: TaskEffort;
}

export function createTask(input: CreateTaskInput, id: string, now: string): Task {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Task title is required");
  }

  return {
    id,
    title,
    description: input.description?.trim() ?? "",
    dueDate: input.dueDate ?? null,
    priority: input.priority ?? "none",
    effort: input.effort ?? "none",
    status: "active",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function completeTask(task: Task, completedAt: string): Task {
  return {
    ...task,
    status: "completed",
    completedAt,
    updatedAt: completedAt,
  };
}

export function undoTask(task: Task, updatedAt: string): Task {
  return {
    ...task,
    status: "active",
    completedAt: null,
    updatedAt,
  };
}

export function rescheduleTask(task: Task, dueDate: string | null, updatedAt: string): Task {
  return {
    ...task,
    dueDate,
    updatedAt,
  };
}

export function isTaskDueOn(task: Task, date: string): boolean {
  return task.dueDate === date;
}

export function isTaskInInbox(task: Task): boolean {
  return task.status === "active" && task.dueDate === null;
}
