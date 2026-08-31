import type { Task } from "@memento/core";
import { TaskRow } from "../components/TaskRow.js";

export function UpcomingView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = tasks
    .filter((task) => task.dueDate !== null && task.dueDate > today)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  return (
    <section>
      <h1 className="mb-1 font-bold text-3xl tracking-tight">Upcoming</h1>
      <p className="mb-6 text-[#85858c] text-sm">
        {upcoming.length} {upcoming.length === 1 ? "task" : "tasks"} ahead
      </p>
      {upcoming.length === 0 ? (
        <p className="text-[#85858c] text-sm">Nothing scheduled ahead.</p>
      ) : (
        <ul className="list-none p-0">
          {upcoming.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
