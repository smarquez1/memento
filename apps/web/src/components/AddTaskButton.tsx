interface AddTaskButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  onClick: () => void;
}

export function AddTaskButton({ ref, onClick }: AddTaskButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Add task"
      onClick={onClick}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f1eb] text-3xl font-light text-[#101012] shadow-lg shadow-black/40"
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}
