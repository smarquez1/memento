import { describe, expect, it } from "vitest"
import { isTaskDueOn, isTaskInInbox, type Task } from "./task.js"

const task: Task = {
  id: "task-1",
  title: "Write a note",
  description: "",
  dueDate: "2026-08-30",
  priority: "none",
  effort: "none",
  status: "active",
  completedAt: null,
  createdAt: "2026-08-30T09:00:00.000Z",
  updatedAt: "2026-08-30T09:00:00.000Z",
}

describe("task views", () => {
  it("matches a task by its calendar date", () => {
    expect(isTaskDueOn(task, "2026-08-30")).toBe(true)
    expect(isTaskDueOn(task, "2026-08-31")).toBe(false)
  })

  it("keeps undated active tasks in Inbox", () => {
    expect(isTaskInInbox({ ...task, dueDate: null })).toBe(true)
    expect(isTaskInInbox(task)).toBe(false)
    expect(isTaskInInbox({ ...task, dueDate: null, status: "completed" })).toBe(false)
  })
})
