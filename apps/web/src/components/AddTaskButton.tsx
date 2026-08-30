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
      className="fixed right-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f1eb] font-light text-3xl text-[#101012] shadow-black/40 shadow-lg"
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}
