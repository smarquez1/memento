import { useEffect, useRef, useState } from "react"
import { createTask, type Task, type TaskEffort, type TaskPriority } from "@memento/core"

interface TaskComposerProps {
  onClose: () => void
  onSave: (task: Task) => Promise<void>
}

export function TaskComposer({ onClose, onSave }: TaskComposerProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [when, setWhen] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("none")
  const [effort, setEffort] = useState<TaskEffort>("none")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    openRef.current = document.activeElement as HTMLButtonElement
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const task = createTask(
        { title, description, dueDate: when.trim() || null, priority, effort },
        crypto.randomUUID(),
        new Date().toISOString(),
      )
      setSaving(true)
      await onSave(task)
      setTitle("")
      setDescription("")
      setWhen("")
      setPriority("none")
      setEffort("none")
      handleClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save task")
      titleRef.current?.focus()
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    openRef.current?.focus()
    onClose()
  }

  const inputClass =
    "w-full rounded-lg border border-[#303037] bg-[#19191d] px-4 py-3 text-sm text-[#f4f1eb] placeholder:text-[#85858c] focus:border-[#f4f1eb] focus:outline-none"

  return (
    <div
      ref={backdropRef}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === backdropRef.current) handleClose()
      }}
      className="fixed inset-0 z-40 bg-black/60"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New task"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl rounded-t-2xl border-t border-[#303037] bg-[#19191d] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <form onSubmit={handleSubmit} noValidate>
          <h2 className="mb-4 text-lg font-semibold text-[#f4f1eb]">New task</h2>

          <div className="mb-4">
            <label htmlFor="composer-title" className="mb-1 block text-xs text-[#85858c]">
              Title
            </label>
            <input
              id="composer-title"
              ref={titleRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="composer-description" className="mb-1 block text-xs text-[#85858c]">
              Description
            </label>
            <textarea
              id="composer-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="composer-when" className="mb-1 block text-xs text-[#85858c]">
              When
            </label>
            <input
              id="composer-when"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              placeholder="YYYY-MM-DD"
              className={inputClass}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="composer-priority" className="mb-1 block text-xs text-[#85858c]">
                Priority
              </label>
              <select
                id="composer-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="composer-effort" className="mb-1 block text-xs text-[#85858c]">
                Effort
              </label>
              <select
                id="composer-effort"
                value={effort}
                onChange={(event) => setEffort(event.target.value as TaskEffort)}
                className={inputClass}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="min-h-11 flex-1 rounded-lg border border-[#303037] font-medium text-[#f4f1eb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 flex-1 rounded-lg bg-[#f4f1eb] font-medium text-[#101012] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}