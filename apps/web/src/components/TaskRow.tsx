import type { Task } from "@memento/core";

export function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex min-h-16 items-center gap-3 border-[#303037] border-b py-3">
      <span
        aria-hidden="true"
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 text-xs ${
          task.status === "completed"
            ? "border-[#f4f1eb] bg-[#f4f1eb] text-[#101012]"
            : "border-[#303037]"
        }`}
      >
        {task.status === "completed" ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${task.status === "completed" ? "text-[#85858c] line-through" : "text-[#f4f1eb]"}`}
        >
          {task.title}
        </p>
        {(task.dueDate || task.description) && (
          <p className="mt-0.5 truncate text-[#85858c] text-xs">
            {[task.dueDate, task.description].filter(Boolean).join("  ·  ")}
          </p>
        )}
      </div>
    </li>
  );
}
