import type { Task } from "@memento/core";
import { isTaskDueOn } from "@memento/core";
import { TaskRow } from "../components/TaskRow.js";

export function TodayView({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => isTaskDueOn(task, today));
  const completedToday = tasks.filter(
    (task) => task.status === "completed" && task.completedAt?.slice(0, 10) === today,
  );
  return (
    <section>
      <h1 className="mb-1 font-bold text-3xl tracking-tight">Today</h1>
      <p className="mb-6 text-[#85858c] text-sm">{today}</p>
      {todayTasks.length === 0 ? (
        <p className="text-[#85858c] text-sm">A calm day. Nothing scheduled.</p>
      ) : (
        <ul className="list-none p-0">
          {todayTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </ul>
      )}
      <details className="mt-8 border-[#303037] border-t pt-4">
        <summary className="cursor-pointer list-none font-medium text-sm [&::-webkit-details-marker]:hidden">
          Done today ({completedToday.length})
        </summary>
        <div className="pt-2">
          {completedToday.length === 0 ? (
            <p className="text-[#85858c] text-sm">Nothing completed yet.</p>
          ) : (
            <ul className="list-none p-0">
              {completedToday.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} />
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
