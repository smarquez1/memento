import type { Task } from "@memento/core";
import { isTaskInInbox } from "@memento/core";
import { TaskRow } from "../components/TaskRow.js";

export function InboxView({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
  const inbox = tasks.filter(isTaskInInbox);
  return (
    <section>
      <h1 className="mb-1 font-bold text-3xl tracking-tight">Inbox</h1>
      <p className="mb-6 text-[#85858c] text-sm">
        {inbox.length} {inbox.length === 1 ? "task" : "tasks"} without a date
      </p>
      {inbox.length === 0 ? (
        <p className="text-[#85858c] text-sm">Nothing here yet.</p>
      ) : (
        <ul className="list-none p-0">
          {inbox.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </section>
  );
}
