export type TaskPriority = "none" | "low" | "medium" | "high"

export type TaskEffort = "none" | "low" | "medium" | "high"

export type TaskStatus = "active" | "completed"

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string | null
  priority: TaskPriority
  effort: TaskEffort
  status: TaskStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export function isTaskDueOn(task: Task, date: string): boolean {
  return task.dueDate === date
}

export function isTaskInInbox(task: Task): boolean {
  return task.status === "active" && task.dueDate === null
}
