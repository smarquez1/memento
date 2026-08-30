import type { ViewId } from "../App.js";

const views: { id: ViewId; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
];

interface BottomNavProps {
  view: ViewId;
  onSelect: (view: ViewId) => void;
}

export function BottomNav({ view, onSelect }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[#303037] bg-[#101012]/95 backdrop-blur supports-[backdrop-filter]:bg-[#101012]/85"
    >
      <div className="mx-auto flex w-full max-w-xl items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {views.map((item) => {
          const selected = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                selected ? "text-[#f4f1eb]" : "text-[#85858c]"
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {item.id === "inbox" ? "▦" : item.id === "today" ? "○" : "▤"}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
