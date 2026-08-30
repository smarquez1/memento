import { describe, expect, it, beforeEach, afterEach } from "vitest"
import "fake-indexeddb/auto"
import { DexieTaskAdapter } from "./dexie-task-adapter.js"
import type { Task } from "@memento/core"

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

const db = new DexieTaskAdapter()

beforeEach(async () => {
  await db.reset()
})

afterEach(async () => {
  await db.reset()
})

describe("DexieTaskAdapter", () => {
  it("stores and retrieves a task", async () => {
    await db.put(task)
    await expect(db.get("task-1")).resolves.toEqual(task)
  })

  it("returns undefined for a missing task", async () => {
    await expect(db.get("missing")).resolves.toBeUndefined()
  })

  it("lists all tasks", async () => {
    const t2: Task = { ...task, id: "task-2" }
    await db.put(task)
    await db.put(t2)
    const all = await db.list()
    expect(all).toHaveLength(2)
    expect(all).toEqual(expect.arrayContaining([task, t2]))
  })

  it("replaces a task on put with same id", async () => {
    await db.put(task)
    const updated = { ...task, title: "Updated title" }
    await db.put(updated)
    await expect(db.get("task-1")).resolves.toEqual(updated)
    await expect(db.list()).resolves.toHaveLength(1)
  })

  it("removes a task", async () => {
    await db.put(task)
    await db.remove("task-1")
    await expect(db.get("task-1")).resolves.toBeUndefined()
    await expect(db.list()).resolves.toHaveLength(0)
  })

  it("resets the database", async () => {
    await db.put(task)
    await db.reset()
    await expect(db.list()).resolves.toHaveLength(0)
  })
})