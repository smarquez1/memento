import { describe, expect, it } from "vitest"
import {
  completeTask,
  createTask,
  isTaskDueOn,
  isTaskInInbox,
  rescheduleTask,
  undoTask,
  type Task,
} from "./task.js"

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

describe("task lifecycle", () => {
  it("creates a normalized active task", () => {
    expect(
      createTask(
        { title: "  Write a note  ", description: "  Keep it short ", dueDate: null },
        "task-2",
        "2026-08-30T10:00:00.000Z",
      ),
    ).toEqual({
      id: "task-2",
      title: "Write a note",
      description: "Keep it short",
      dueDate: null,
      priority: "none",
      effort: "none",
      status: "active",
      completedAt: null,
      createdAt: "2026-08-30T10:00:00.000Z",
      updatedAt: "2026-08-30T10:00:00.000Z",
    })
  })

  it("requires a non-empty title", () => {
    expect(() => createTask({ title: "   " }, "task-2", "2026-08-30T10:00:00.000Z")).toThrow(
      "Task title is required",
    )
  })

  it("completes and undoes a task without mutating the original", () => {
    const completed = completeTask(task, "2026-08-30T18:00:00.000Z")
    const active = undoTask(completed, "2026-08-30T18:05:00.000Z")

    expect(completed.status).toBe("completed")
    expect(completed.completedAt).toBe("2026-08-30T18:00:00.000Z")
    expect(active.status).toBe("active")
    expect(active.completedAt).toBeNull()
    expect(task.status).toBe("active")
  })

  it("reschedules a task by changing only its due date and update time", () => {
    expect(rescheduleTask(task, "2026-09-01", "2026-08-30T11:00:00.000Z")).toEqual({
      ...task,
      dueDate: "2026-09-01",
      updatedAt: "2026-08-30T11:00:00.000Z",
    })
  })
})
