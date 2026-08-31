import { completeTask, type Task, undoTask } from "@memento/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { DexieTaskAdapter } from "./adapters/dexie-task-adapter.js";
import { AddTaskButton } from "./components/AddTaskButton.js";
import { BottomNav } from "./components/BottomNav.js";
import { TaskComposer } from "./components/TaskComposer.js";
import { InboxView } from "./views/InboxView.js";
import { TodayView } from "./views/TodayView.js";
import { UpcomingView } from "./views/UpcomingView.js";

const repository = new DexieTaskAdapter();

export type ViewId = "inbox" | "today" | "upcoming";

export function App() {
  const [view, setView] = useState<ViewId>("today");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const composerWasOpen = useRef(false);

  const loadTasks = useCallback(async () => {
    setTasks(await repository.list());
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!composerOpen && composerWasOpen.current) {
      composerWasOpen.current = false;
      addButtonRef.current?.focus();
    }
  }, [composerOpen]);

  function openComposer() {
    composerWasOpen.current = true;
    setComposerOpen(true);
  }

  async function toggleTask(task: Task) {
    const timestamp = new Date().toISOString();
    await repository.put(
      task.status === "completed" ? undoTask(task, timestamp) : completeTask(task, timestamp),
    );
    await loadTasks();
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[#f4f1eb]">
      <div className="mx-auto w-full max-w-xl">
        <main className="px-6 pt-8 pb-40">
          {view === "inbox" && <InboxView tasks={tasks} onToggle={toggleTask} />}
          {view === "today" && <TodayView tasks={tasks} onToggle={toggleTask} />}
          {view === "upcoming" && <UpcomingView tasks={tasks} onToggle={toggleTask} />}
        </main>

        <AddTaskButton ref={addButtonRef} onClick={openComposer} />

        <BottomNav view={view} onSelect={setView} />

        {composerOpen && (
          <TaskComposer
            onClose={() => setComposerOpen(false)}
            onSave={async (task: Task) => {
              await repository.put(task);
              await loadTasks();
            }}
          />
        )}
      </div>
    </div>
  );
}
