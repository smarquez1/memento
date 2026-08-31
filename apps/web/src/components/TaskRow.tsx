import type { Task } from "@memento/core";
import { useState } from "react";

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function confirmDelete() {
    setConfirmingDelete(false);
    await onDelete(task);
  }

  return (
    <li className="relative flex min-h-16 items-center gap-3 border-[#303037] border-b py-3">
      <button
        type="button"
        aria-label={task.status === "completed" ? `Undo ${task.title}` : `Complete ${task.title}`}
        aria-pressed={task.status === "completed"}
        onClick={() => onToggle(task)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs focus-visible:outline-2 focus-visible:outline-[#f4f1eb] focus-visible:outline-offset-2"
      >
        <span
          aria-hidden="true"
          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-xs ${
            task.status === "completed"
              ? "border-[#f4f1eb] bg-[#f4f1eb] text-[#101012]"
              : "border-[#303037]"
          }`}
        >
          {task.status === "completed" ? "✓" : ""}
        </span>
      </button>
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
      <button
        type="button"
        aria-label={`Delete ${task.title}`}
        onClick={() => setConfirmingDelete(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-[#85858c] text-lg focus-visible:outline-2 focus-visible:outline-[#f4f1eb] focus-visible:outline-offset-2"
      >
        <span aria-hidden="true">×</span>
      </button>
      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${task.id}`}
          className="absolute inset-x-0 z-10 rounded-lg border border-[#303037] bg-[#18181b] p-4 shadow-xl"
        >
          <h2 id={`delete-title-${task.id}`} className="font-semibold text-sm">
            Delete task?
          </h2>
          <p className="mt-1 text-[#85858c] text-sm">Delete “{task.title}”?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="min-h-11 rounded px-4 text-[#85858c] text-sm focus-visible:outline-2 focus-visible:outline-[#f4f1eb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              className="min-h-11 rounded bg-[#f4f1eb] px-4 font-medium text-[#101012] text-sm focus-visible:outline-2 focus-visible:outline-[#f4f1eb] focus-visible:outline-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
