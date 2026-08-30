import type { Task } from "@memento/core";
import { isTaskDueOn } from "@memento/core";
import { TaskRow } from "../components/TaskRow.js";

export function TodayView({ tasks }: { tasks: Task[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => isTaskDueOn(task, today));
  return (
    <section>
      <h1 className="mb-1 font-bold text-3xl tracking-tight">Today</h1>
      <p className="mb-6 text-[#85858c] text-sm">{today}</p>
      {todayTasks.length === 0 ? (
        <p className="text-[#85858c] text-sm">A calm day. Nothing scheduled.</p>
      ) : (
        <ul className="list-none p-0">
          {todayTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
