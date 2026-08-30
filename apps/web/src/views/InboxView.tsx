import type { Task } from "@memento/core"
import { isTaskInInbox } from "@memento/core"
import { TaskRow } from "../components/TaskRow.js"

export function InboxView({ tasks }: { tasks: Task[] }) {
  const inbox = tasks.filter(isTaskInInbox)
  return (
    <section>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Inbox</h1>
      <p className="mb-6 text-sm text-[#85858c]">
        {inbox.length} {inbox.length === 1 ? "task" : "tasks"} without a date
      </p>
      {inbox.length === 0 ? (
        <p className="text-sm text-[#85858c]">Nothing here yet.</p>
      ) : (
        <ul className="list-none p-0">
          {inbox.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  )
}